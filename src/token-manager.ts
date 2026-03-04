export class TokenManager {
    private _accessToken: string | null = null;
    private _refreshToken: string | null = null;
    private _persist: boolean;
    private STORAGE_KEY = "protecx_tokens";

    constructor(persist: boolean = false) {
        this._persist = persist;
        if (this._persist && typeof window !== "undefined") {
            this.loadFromStorage();
        }
    }

    setTokens(accessToken: string, refreshToken: string) {
        this._accessToken = accessToken;
        this._refreshToken = refreshToken;

        if (this._persist && typeof window !== "undefined") {
            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify({ accessToken, refreshToken })
            );
        }
    }

    getAccessToken(): string | null {
        return this._accessToken;
    }

    // Refresh token is kept private to the ProtecX logic
    getRefreshTokenInternal(): string | null {
        return this._refreshToken;
    }

    clear() {
        this._accessToken = null;
        this._refreshToken = null;
        if (this._persist && typeof window !== "undefined") {
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }

    private loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const { accessToken, refreshToken } = JSON.parse(stored);
                this._accessToken = accessToken;
                this._refreshToken = refreshToken;
            }
        } catch (e) {
            console.error("Failed to load tokens from storage", e);
        }
    }
}
