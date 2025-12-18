/* eslint-disable no-undef */

import prisma from '../../../prisma/prisma-client.js';
import {
  createAccount,
  findAccountById,
  deleteAccount
} from '../../services/account_service.js';

import {
  InvalidData,
  RecordNotFound
} from '../../error-handler.js';

describe('Account Services', () => {

  let createdUserIds = [];
  let createdAccountIds = [];

  // HELPER FUNCTION
  const createTestUser = async () => {
    const user = await prisma.users.create({
      data: {
        email: `test_${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        password_hash: 'hash',
        password_salt: 'salt'
      }
    });
    createdUserIds.push(user.id);
    return user;
  };

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

  describe('findAccountById', () => {
    it('should return account when found', async () => {
      const user = await createTestUser();

      const account = await createAccount(user.id, 'EUR');
      createdAccountIds.push(account.id);

      const foundAccount = await findAccountById(user.id, account.id);

      expect(foundAccount.id).toBe(account.id);
    });

    it('should throw error if account not found', async () => {
      const user = await createTestUser();

      await expect(
        findAccountById(user.id, 99999)
      ).rejects.toThrow(RecordNotFound);
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete account when balance is zero', async () => {
      const user = await createTestUser();

      const account = await createAccount(user.id, 'USD');
      createdAccountIds.push(account.id);

      await deleteAccount(user.id, account.id);

      await expect(
        findAccountById(user.id, account.id)
      ).rejects.toThrow(RecordNotFound);
    });

    it('should throw error if balance is not zero', async () => {
      const user = await createTestUser();

      const account = await prisma.accounts.create({
        data: {
          user_id: user.id,
          currency: 'USD',
          balance: 100
        }
      });
      createdAccountIds.push(account.id);

      await expect(
        deleteAccount(user.id, account.id)
      ).rejects.toThrow(InvalidData);
    });
  });

}); 