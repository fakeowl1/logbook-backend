import prisma from '../../prisma/prisma-client.js';
import { InvalidData, RecordNotFound, Unauthorized } from '../error-handler.js';

export const createAccount = async (user_id, currency) => {
  return prisma.$transaction(async (tx) => {

    if (!currency || currency.length !== 3) {
      throw new InvalidData('currency must be a 3-letter code');
    }

    const user = await tx.users.findUnique({
      where: { id: user_id }
    });

    if (!user || user.deleted_at) {
      throw new RecordNotFound('user not found');
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
    where: { id: account_id }
  });

  if (!account || account.deleted_at) {
    throw new RecordNotFound('account not found');
  }

  if (account.user_id !== user_id) {
    throw new Unauthorized('access denied');
  }

  return account;
};

export const findUserAccounts = async (user_id) => {
  const accounts = await prisma.accounts.findMany({
    where: { user_id: user_id },
    select: {
      id: true,
      balance: true,
      currency: true,
    }
  });

  if (accounts.length == 0) {
    throw new RecordNotFound('User don\'t have accounts');
  }

  return accounts;
}

export const deleteAccount = async (user_id, account_id) => {
  return prisma.$transaction(async (tx) => {

    const account = await tx.accounts.findUnique({
      where: { id: account_id }
    });

    if (!account || account.deleted_at) {
      throw new RecordNotFound('account not found');
    }

    if (account.user_id !== user_id) {
      throw new Unauthorized('access denied');
    }

    if (Number(account.balance) !== 0) {
      throw new InvalidData('account balance must be zero');
    }

    await tx.accounts.update({
      where: { id: account_id },
      data: { deleted_at: new Date() }
    });
  });
};
