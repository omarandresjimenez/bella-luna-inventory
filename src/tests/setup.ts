import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

jest.mock('../infrastructure/database/prisma', () => ({
  __esModule: true,
  prisma: prismaMock,
}));

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRY = '7d';
process.env.VITE_API_URL = 'http://localhost:3000/api';
process.env.NODE_ENV = 'test';
