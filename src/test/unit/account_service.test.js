/* eslint-disable no-undef */
import prisma from '../../../prisma/prisma-client.js';
import {
  createAccount,
  findUserAccount,
  deleteAccount
} from '../../services/account_service.js';

import {
  InvalidData,
  RecordNotFound
} from '../../error-handler.js';

describe('Account Services', () => {
  const createTestUser = async () => {
    return await prisma.users.create({
      data: {
        email: `test_${Date.now()}_${Math.random()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        password_hash: 'hash',
        password_salt: 'salt'
      }
    });
  };

  beforeAll(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE "users", "accounts", "transactions", "transfers", "tokens"
      RESTART IDENTITY CASCADE;
    `);
  });

  afterEach(async () => {
    await prisma.transfers.deleteMany({});
    await prisma.transactions.deleteMany({});
    await prisma.tokens.deleteMany({});
    await prisma.accounts.deleteMany({});
    await prisma.users.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createAccount', () => {
    it('should create an account with valid name based on user_id', async () => {
      const user = await createTestUser();
      const currency = 'USD';

      const account = await createAccount(user.id, currency);

      expect(account.name).toBe(`user_${user.id}`);
      expect(account.currency).toBe(currency);
      expect(Number(account.balance)).toBe(0);
    });

    it('should throw error if currency format is invalid', async () => {
      const user = await createTestUser();

      await expect(createAccount(user.id, 'us'))
        .rejects.toThrow(InvalidData);
      
      await expect(createAccount(user.id, 'US1'))
        .rejects.toThrow(InvalidData);
    });
  });

  describe('findUserAccount', () => {
    it('should find main user account', async () => {
      const user = await createTestUser();
      const currency = 'EUR';
      await createAccount(user.id, currency);

      const found = await findUserAccount(user.id, currency);

      expect(found.name).toBe(`user_${user.id}`);
      expect(found.currency).toBe(currency);
    });

    it('should find category account if category is provided', async () => {
      const user = await createTestUser();
      const currency = 'USD';
      const category = 'food';
      const categoryName = `user_${user.id}_${category}`;

      await prisma.accounts.create({
        data: { name: categoryName, currency, balance: 0 }
      });

      const found = await findUserAccount(user.id, currency, category);

      expect(found.name).toBe(categoryName);
    });

    it('should throw RecordNotFound if account does not exist', async () => {
      const user = await createTestUser();
      await expect(findUserAccount(user.id, 'GBP'))
        .rejects.toThrow(RecordNotFound);
    });

    it('should throw RecordNotFound if account is soft-deleted', async () => {
      const user = await createTestUser();
      const currency = 'USD';
      await prisma.accounts.create({
        data: { 
          name: `user_${user.id}`, 
          currency, 
          balance: 0, 
          deleted_at: new Date() 
        }
      });

      await expect(findUserAccount(user.id, currency))
        .rejects.toThrow(RecordNotFound);
    });
  });

  describe('deleteAccount', () => {
    it('should soft delete main account and all related category accounts', async () => {
      const user = await createTestUser();
      const currency = 'USD';
      
      await createAccount(user.id, currency);
      await prisma.accounts.create({
        data: { name: `user_${user.id}_taxi`, currency, balance: 0 }
      });

      await deleteAccount(user.id);

      await expect(findUserAccount(user.id, currency))
        .rejects.toThrow(RecordNotFound);

      const accounts = await prisma.accounts.findMany({
        where: { name: { startsWith: `user_${user.id}` } }
      });

      expect(accounts.length).toBe(2);
      expect(accounts.every(acc => acc.deleted_at !== null)).toBe(true);
    });

    it('should throw RecordNotFound if main account does not exist', async () => {
      await expect(deleteAccount(99999))
        .rejects.toThrow(RecordNotFound);
    });
  });
});
