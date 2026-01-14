// src/swagger.ts

// Basic OpenAPI 3.0 specification
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'E-Learning Platform API',
    version: '1.0.0',
    description: 'REST API documentation for the E-Learning platform with multi-language support',
    contact: {
      name: 'API Support',
      email: 'support@elearn.example.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Development server'
    },
    {
      url: 'https://api.elearn.example.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'elearn_token',
        description: 'JWT token stored in HTTP-only cookie'
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token in Authorization header'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['STUDENT', 'EDITOR', 'ADMIN'] },
          xp: { type: 'integer', minimum: 0 },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and registration'
    },
    {
      name: 'Topics',
      description: 'Topic management and retrieval'
    },
    {
      name: 'Editor',
      description: 'Content editing endpoints (EDITOR/ADMIN only)'
    }
  ],
  paths: {}
}

export { swaggerSpec }
