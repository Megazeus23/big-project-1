// Jest setup file for API tests
import { beforeAll, afterAll, afterEach } from '@jest/globals';

// Mock superjson to avoid ESM issues
jest.mock('superjson', () => ({
  default: {
    stringify: jest.fn((val) => JSON.stringify(val)),
    parse: jest.fn((val) => JSON.parse(val)),
    serialize: jest.fn((val) => ({ json: val, meta: undefined })),
    deserialize: jest.fn((val) => val.json),
  },
  stringify: jest.fn((val) => JSON.stringify(val)),
  parse: jest.fn((val) => JSON.parse(val)),
  serialize: jest.fn((val) => ({ json: val, meta: undefined })),
  deserialize: jest.fn((val) => val.json),
}));

// Mock the middleware to avoid circular dependency issues
jest.mock('./middleware/request-logger', () => ({
  requestLoggerMiddleware: jest.fn((opts) => opts),
}));

jest.mock('./middleware/trpc-error-logger', () => ({
  onError: jest.fn(),
}));

jest.mock('./middleware/error-handler', () => ({
  AuthenticationError: class AuthenticationError extends Error {},
  toTRPCError: jest.fn((err) => err),
}));

// Mock Prisma Client for testing
jest.mock('@biolab/database', () => ({
  prisma: {
    client: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    // Add other models as needed
  },
}));

beforeAll(() => {
  // Global setup - Jest automatically sets NODE_ENV to 'test'
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Global teardown
});
