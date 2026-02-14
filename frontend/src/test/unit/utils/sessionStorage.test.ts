import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSessionId,
  setSessionId,
  clearSessionId,
} from '../../../utils/sessionStorage';

describe('sessionStorage', () => {
  const SESSION_ID_KEY = 'cartSessionId';
  const TEST_SESSION_ID = 'test-session-123';

  beforeEach(() => {
    localStorage.clear();
  });

  describe('getSessionId', () => {
    it('should return null when no session ID exists', () => {
      expect(getSessionId()).toBeNull();
    });

    it('should return the session ID when it exists', () => {
      localStorage.setItem(SESSION_ID_KEY, TEST_SESSION_ID);
      expect(getSessionId()).toBe(TEST_SESSION_ID);
    });

    it('should handle different session ID formats', () => {
      const formats = [
        'uuid-format-1234-5678',
        'simpleId',
        'ID_WITH_UNDERSCORES',
        '123456',
      ];

      formats.forEach((id) => {
        localStorage.setItem(SESSION_ID_KEY, id);
        expect(getSessionId()).toBe(id);
      });
    });
  });

  describe('setSessionId', () => {
    it('should set the session ID in localStorage', () => {
      setSessionId(TEST_SESSION_ID);
      expect(localStorage.getItem(SESSION_ID_KEY)).toBe(TEST_SESSION_ID);
    });

    it('should overwrite existing session ID', () => {
      localStorage.setItem(SESSION_ID_KEY, 'old-session');
      setSessionId(TEST_SESSION_ID);
      expect(localStorage.getItem(SESSION_ID_KEY)).toBe(TEST_SESSION_ID);
    });

    it('should handle different session ID formats', () => {
      const formats = [
        'uuid-format-1234-5678',
        'simpleId',
        'ID_WITH_UNDERSCORES',
        '123456',
        'very-long-session-id-with-many-characters-and-special-chars-123',
      ];

      formats.forEach((id) => {
        setSessionId(id);
        expect(localStorage.getItem(SESSION_ID_KEY)).toBe(id);
      });
    });
  });

  describe('clearSessionId', () => {
    it('should remove the session ID from localStorage', () => {
      localStorage.setItem(SESSION_ID_KEY, TEST_SESSION_ID);
      clearSessionId();
      expect(localStorage.getItem(SESSION_ID_KEY)).toBeNull();
    });

    it('should not throw if no session ID exists', () => {
      expect(() => clearSessionId()).not.toThrow();
      expect(localStorage.getItem(SESSION_ID_KEY)).toBeNull();
    });

    it('should only remove the session ID key', () => {
      localStorage.setItem(SESSION_ID_KEY, TEST_SESSION_ID);
      localStorage.setItem('otherKey', 'otherValue');
      localStorage.setItem('anotherKey', 'anotherValue');

      clearSessionId();

      expect(localStorage.getItem(SESSION_ID_KEY)).toBeNull();
      expect(localStorage.getItem('otherKey')).toBe('otherValue');
      expect(localStorage.getItem('anotherKey')).toBe('anotherValue');
    });
  });

  describe('integration', () => {
    it('should complete full session lifecycle', () => {
      // Initially no session
      expect(getSessionId()).toBeNull();

      // Set session
      setSessionId(TEST_SESSION_ID);
      expect(getSessionId()).toBe(TEST_SESSION_ID);

      // Update session
      const newSessionId = 'new-session-456';
      setSessionId(newSessionId);
      expect(getSessionId()).toBe(newSessionId);

      // Clear session
      clearSessionId();
      expect(getSessionId()).toBeNull();
    });

    it('should maintain session across multiple operations', () => {
      setSessionId(TEST_SESSION_ID);
      
      // Multiple reads should return same value
      expect(getSessionId()).toBe(TEST_SESSION_ID);
      expect(getSessionId()).toBe(TEST_SESSION_ID);
      expect(getSessionId()).toBe(TEST_SESSION_ID);
    });
  });
});
