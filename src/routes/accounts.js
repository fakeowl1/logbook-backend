import { createAccount, findAccountById, deleteAccount } from '../services/account_service.js';
import { getUserIdFromToken } from '../services/token_service.js';

const tokenHeader = {
  required: ['x-token'],
  type: 'object',
  properties: {
    'x-token': { type: 'string' }
  }
};


const createAccountOptions = {
  schema: {
    headers: tokenHeader,
    body: {
      required: ['currency'],
      type: 'object',
      properties: {
        currency: { type: 'string' }
      }
    },
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
    }
  }
};

const getAccountOptions = {
  schema: {
    headers: tokenHeader,
    params: {
      required: ['id'],
      type: 'object',
      properties: {
        id: { type: 'number' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          currency: { type: 'string' },
          balance: { type: 'number' },
          created_at: { type: 'string' }
        }
      }
    }
  }
};

const deleteAccountOptions = {
  schema: {
    headers: tokenHeader,
    params: {
      required: ['id'],
      type: 'object',
      properties: {
        id: { type: 'number' }
      }
    },
    response: {
      204: {
        type: 'object',
        properties: {
          status: { type: 'string' }
        }
      }
    }
  }
};

export const accountsRoutes = async (fastify, options) => {

  fastify.get('/:id', getAccountOptions, async (req, reply) => {
    const token = req.headers['x-token'];
    const account_id = Number(req.params.id);

    const user_id = await getUserIdFromToken(token);
    const account = await findAccountById(user_id, account_id);

    return reply.code(200).send(account);
  });

  fastify.delete('/:id', deleteAccountOptions, async (req, reply) => {
    const token = req.headers['x-token'];
    const account_id = Number(req.params.id);

    const user_id = await getUserIdFromToken(token);
    await deleteAccount(user_id, account_id);

    return reply.code(204).send({ status: "Your account successfully deactivated" });
  });
};
