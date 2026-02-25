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

    async register(params: RegisterParams): Promise<AuthResponse> {
        return this.signup(params);
    }

    async login(params: LoginParams): Promise<AuthResponse> {
        const response = await this.http.post<AuthResponse>("/iam/login", params);
        if (response.accessToken && response.refreshToken) {
            this.tokenManager.setTokens(response.accessToken, response.refreshToken);
        }
        return response;
    }

    async logout(): Promise<void> {
        try {
            await this.http.post("/iam/logout");
        } finally {
            this.tokenManager.clear();
        }
    }

    get currentUser() {
        return this.tokenManager.getAccessToken();
    }
}

