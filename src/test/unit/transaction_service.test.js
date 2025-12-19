/* eslint-disable no-undef */
import prisma from '../../../prisma/prisma-client.js';
import { 
  incomeTransaction, 
  categoryTransaction 
} from '../../services/transaction_service.js';
import { createAccount } from '../../services/account_service.js';
import { InvalidData, RecordNotFound } from '../../error-handler.js';

describe('Transaction Services', () => {
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
    // Clean start
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "users", "accounts", "transactions", "transfers" CASCADE;`);
  });

  afterEach(async () => {
    // Clean up after every test to maintain isolation
    await prisma.transfers.deleteMany();
    await prisma.transactions.deleteMany();
    await prisma.accounts.deleteMany();
    await prisma.users.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('incomeTransaction', () => {
    it('should successfully process income and create an income account', async () => {
      const user = await createTestUser();
      const currency = 'USD';
      const amount = 100;

      await createAccount(user.id, currency);

      const transaction = await incomeTransaction(user.id, amount, currency);

      expect(transaction.name).toBe('Income');
      
      const userAcc = await prisma.accounts.findUnique({
        where: { name_currency: { name: `user_${user.id}`, currency } }
      });
      expect(Number(userAcc.balance)).toBe(amount);

      const incomeAcc = await prisma.accounts.findUnique({
        where: { name_currency: { name: `user_${user.id}_income`, currency } }
      });
      expect(Number(incomeAcc.balance)).toBe(-amount);

      const transfers = await prisma.transfers.findMany({
        where: { transaction_id: transaction.id }
      });
      expect(transfers).toHaveLength(2);
    });

    it('should throw InvalidData for negative amounts', async () => {
      const user = await createTestUser();
      await expect(incomeTransaction(user.id, -50, 'USD'))
        .rejects.toThrow(InvalidData);
    });

    it('should throw RecordNotFound if main user account does not exist', async () => {
      const user = await createTestUser();
      await expect(incomeTransaction(user.id, 100, 'EUR'))
        .rejects.toThrow(RecordNotFound);
    });
  });

  describe('categoryTransaction', () => {
    it('should transfer money from main account to category account', async () => {
      const user = await createTestUser();
      const currency = 'GBP';
      const amount = 30;
      const category = 'coffee';

      // Setup: Create main account with initial balance
      await createAccount(user.id, currency);
      await prisma.accounts.update({
        where: { name_currency: { name: `user_${user.id}`, currency } },
        data: { balance: 100 }
      });

      const transaction = await categoryTransaction(user.id, category, amount, currency);

      expect(transaction.category).toBe(category);

      const userAcc = await prisma.accounts.findUnique({
        where: { name_currency: { name: `user_${user.id}`, currency } }
      });
      expect(Number(userAcc.balance)).toBe(70);

      const catAcc = await prisma.accounts.findUnique({
        where: { name_currency: { name: `user_${user.id}_${category}`, currency } }
      });
      expect(Number(catAcc.balance)).toBe(amount);
    });

    it('should throw InvalidData if currency format is wrong', async () => {
      const user = await createTestUser();
      await expect(categoryTransaction(user.id, 'food', 10, 'usd_extra'))
        .rejects.toThrow(InvalidData);
    });

    it('should throw RecordNotFound if user tries to pay from non-existent account', async () => {
      const user = await createTestUser();
      await expect(categoryTransaction(user.id, 'rent', 500, 'JPY'))
        .rejects.toThrow(RecordNotFound);
    });
  });
});
