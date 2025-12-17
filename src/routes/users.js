import { hashPassword, checkPassword, addHoursToDatetime } from '../utils.js';
import { createUser, findOneUser, findUserByUserId } from '../services/user_service.js';
import { createToken, getUserIdFromToken } from '../services/token_service.js';
import { Unauthorized } from '../error-handler.js';
import { findUserAccounts } from '../services/account_service.js';

const signupUserOptions = {
  schema: {
    response: {
      201: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          expire: { type: 'string' }
        }
      }
    },
    body: {
      required: ['email', 'firstName', 'lastName', 'password'],
      type: 'object',
      properties: {
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        password: { type: 'string' }
      } 
    }
  }
}

const loginUserOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          expire: { type: 'string' }
        }
      }
    },
    body: {
        required: ['email', 'password'],
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' }
        } 
    }
  }
}

const tokenHeader = {
  type: 'object',
  properties: {
    'x-token': { 'type': 'string' },
  },
  required: ['x-token'],
};

const getCurrentUserAccounts = {
  schema: {
    headers: tokenHeader,
    response: {
      200: {
        type: 'array',
        items: {
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
  }
}

export const usersRoutes = async (fastify, options) => {
  fastify.post(
    '/signUp',
    signupUserOptions,
    async (req, reply) => {
      const { email, firstName, lastName, password } = req.body;

      const hashedPassword = hashPassword(password);
      const user = await createUser(
        email, firstName, lastName, 
        hashedPassword
      );

      const token = await createToken(user.id);

      return reply.code(201).send(token);
  });
  
  fastify.post(
    '/login',
    loginUserOptions,
    async (req, reply) => {
      const { email, password } = req.body;
      const user = await findOneUser(email);

      const isPasswordValid = checkPassword(password, user.password_hash, user.password_salt)
      if (!isPasswordValid) {
        throw new Unauthorized('Invalid password');
      }
      
      const token = await createToken(user.id);

      return reply.code(200).send(token);
  });

  fastify.post(
    '/myAccounts',
    getCurrentUserAccounts,
    async (req, reply) => {
      const token = req.headers['x-token'];

      const user_id = await getUserIdFromToken(token);
      const accounts = await findUserAccounts(user_id);

      return reply.code(200).send(accounts);
  })
}
