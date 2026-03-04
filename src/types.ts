export interface ProtecXConfig {
    baseUrl: string;
    projectId: string;
    apiKey: string;
    persistTokens?: boolean;
}

export interface ErrorData {
    error?: string;
    errors?: Record<string, string>;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T & ErrorData;
}

export interface RegisterParams {
    email: string;
    password?: string;
    name?: string;
    [key: string]: any;
}

export interface LoginParams {
    email: string;
    password?: string;
    [key: string]: any;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: any;
    expiresIn?: number;
}

