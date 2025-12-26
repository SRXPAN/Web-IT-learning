// src/__tests__/sanitize.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { sanitizeBody, sanitizeQuery, sanitize } from '../middleware/sanitize.js';

describe('sanitizeBody middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = vi.fn() as unknown as NextFunction;
  });

  it('should remove HTML tags from strings in body', () => {
    mockReq.body = { name: '<script>alert("xss")</script>John' };

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.name).toBe('scriptalert("xss")/scriptJohn');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should trim whitespace from strings', () => {
    mockReq.body = { name: '  John Doe  ' };

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.name).toBe('John Doe');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle nested objects', () => {
    mockReq.body = {
      user: {
        name: '<b>Bold</b>',
        profile: {
          bio: '<script>bad</script>',
        },
      },
    };

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.user.name).toBe('bBold/b');
    expect(mockReq.body.user.profile.bio).toBe('scriptbad/script');
  });

  it('should handle arrays', () => {
    mockReq.body = {
      tags: ['<tag1>', 'safe', '<tag2>'],
    };

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.tags).toEqual(['tag1', 'safe', 'tag2']);
  });

  it('should preserve numbers and booleans', () => {
    mockReq.body = {
      count: 42,
      active: true,
      price: 9.99,
    };

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.count).toBe(42);
    expect(mockReq.body.active).toBe(true);
    expect(mockReq.body.price).toBe(9.99);
  });

  it('should handle null values', () => {
    mockReq.body = {
      optional: null,
      name: 'John',
    };

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.optional).toBe(null);
    expect(mockReq.body.name).toBe('John');
  });

  it('should call next when body is undefined', () => {
    mockReq.body = undefined;

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should sanitize object keys', () => {
    mockReq.body = {
      '<script>': 'malicious',
    };

    sanitizeBody(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body['script']).toBe('malicious');
    expect(mockReq.body['<script>']).toBeUndefined();
  });
});

describe('sanitizeQuery middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = vi.fn() as unknown as NextFunction;
  });

  it('should sanitize query parameters', () => {
    mockReq.query = { search: '<script>xss</script>' };

    sanitizeQuery(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.query?.search).toBe('scriptxss/script');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle empty query', () => {
    mockReq.query = {};

    sanitizeQuery(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.query).toEqual({});
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('sanitize combined middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = vi.fn() as unknown as NextFunction;
  });

  it('should sanitize both body and query', () => {
    mockReq.body = { name: '<b>John</b>' };
    mockReq.query = { filter: '<script>bad</script>' };

    sanitize(mockReq as Request, mockRes as Response, mockNext);

    expect(mockReq.body.name).toBe('bJohn/b');
    expect(mockReq.query?.filter).toBe('scriptbad/script');
    expect(mockNext).toHaveBeenCalled();
  });
});
