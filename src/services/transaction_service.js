import prisma from '../../prisma/prisma-client.js';
import { InvalidData } from '../error-handler.js';

export const createTransaction = async ({
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
};