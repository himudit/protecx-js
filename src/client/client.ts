import { HttpClient } from "../http";
import { TokenManager } from "../token-manager";
import { AuthResponse, LoginParams, ProtecXConfig, RegisterParams } from "../types";

export class ProtecXClient {
    private http: HttpClient;
    private tokenManager: TokenManager;
    private refreshPromise: Promise<any> | null = null;

    constructor(config: ProtecXConfig) {
        this.tokenManager = new TokenManager(config.persistTokens ?? true);
        this.http = new HttpClient(config, this.tokenManager);
    }

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

    async profile() {
        return this.requestWithAutoRefresh(() => {
            const accessToken = this.tokenManager.getAccessToken();
            return this.http.get("/iam/profile", {
                headers: accessToken
                    ? { Authorization: `Bearer ${accessToken}` }
                    : {}
            });
        });
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

    get currentUserToken() {
        return this.tokenManager.getAccessToken();
    }

    private async requestWithAutoRefresh(
        fn: () => Promise<any>,
        retry = true
    ): Promise<any> {
        try {
            return await fn();
        } catch (error: any) {
            const isExpired = error?.data?.error === "invalid or expired token";

            if (isExpired && retry) {
                try {
                    if (!this.refreshPromise) {
                        this.refreshPromise = this.refresh().finally(() => {
                            this.refreshPromise = null;
                        });
                    }

                    await this.refreshPromise;
                    return await this.requestWithAutoRefresh(fn, false);
                } catch {
                    this.tokenManager.clear();
                    throw new Error("Session expired. Please login again.");
                }
            }

            throw error;
        }
    }
}
