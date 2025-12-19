import { incomeTransaction, categoryTransaction } from '../services/transaction_service.js';
import { getUserIdFromToken } from '../services/token_service.js';

const tokenHeader = {
  required: ['x-token'],
  type: 'object',
  properties: {
    'x-token': { type: 'string' }
  }
};

const incomeOptions = {
  schema: {
    headers: tokenHeader,
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          currency: { type: 'string' },
          balance: { type: 'number' },
          created_at: { type: 'string' }
        }
      }
    },
    body: {
      required: ['amount'],
      type: 'object',
      properties: {
        amount: { type: 'number' },
        currency: { type: 'string' }
      } 
    }
  }
};

const categoryTransactionsOptions = {
  schema: {
    headers: tokenHeader,
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          currency: { type: 'string' },
          balance: { type: 'number' },
          created_at: { type: 'string' }
        }
      }
    },
    body: {
      required: ['amount', 'currency'],
      type: 'object',
      properties: {
        amount: { type: 'number' },
        currency: { type: 'string' }
      } 
    }
  }
};

const getTransactionsOptions = {
  schema: {
    headers: tokenHeader,
    body: {
      required: ['currency'],
      type: 'object',
      properties: {
        currency: { type: 'string' },
      }
    },

    params: {
      type: 'object',
      properties: {
        number: { type: 'numer' },
        default: 10,
      }
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            currency: { type: 'string' },
            amount: { type: 'string' },
            created_at: { type: 'string' },
            category: { type: 'string' }
          },
        }
      }
    },
  }
}

export const transactionsRoutes = async (fastify, options) => {
  fastify.post(
    '/income',
    incomeOptions, 
    async (req, reply) => {
      const token = req.headers['x-token'];
      const { amount, currency } = req.body;

      const userId = await getUserIdFromToken(token);
      
      const transaction = await incomeTransaction(userId, amount, currency);

      return reply.code(201).send(transaction);
  });

  fastify.post(
    '/pay', 
    categoryTransactionsOptions,
    async (req, reply) => {
      const token = req.headers['x-token'];
      const { amount, currency, category } = req.body;

      const userId = await getUserIdFromToken(token);

      const transaction = await categoryTransaction(userId, category, amount, currency);

      return reply.code(201).send(transaction);
  });

  // fastify.get(
  //   '/:number?',
  //   getTransactionsOptions,
  //   async ( req, reply ) => {
  //     const token = req.headers['x-token'];
  //     const userId = await getUserIdFromToken(token);
  //     const { number } = req.paramsk;
  //
  // });
}
