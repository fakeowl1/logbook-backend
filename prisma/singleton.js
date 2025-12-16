import { PrismaClient } from './generated/prisma/client.ts';
import { mockDeep, mockReset } from 'jest-mock-extended';

import prisma from './prisma-client';

export const prismaMock = mockDeep();

prismaMock.$transaction.mockImplementation(async (callback) => {
  return callback(prismaMock);
});


beforeEach(() => {
  mockReset(prismaMock)
})
