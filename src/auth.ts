import { HttpClient } from "./http";
import { TokenManager } from "./token-manager";
import { AuthResponse, LoginParams, RegisterParams } from "./types";

export class Auth {
    constructor(
        private http: HttpClient,
        private tokenManager: TokenManager
    ) { }

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
        const refreshToken = this.tokenManager.getRefreshTokenInternal();

        await this.http.post("/iam/logout", {}, {
            headers: refreshToken
                ? { Authorization: `Bearer ${refreshToken}` }
                : {}
        });
        this.tokenManager.clear();
    }

    async profile() {
        const refreshToken = this.tokenManager.getRefreshTokenInternal();

        return this.http.get("/iam/profile", {
            headers: refreshToken
                ? { Authorization: `Bearer ${refreshToken}` }
                : {}
        });
    }

    get currentUser() {
        return this.tokenManager.getAccessToken();
    }
}

