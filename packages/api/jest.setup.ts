// Jest setup file for API tests
import { beforeAll, afterAll, afterEach } from '@jest/globals';

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
  // Global setup
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

afterAll(() => {
  // Global teardown
});
