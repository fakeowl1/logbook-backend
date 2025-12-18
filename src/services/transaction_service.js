import prisma from '../../prisma/prisma-client.js';
import { InvalidData, RecordNotFound } from '../error-handler.js';

export const createTransaction = async ({
userId,
type,
amount,
category = null
}) => {

if (amount <= 0) {
throw new InvalidData('Amount must be positive');
}

if (!['income', 'pay'].includes(type)) {
throw new InvalidData('Invalid transaction type');
}

if (type === 'pay' && !category) {
throw new InvalidData('Category is required for pay');
}

const userAccountName = `user_${userId}`;

  return prisma.$transaction(async (tx) => {
    const userAccount = await tx.accounts.findFirst({
      where: {
        name: userAccountName,
        deleted_at: null
      }
    });

    if (!userAccount) {
      throw new RecordNotFound('User account not found');
    }

    const systemAccountName =
      type === 'income'
        ? 'system_income'
        : `system_${category}`;

    const systemAccount = await tx.accounts.findFirst({
      where: {
        name: systemAccountName,
        deleted_at: null
      }
    });

    if (!systemAccount) {
      throw new RecordNotFound('System account not found');
    }

    const transaction = await tx.transactions.create({
        data: {
        type,
        category,
        amount
        }
        });
        
        const fromAccount =
        type === 'income' ? systemAccount : userAccount;
  
      const toAccount =
        type === 'income' ? userAccount : systemAccount;
  
      await tx.transfers.create({
        data: {
          transaction_id: transaction.id,
          from_account_id: fromAccount.id,
          to_account_id: toAccount.id,
          amount
        }
      });
});
};
