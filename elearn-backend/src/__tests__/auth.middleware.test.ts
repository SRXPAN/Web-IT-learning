// src/__tests__/auth.middleware.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { requireAuth, requireRole, COOKIE_NAME } from '../middleware/auth.js';

// Setup JWT secret for tests
const TEST_SECRET = 'test-jwt-secret-key-for-testing';

describe('requireAuth middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockReq = {
      cookies: {},
      headers: {},
    };
    mockRes = {
      status: statusMock as unknown as Response['status'],
      json: jsonMock as unknown as Response['json'],
    };
    mockNext = vi.fn() as unknown as NextFunction;
  });

  it('should call next() with valid token in cookie', () => {
    const token = jwt.sign(
      { id: 'user123', role: 'STUDENT', name: 'Test User', email: 'test@test.com' },
      TEST_SECRET
    );
    mockReq.cookies = { [COOKIE_NAME]: token };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
    expect(mockReq.user?.id).toBe('user123');
    expect(mockReq.user?.role).toBe('STUDENT');
  });

  it('should call next() with valid token in Authorization header', () => {
    const token = jwt.sign(
      { id: 'user456', role: 'EDITOR', name: 'Editor User', email: 'editor@test.com' },
      TEST_SECRET
    );
    mockReq.headers = { authorization: `Bearer ${token}` };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user?.id).toBe('user456');
    expect(mockReq.user?.role).toBe('EDITOR');
  });

  it('should return 401 when no token is provided', () => {
    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    const payload = jsonMock.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('UNAUTHORIZED');
    expect(payload.error.message).toBe('No token');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with invalid token', () => {
    mockReq.cookies = { [COOKIE_NAME]: 'invalid-token' };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    const payload = jsonMock.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('TOKEN_INVALID');
    expect(payload.error.message).toBe('Invalid token');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 with expired token', () => {
    const token = jwt.sign(
      { id: 'user123', role: 'STUDENT', name: 'Test', email: 'test@test.com' },
      TEST_SECRET,
      { expiresIn: '-1h' }
    );
    mockReq.cookies = { [COOKIE_NAME]: token };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    const payload = jsonMock.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('TOKEN_EXPIRED');
    expect(payload.error.message).toBe('Token expired');
  });

  it('should prefer cookie over Authorization header', () => {
    const cookieToken = jwt.sign(
      { id: 'cookie-user', role: 'STUDENT', name: 'Cookie', email: 'cookie@test.com' },
      TEST_SECRET
    );
    const headerToken = jwt.sign(
      { id: 'header-user', role: 'ADMIN', name: 'Header', email: 'header@test.com' },
      TEST_SECRET
    );
    mockReq.cookies = { [COOKIE_NAME]: cookieToken };
    mockReq.headers = { authorization: `Bearer ${headerToken}` };

    requireAuth(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user?.id).toBe('cookie-user');
  });
});

describe('requireRole middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    
    mockReq = {};
    mockRes = {
      status: statusMock as unknown as Response['status'],
      json: jsonMock as unknown as Response['json'],
    };
    mockNext = vi.fn() as unknown as NextFunction;
  });

  it('should call next() when user has required role', () => {
    mockReq.user = { id: '1', role: 'ADMIN', name: 'Admin', email: 'admin@test.com' };
    const middleware = requireRole(['ADMIN', 'EDITOR']);

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should call next() when user has one of multiple allowed roles', () => {
    mockReq.user = { id: '1', role: 'EDITOR', name: 'Editor', email: 'editor@test.com' };
    const middleware = requireRole(['ADMIN', 'EDITOR']);

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should return 401 when user is not set', () => {
    const middleware = requireRole(['ADMIN']);

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(401);
    const payload = jsonMock.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('UNAUTHORIZED');
    expect(payload.error.message).toBe('Unauthorized');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 when user does not have required role', () => {
    mockReq.user = { id: '1', role: 'STUDENT', name: 'Student', email: 'student@test.com' };
    const middleware = requireRole(['ADMIN', 'EDITOR']);

    middleware(mockReq as Request, mockRes as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(403);
    const payload = jsonMock.mock.calls[0][0];
    expect(payload.success).toBe(false);
    expect(payload.error.code).toBe('FORBIDDEN');
    expect(payload.error.message).toBe('Forbidden');
    expect(mockNext).not.toHaveBeenCalled();
  });
});
