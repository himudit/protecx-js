import { HttpClient } from "./http";
import { TokenManager } from "./token-manager";
import { AuthResponse, LoginParams, RefreshParams, RegisterParams } from "./types";
import * as jwt from "jsonwebtoken";

export class Auth {
    constructor(
        private http: HttpClient,
        private tokenManager: TokenManager
    ) { }

    private refreshPromise: Promise<any> | null = null;

    async signup(params: RegisterParams): Promise<AuthResponse> {
        const response = await this.http.post<AuthResponse>("/iam/register", params);
        if (response.accessToken && response.refreshToken) {
            this.tokenManager.setTokens(response.accessToken, response.refreshToken);
        }
        return response;
    }


    async login(params: LoginParams): Promise<AuthResponse> {
        const response = await this.http.post<AuthResponse>("/iam/login", params);
        if (response.accessToken && response.refreshToken) {
            this.tokenManager.setTokens(response.accessToken, response.refreshToken);
        }
        return response;
    }

    async logout(): Promise<void> {
        const accessToken = this.tokenManager.getAccessToken();

        await this.http.post("/iam/logout", {}, {
            headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : {}
        });
        this.tokenManager.clear();
    }

    // async profile() {
    //     const accessToken = this.tokenManager.getAccessToken();

    //     return this.http.get("/iam/profile", {
    //         headers: accessToken
    //             ? { Authorization: `Bearer ${accessToken}` }
    //             : {}
    //     });
    // }

    async profile() {
        return this.requestWithAutoRefresh(() => {
            const accessToken = this.tokenManager.getAccessToken();

            return this.http.get("/iam/profile", {
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {}
            });
        })
    }

    async requestWithAutoRefresh(
        fn: () => Promise<any>,
        retry = true
    ): Promise<any> {
        try {
            return await fn();
        } catch (error: any) {
            const isExpired =
                error?.data?.error === "invalid or expired token";

            if (isExpired && retry) {
                try {
                    // 🔐 lock refresh
                    if (!this.refreshPromise) {
                        this.refreshPromise = this.refresh().finally(() => {
                            this.refreshPromise = null;
                        });
                    }

                    await this.refreshPromise;

                    // 🔁 retry only once
                    return await this.requestWithAutoRefresh(fn, false);
                } catch {
                    // ❌ refresh failed → logout
                    this.tokenManager.clear();
                    throw new Error("Session expired. Please login again.");
                }
            }

            throw error;
        }
    }

    async refresh() {
        const refreshToken = this.tokenManager.getRefreshTokenInternal();
        const params = { refreshToken };
        const response = await this.http.post<AuthResponse>("/iam/refresh", params);
        if (response.accessToken && response.refreshToken) {
            this.tokenManager.setTokens(response.accessToken, response.refreshToken);
        }
        return response;
    }

    verifyToken(publicKeyPEM: string) {
        const tokenString = this.tokenManager.getAccessToken();
        if (!tokenString) return null;

        try {
            // We explicitly specify the algorithms: ['RS256'] to prevent algorithm downgrade attacks
            // The verify method automatically checks expiration (exp), similar to Go's token.Valid
            const decodedClaims = jwt.verify(tokenString, publicKeyPEM, {
                algorithms: ['RS256']
            });

            // If successful, this returns the payload with your custom claims 
            // Example: { userId: 'x', email: 'x', role: 'x', tokenVersion: 1, ... }
            return decodedClaims;
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                console.error("Token has expired");
            } else if (err.name === 'JsonWebTokenError') {
                console.error("Invalid token or signature");
            } else {
                console.error("Failed to verify token", err.message);
            }
            return null;
        }
    }

    get currentUser() {
        return this.tokenManager.getAccessToken();
    }
}

