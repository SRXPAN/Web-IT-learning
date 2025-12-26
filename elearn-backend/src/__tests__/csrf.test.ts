// src/__tests__/csrf.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { generateCsrfToken, setCsrfToken, validateCsrf } from '../middleware/csrf.js';

describe('generateCsrfToken', () => {
  it('should generate a 64 character hex string', () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(64);
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
  });

  it('should generate unique tokens', () => {
    const tokens = new Set<string>();
    for (let i = 0; i < 100; i++) {
      tokens.add(generateCsrfToken());
    }
    expect(tokens.size).toBe(100);
  });
});

describe('setCsrfToken middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let cookieMock: ReturnType<typeof vi.fn>;
  let jsonMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    cookieMock = vi.fn();
    jsonMock = vi.fn();
    
    mockReq = {};
    mockRes = {
      cookie: cookieMock as unknown as Response['cookie'],
      json: jsonMock as unknown as Response['json'],
    };
  });

  it('should set CSRF cookie and return token in response', () => {
    setCsrfToken(mockReq as Request, mockRes as Response);

    expect(cookieMock).toHaveBeenCalled();
    expect(jsonMock).toHaveBeenCalled();

    // Verify cookie settings
    const [cookieName, cookieValue, cookieOptions] = cookieMock.mock.calls[0];
    expect(cookieName).toBe('csrf_token');
    expect(cookieValue).toHaveLength(64);
    expect(cookieOptions.httpOnly).toBe(false); // JS needs access
    expect(cookieOptions.sameSite).toBe('strict');

    // Verify JSON response
    const [jsonResponse] = jsonMock.mock.calls[0];
    expect(jsonResponse.csrfToken).toBe(cookieValue);
  });
});

describe('validateCsrf middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockNext = vi.fn() as unknown as NextFunction;
    
    mockReq = {
      method: 'POST',
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: statusMock as unknown as Response['status'],
      json: jsonMock as unknown as Response['json'],
    };
  });

  it('should skip validation for GET requests', () => {
    mockReq.method = 'GET';

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should skip validation for HEAD requests', () => {
    mockReq.method = 'HEAD';

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should skip validation for OPTIONS requests', () => {
    mockReq.method = 'OPTIONS';

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 403 when CSRF cookie is missing', () => {
    mockReq.headers = { 'x-csrf-token': 'some-token' };

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'CSRF token missing' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when CSRF header is missing', () => {
    mockReq.cookies = { csrf_token: 'some-token' };

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'CSRF token missing' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when tokens do not match', () => {
    // Use same length tokens for timingSafeEqual
    mockReq.cookies = { csrf_token: 'a'.repeat(64) };
    mockReq.headers = { 'x-csrf-token': 'b'.repeat(64) };

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(403);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'CSRF token invalid' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next() when tokens match', () => {
    const token = generateCsrfToken();
    mockReq.cookies = { csrf_token: token };
    mockReq.headers = { 'x-csrf-token': token };

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(statusMock).not.toHaveBeenCalled();
  });

  it('should validate POST request with matching tokens', () => {
    const token = generateCsrfToken();
    mockReq.method = 'POST';
    mockReq.cookies = { csrf_token: token };
    mockReq.headers = { 'x-csrf-token': token };

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should validate PUT request with matching tokens', () => {
    const token = generateCsrfToken();
    mockReq.method = 'PUT';
    mockReq.cookies = { csrf_token: token };
    mockReq.headers = { 'x-csrf-token': token };

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should validate DELETE request with matching tokens', () => {
    const token = generateCsrfToken();
    mockReq.method = 'DELETE';
    mockReq.cookies = { csrf_token: token };
    mockReq.headers = { 'x-csrf-token': token };

    validateCsrf(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
