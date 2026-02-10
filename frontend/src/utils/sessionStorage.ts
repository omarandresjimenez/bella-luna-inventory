/**
 * Utility for managing anonymous cart session IDs
 */
const SESSION_ID_KEY = 'cartSessionId';

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

export function setSessionId(sessionId: string): void {
  localStorage.setItem(SESSION_ID_KEY, sessionId);
}

export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}
