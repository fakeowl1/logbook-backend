import prisma from '../../prisma/prisma-client.js';
import { InvalidData, RecordNotFound, Unauthorized } from '../error-handler.js';
export const createAccount = async (user_id, currency) => {
  return prisma.$transaction(async (tx) => {

    const validCurrency = /\b[A-Z]{3}\b/g;

    if (!validCurrency.test(currency)) {
      throw new InvalidData("Invalid currency");
    }

    const user = await tx.users.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      throw new RecordNotFound('User not found');
    }

    return tx.accounts.create({
      data: {
        user_id,
        currency: currency.toUpperCase(),
        balance: 0
      }
    });
  });
};

export const findAccountById = async (user_id, account_id) => {
  const account = await prisma.accounts.findUnique({
    where: { 
      id: account_id,
      user_id: user_id,
      deleted_at: null,
    }
  });

  if (!account) {
    throw new RecordNotFound('Account not found');
  }

  return account;
};

export const findUserAccounts = async (user_id) => {
  const accounts = await prisma.accounts.findMany({
    where: { 
      user_id: user_id,
      deleted_at: null,
    },
    select: {
      id: true,
      balance: true,
      currency: true,
    }
  });

  if (accounts.length == 0) {
    throw new RecordNotFound('User don\'t have any accounts');
  }

  return accounts;
}

export const deleteAccount = async (user_id, account_id) => {
  return prisma.$transaction(async (tx) => {
    const account = await tx.accounts.findFirst({
      where: {
          id: account_id,
          user_id: user_id,
          deleted_at: null
      }
    });

    if (!account) {
      throw new RecordNotFound('Account not found');
    }

    if (Number(account.balance) !== 0) {
      throw new InvalidData('Account balance must be zero');
    }

    await tx.accounts.update({
      where: { id: account_id },
      data: { deleted_at: new Date() }
    });
  });
};
