import prisma from '../../prisma/prisma-client.js';
import { InvalidData, RecordNotFound } from '../error-handler.js';

export const incomeTransaction = async (userId, amount, currency) => {
  return prisma.$transaction(async (tx) => {
    if (amount <= 0) throw new InvalidData('Amount must be positive');

    const userAccountName = `user_${userId}`;
    const incomeAccountName = `user_${userId}_income`;

    const userAccount = await tx.accounts.findUnique({
      where: { name_currency: { name: userAccountName, currency } }
    });

    if (!userAccount || userAccount.deleted_at !== null) {
      throw new RecordNotFound('Account is not found');
    }

    await tx.accounts.update({
      where: { name_currency: { name: userAccountName, currency } },
      data: { balance: { increment: amount } }
    });

    const incomeAccount = await tx.accounts.upsert({
      where: { name_currency: { name: incomeAccountName, currency } }, // ВИПРАВЛЕНО
      update: { balance: { decrement: amount } },
      create: {
        name: incomeAccountName,
        currency,
        balance: -amount
      }
    });

    const transaction = await tx.transactions.create({
      data: { name: "Income", description: "User income", currency }
    });

    await tx.transfers.createMany({
      data: [
        { account_id: incomeAccount.id, transaction_id: transaction.id, amount: -amount },
        { account_id: userAccount.id, transaction_id: transaction.id, amount: amount }
      ]
    });

    return transaction;
  });
};

export const categoryTransaction = async (userId, category, amount, currency) => {
  return prisma.$transaction(async (tx) => {
    if (amount <= 0) throw new InvalidData('Amount must be positive');

    const userAccountName = `user_${userId}`;
    const categoryAccountName = `user_${userId}_${category}`;

    const userAccount = await tx.accounts.findUnique({
      where: { name_currency: { name: userAccountName, currency } }
    });

    if (!userAccount || userAccount.deleted_at !== null) {
      throw new RecordNotFound('Account is not found');
    }

    await tx.accounts.update({
      where: { name_currency: { name: userAccountName, currency } },
      data: { balance: { decrement: amount } }
    });

    const categoryAccount = await tx.accounts.upsert({
      where: { name_currency: { name: categoryAccountName, currency } },
      update: { balance: { increment: amount } },
      create: {
        name: categoryAccountName,
        currency,
        balance: amount
      }
    });

    const transaction = await tx.transactions.create({
      data: {
        name: `Pay for ${category}`,
        description: `Used payed for ${category}`,
        currency
      }
    });

    await tx.transfers.createMany({
      data: [
        { account_id: userAccount.id, transaction_id: transaction.id, amount: -amount },
        { account_id: categoryAccount.id, transaction_id: transaction.id, amount: amount }
      ]
    });

    return transaction;
  });
};
