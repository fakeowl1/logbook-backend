import { InvalidData, RecordNotFound, Unauthorized } from '../error-handler.js';

export const createAccount = async (prisma, user_id, currency) => {
  return prisma.$transaction(async (tx) => {

    const validCurrency = /\b[A-Z]{3}\b/g;

    if (!validCurrency.test(currency)) {
      throw new InvalidData("currency is invalid");
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

export const findAccountById = async (prisma, user_id, account_id) => {
  const account = await prisma.accounts.findFirst({
  where: {
    AND: [
      { id: account_id },
      { user_id: user_id },
      { deleted_at: null }
    ]
  }
});

if (!account) {
  throw new RecordNotFound('account not found');
}
  return account;
};

export const deleteAccount = async (prisma, user_id, account_id) => {
  return prisma.$transaction(async (tx) => {
    const account = await tx.accounts.findFirst({
      where: {
        AND: [
          { id: account_id },
          { user_id: user_id },
          { deleted_at: null }
        ]
      }
    });

    if (!account) {
      throw new RecordNotFound('account not found');
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
