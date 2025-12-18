import { createTransaction } from '../services/transaction_service.js';
import { getUserIdFromToken } from '../services/token_service.js';

export const transactionsRoutes = async (fastify, options) => {

// INCOME
fastify.post('/income', async (req, reply) => {
    const token = req.headers.authorization;
    const { amount } = req.body;
    const userId = await getUserIdFromToken(token);
    
    const transaction = await createTransaction({
      userId,
      type: 'income',
      amount
    });

    return reply.code(201).send(transaction);
  });

// PAY
fastify.post('/pay', async (req, reply) => {
    const token = req.headers.authorization;
    const { amount, category } = req.body;

    const userId = await getUserIdFromToken(token);

    const transaction = await createTransaction({
      userId,
      type: 'pay',
      amount,
      category
    });

    return reply.code(201).send(transaction);
  });
}