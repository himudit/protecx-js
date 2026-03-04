import { HttpClient } from "./http";
import { Auth } from "./auth";
import { TokenManager } from "./token-manager";
import { LoginParams, ProtecXConfig, RegisterParams } from "./types";

export * from "./types";
export * from "./errors";
export { TokenManager } from "./token-manager";

export class ProtecX {
    public auth: Auth;
    private http: HttpClient;
    private tokenManager: TokenManager;

    constructor(config: ProtecXConfig) {
        this.tokenManager = new TokenManager(config.persistTokens);
        this.http = new HttpClient(config, this.tokenManager);
        this.auth = new Auth(this.http, this.tokenManager);
    }

    /**
     * Helper to perform signup directly from the main class
     */
    async signup(params: RegisterParams) {
        return this.auth.signup(params);
    }

    async login(params: LoginParams) {
        return this.auth.login(params);
    }

    async logout() {
        return this.auth.logout();
    }

    async profile() {
        return this.auth.profile();
    }
}

/**
 * Example Usage in a Frontend app:
 * 
 * const protecx = new ProtecX({
 *   baseUrl: "https://api.example.com",
 *   projectId: "project_123",
 *   apiKey: "pk_live_xxx"
 * });
 * 
 * try {
 *   await protecx.signup({
 *     email: "",
 *     password: "123"
 *   });
 * } catch (error) {
 *   if (error instanceof ProtecXError) {
 *     // Unified way to get all errors (field + global)
 *     const allErrors = error.getErrors();
 *     setFormErrors(allErrors); 
 * 
 *     // Or handle them separately
 *     if (error.isValidationError()) {
 *       setFormErrors(error.getAllFieldErrors());
 *     }
 * 
 *     if (error.isGlobalError()) {
 *       showToast(error.message);
 *     }
 *   }
 * }
 */



