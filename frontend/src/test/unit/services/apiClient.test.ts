import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiClient } from '../../../services/apiClient';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Request Interceptors', () => {
    it('should add Authorization header when token exists in localStorage', async () => {
      localStorage.setItem('token', 'test-token');

      let capturedHeaders: Record<string, string> = {};
      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ success: true, data: {} });
        })
      );

      await apiClient.get('/test');

      expect(capturedHeaders['authorization']).toBe('Bearer test-token');
    });

    it('should add customer token when admin token is not present', async () => {
      localStorage.setItem('customerToken', 'customer-token');

      let capturedHeaders: Record<string, string> = {};
      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ success: true, data: {} });
        })
      );

      await apiClient.get('/test');

      expect(capturedHeaders['authorization']).toBe('Bearer customer-token');
    });

    it('should prefer admin token over customer token', async () => {
      localStorage.setItem('token', 'admin-token');
      localStorage.setItem('customerToken', 'customer-token');

      let capturedHeaders: Record<string, string> = {};
      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ success: true, data: {} });
        })
      );

      await apiClient.get('/test');

      expect(capturedHeaders['authorization']).toBe('Bearer admin-token');
    });

    it('should add X-Session-Id header when sessionId exists', async () => {
      sessionStorage.setItem('sessionId', 'test-session-123');

      let capturedHeaders: Record<string, string> = {};
      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ success: true, data: {} });
        })
      );

      await apiClient.get('/test');

      expect(capturedHeaders['x-session-id']).toBe('test-session-123');
    });

    it('should not add Authorization header when no token exists', async () => {
      let capturedHeaders: Record<string, string> = {};
      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          capturedHeaders = Object.fromEntries(request.headers.entries());
          return HttpResponse.json({ success: true, data: {} });
        })
      );

      await apiClient.get('/test');

      expect(capturedHeaders['authorization']).toBeUndefined();
    });
  });

  describe('Response Interceptors', () => {
    it('should capture session ID from response headers', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json(
            { success: true, data: {} },
            { headers: { 'X-Session-Id': 'new-session-456' } }
          );
        })
      );

      await apiClient.get('/test');

      expect(sessionStorage.getItem('sessionId')).toBe('new-session-456');
    });

    it('should update existing session ID from response', async () => {
      sessionStorage.setItem('sessionId', 'old-session');

      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json(
            { success: true, data: {} },
            { headers: { 'X-Session-Id': 'updated-session' } }
          );
        })
      );

      await apiClient.get('/test');

      expect(sessionStorage.getItem('sessionId')).toBe('updated-session');
    });
  });

  describe('Error Handling - 401 Redirects', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { href: '/dashboard' },
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        writable: true,
        value: originalLocation,
      });
    });

    it('should redirect to login on 401 for non-auth endpoints', async () => {
      localStorage.setItem('token', 'expired-token');

      server.use(
        http.get('http://localhost:3000/api/protected', () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(apiClient.get('/protected')).rejects.toThrow();

      expect(localStorage.getItem('token')).toBeNull();
      expect(window.location.href).toContain('/login');
      expect(window.location.href).toContain('redirect=');
    });

    it('should not redirect on 401 for login endpoint', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/login', () => {
          return HttpResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      await expect(apiClient.post('/auth/login', { email: 'test@test.com', password: 'wrong' })).rejects.toThrow();

      expect(window.location.href).toBe('/dashboard');
    });

    it('should not redirect on 401 for register endpoint', async () => {
      server.use(
        http.post('http://localhost:3000/api/auth/register', () => {
          return HttpResponse.json(
            { success: false, message: 'Email already exists' },
            { status: 401 }
          );
        })
      );

      await expect(apiClient.post('/auth/register', { email: 'test@test.com' })).rejects.toThrow();

      expect(window.location.href).toBe('/dashboard');
    });

    it('should clear user data on 401 redirect', async () => {
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));
      localStorage.setItem('customerToken', 'customer-token');

      server.use(
        http.get('http://localhost:3000/api/protected', () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(apiClient.get('/protected')).rejects.toThrow();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(localStorage.getItem('customerToken')).toBeNull();
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET request with params', async () => {
      let capturedUrl: string = '';
      server.use(
        http.get('http://localhost:3000/api/test', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ success: true, data: { items: [] } });
        })
      );

      await apiClient.get('/test', { page: 1, limit: 10 });

      expect(capturedUrl).toContain('page=1');
      expect(capturedUrl).toContain('limit=10');
    });

    it('should make POST request with data', async () => {
      let capturedBody: unknown;
      server.use(
        http.post('http://localhost:3000/api/test', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ success: true, data: { id: '1' } });
        })
      );

      await apiClient.post('/test', { name: 'Test Item' });

      expect(capturedBody).toEqual({ name: 'Test Item' });
    });

    it('should make PUT request with data', async () => {
      let capturedBody: unknown;
      server.use(
        http.put('http://localhost:3000/api/test/1', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ success: true, data: { id: '1' } });
        })
      );

      await apiClient.put('/test/1', { name: 'Updated Item' });

      expect(capturedBody).toEqual({ name: 'Updated Item' });
    });

    it('should make PATCH request with data', async () => {
      let capturedBody: unknown;
      server.use(
        http.patch('http://localhost:3000/api/test/1', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({ success: true, data: { id: '1' } });
        })
      );

      await apiClient.patch('/test/1', { name: 'Patched Item' });

      expect(capturedBody).toEqual({ name: 'Patched Item' });
    });

    it('should make DELETE request', async () => {
      server.use(
        http.delete('http://localhost:3000/api/test/1', () => {
          return HttpResponse.json({ success: true, data: {} });
        })
      );

      const response = await apiClient.delete('/test/1');

      expect(response.data.success).toBe(true);
    });
  });

  describe('Error Responses', () => {
    it('should handle 400 Bad Request', async () => {
      server.use(
        http.post('http://localhost:3000/api/test', () => {
          return HttpResponse.json(
            { success: false, message: 'Validation failed' },
            { status: 400 }
          );
        })
      );

      await expect(apiClient.post('/test', {})).rejects.toThrow();
    });

    it('should handle 404 Not Found', async () => {
      server.use(
        http.get('http://localhost:3000/api/test/999', () => {
          return HttpResponse.json(
            { success: false, message: 'Resource not found' },
            { status: 404 }
          );
        })
      );

      await expect(apiClient.get('/test/999')).rejects.toThrow();
    });

    it('should handle 500 Server Error', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(apiClient.get('/test')).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('http://localhost:3000/api/test', () => {
          return HttpResponse.error();
        })
      );

      await expect(apiClient.get('/test')).rejects.toThrow();
    });
  });
});
