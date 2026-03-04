import { ProtecXError } from "./errors";
import { ProtecXConfig, ApiResponse } from "./types";
import { TokenManager } from "./token-manager";

export class HttpClient {
    private config: ProtecXConfig;
    private tokenManager: TokenManager;

    constructor(config: ProtecXConfig, tokenManager: TokenManager) {
        this.config = config;
        this.tokenManager = tokenManager;
    }

    async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.config.baseUrl.replace(/\/$/, "")}${path}`;

        const headers = new Headers(options.headers);
        if (!headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
        }
        if (!headers.has("x-project-id")) {
            headers.set("x-project-id", this.config.projectId);
        }
        if (!headers.has("x-api-key")) {
            headers.set("x-api-key", this.config.apiKey);
        }

        if (!headers.has("Authorization")) {
            const accessToken = this.tokenManager.getAccessToken();
            if (accessToken) {
                headers.set("Authorization", `Bearer ${accessToken}`);
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            let responseData: ApiResponse<T>;
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                // Handle unexpected non-JSON response
                throw new ProtecXError(
                    `Unexpected response format: ${response.status} ${response.statusText}`,
                    "API_ERROR",
                    response.status,
                    { error: text || "Server returned non-JSON response" }
                );
            }

            // If the server explicitly says success is false, or if HTTP status is not OK
            if (responseData.success === false || !response.ok) {
                throw ProtecXError.fromResponse(
                    responseData.message || response.statusText || "Request failed",
                    response.status,
                    responseData
                );
            }

            // Return the data part of the response if success is true
            // If data is missing but success is true, return an empty object or the responseData itself if appropriate
            // Usually, we want the T data.
            return (responseData.data as T) || ({} as T);
        } catch (error) {
            if (error instanceof ProtecXError) {
                throw error;
            }

            // Handle network failures or other unexpected errors
            throw ProtecXError.networkError(error as Error);
        }
    }

    get<T>(path: string, options?: RequestInit): Promise<T> {
        return this.request<T>(path, { ...options, method: "GET" });
    }

    post<T>(path: string, body?: any, options?: RequestInit): Promise<T> {
        return this.request<T>(path, {
            ...options,
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }
}


