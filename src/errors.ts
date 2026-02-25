import { ErrorData } from "./types";

export type ProtecXErrorCode =
    | "NETWORK_ERROR"
    | "AUTHENTICATION_ERROR"
    | "VALIDATION_ERROR"
    | "RATE_LIMIT_ERROR"
    | "EXPONENTIAL_BACKOFF_ERROR"
    | "API_ERROR"
    | "UNKNOWN_ERROR";

export class ProtecXError extends Error {
    public readonly code: string;
    public readonly status?: number;
    public readonly data?: ErrorData;

    constructor(message: string, code: ProtecXErrorCode | string, status?: number, data?: ErrorData) {
        super(message);
        this.name = "ProtecXError";
        this.code = code;
        this.status = status;
        this.data = data;

        // Fix prototype chain for custom errors in TypeScript
        Object.setPrototypeOf(this, ProtecXError.prototype);
    }

    /**
     * Checks if the error contains field-level validation errors.
     */
    isValidationError(): boolean {
        return !!(this.data?.errors && Object.keys(this.data.errors).length > 0);
    }

    /**
     * Checks if the error is a global error (single error message in data.error).
     */
    isGlobalError(): boolean {
        return !!this.data?.error;
    }

    /**
     * Gets a specific field error message if it exists.
     */
    getFieldError(field: string): string | undefined {
        return this.data?.errors?.[field];
    }

    /**
     * Gets all field validation errors.
     */
    getAllFieldErrors(): Record<string, string> {
        return this.data?.errors || {};
    }

    /**
     * Gets the error information.
     * Returns the global error string if present (e.g., "Invalid API key"), 
     * otherwise returns the field-level errors object (e.g., { email: "required" }).
     * Fallbacks to the main message if no detailed error info is found.
     */
    getErrors(): string | Record<string, string> {
        if (this.data?.error) {
            return this.data.error;
        }

        const fieldErrors = this.getAllFieldErrors();
        if (Object.keys(fieldErrors).length > 0) {
            return fieldErrors;
        }

        return this.message;
    }

    static fromResponse(message: string, status: number, data?: any): ProtecXError {
        let errorCode: string = "API_ERROR";
        let errorMessage: string = message;

        // Extract error information from data if present
        if (data && typeof data === 'object') {
            // Handle cases where message might be inside data
            errorMessage = data.message || message;

            const errorPayload = data.data || data;

            // Check for specific error types to assign proper error codes
            if (errorPayload.errors) {
                errorCode = "VALIDATION_ERROR";
            } else if (status === 401 || status === 403) {
                errorCode = "AUTHENTICATION_ERROR";
            } else if (status === 429) {
                errorCode = "RATE_LIMIT_ERROR";
            } else if (status === 400) {
                errorCode = "EXPONENTIAL_BACKOFF_ERROR";
            }
        }

        return new ProtecXError(errorMessage, errorCode, status, data?.data || data);
    }

    static networkError(originalError: Error): ProtecXError {
        return new ProtecXError(
            originalError.message || "Network request failed",
            "NETWORK_ERROR"
        );
    }
}

