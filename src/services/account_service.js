import prisma from '../../prisma/prisma-client.js';
import { InvalidData, RecordNotFound, Unauthorized } from '../error-handler.js';

export const createAccount = async (accountName, currency) => {
  return prisma.$transaction(async (tx) => {

    const validCurrency = /\b[A-Z]{3}\b/g;

    if (!validCurrency.test(currency)) {
      throw new InvalidData("Invalid currency");
    }

    return tx.accounts.create({
      data: {
        name: accountName,
        balance: 0
      }
    });
  });
};

export const findAccountById = async (accountName, accountId) => {
  const account = await prisma.accounts.findUnique({
    where: { 
      id: accountId,
      name: accountName,
      deleted_at: null,
    }
  });

  if (!account) {
    throw new RecordNotFound('Account not found');
  }

  return account;
};

export const findUserAccounts = async (accountName) => {
  const accounts = await prisma.accounts.findMany({
    where: { 
      name: accountName,
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

export const deleteAccount = async (accountName, accountId) => {
  return prisma.$transaction(async (tx) => {
    const account = await tx.accounts.findFirst({
      where: {
          id: accountId,
          name: accountName,  
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
      where: { id: accountId },
      data: { deleted_at: new Date() }
    });
  });
};
