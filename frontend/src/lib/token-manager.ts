/**
 * TokenManager - Centralized token storage and management
 * Following teamatonce pattern for SSR-safe token operations
 */

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const SESSION_ID_KEY = 'guestSessionId';
const STORE_TOKEN_PREFIX = 'storeToken_';

export class TokenManager {
  /**
   * Check if we're in browser environment (SSR-safe)
   */
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /**
   * Get access token from localStorage
   */
  static getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Set access token in localStorage
   */
  static setToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Remove access token from localStorage
   */
  static removeToken(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Get refresh token from localStorage
   */
  static getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Set refresh token in localStorage
   */
  static setRefreshToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  /**
   * Remove refresh token from localStorage
   */
  static removeRefreshToken(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens from localStorage
   */
  static clearAll(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user has a valid token
   */
  static hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Debug helper - Get current token state (for development only)
   */
  static debugTokenState(): { hasToken: boolean; hasRefreshToken: boolean } {
    if (!this.isBrowser()) {
      return { hasToken: false, hasRefreshToken: false };
    }

    return {
      hasToken: !!this.getToken(),
      hasRefreshToken: !!this.getRefreshToken(),
    };
  }

  /**
   * Get or create a guest session ID for cart operations
   */
  static getSessionId(): string {
    if (!this.isBrowser()) return '';

    let sessionId = localStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  /**
   * Clear guest session ID
   */
  static clearSessionId(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(SESSION_ID_KEY);
  }

  /**
   * Get store-specific token
   */
  static getStoreToken(shopId: string): string | null {
    if (!this.isBrowser() || !shopId) return null;
    return localStorage.getItem(`${STORE_TOKEN_PREFIX}${shopId}`);
  }

  /**
   * Check if user has any auth token (main app or store-specific)
   */
  static hasAnyToken(shopId?: string): boolean {
    if (this.hasToken()) return true;
    if (shopId && this.getStoreToken(shopId)) return true;
    return false;
  }
}
