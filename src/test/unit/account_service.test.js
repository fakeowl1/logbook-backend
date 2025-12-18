/* eslint-disable no-undef */

import prisma from '../../../prisma/prisma-client.js';
import {
  createAccount,
} from '../../services/account_service.js';

import {
  InvalidData,
  RecordNotFound
} from '../../error-handler.js';

describe('Account Services', () => {

  let createdUserIds = [];
  let createdAccountIds = [];

  beforeAll(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "users",
        "accounts",
        "transactions",
        "transfers",
        "tokens"
      RESTART IDENTITY CASCADE;
    `);
  });

  afterEach(async () => {
    if (createdAccountIds.length > 0) {
      await prisma.accounts.deleteMany({
        where: { id: { in: createdAccountIds } }
      });
      createdAccountIds = [];
    }

    if (createdUserIds.length > 0) {
      await prisma.users.deleteMany({
        where: { id: { in: createdUserIds } }
      });
      createdUserIds = [];
    }
  });

  const createTestUser = async () => {
    const user = await prisma.users.create({
      data: {
        first_name: 'Test',
        last_name: 'User',
        email: `test_${Date.now()}@example.com`,
        password_hash: 'hash',
        password_salt: 'salt'
      }
    });
    createdUserIds.push(user.id);
    return user;
  };

  describe('createAccount', () => {
    it('should create an account with valid input', async () => {
      const user = await createTestUser();

      const account = await createAccount(user.id, 'USD');
      createdAccountIds.push(account.id);

      expect(account.currency).toBe('USD');
      expect(Number(account.balance)).toBe(0);
    });

    it('should throw error if currency is invalid', async () => {
      const user = await createTestUser();

      await expect(
        createAccount(user.id, 'US')
      ).rejects.toThrow(InvalidData);
    });

    it('should throw error if user not found', async () => {
      await expect(
        createAccount(99999, 'USD')
      ).rejects.toThrow(RecordNotFound);
    });
  });

});
