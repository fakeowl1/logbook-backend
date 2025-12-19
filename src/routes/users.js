import { hashPassword, checkPassword, addHoursToDatetime } from '../utils.js';
import { createUser, findOneUserByEmail } from '../services/user_service.js';
import { createToken, getUserIdFromToken } from '../services/token_service.js';
import { Unauthorized } from '../error-handler.js';
import { createAccount } from '../services/account_service.js';

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
      required: ['email', 'firstName', 'lastName', 'password', 'accountCurrency'],
      type: 'object',
      properties: {
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        password: { type: 'string' },
        accountCurrency: { type: 'string' }
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

export const usersRoutes = async (fastify, options) => {
  fastify.post(
    '/signUp',
    signupUserOptions,
    async (req, reply) => {
      const { email, firstName, lastName, password, accountCurrency } = req.body;

      const hashedPassword = hashPassword(password);
      const user = await createUser(
        email, firstName, lastName, 
        hashedPassword
      );

      await createAccount(user.id, accountCurrency);

      const { token, expire } = await createToken(user.id);
      return reply.code(201).send({ token, expire });
  });
  
  fastify.post(
    '/login',
    loginUserOptions,
    async (req, reply) => {
      const { email, password } = req.body;
      const user = await findOneUserByEmail(email);

      const isPasswordValid = checkPassword(password, user.password_hash, user.password_salt)
      if (!isPasswordValid) {
        throw new Unauthorized('Invalid password');
      }

      const { token, expire } = await createToken(user.id);
      return reply.code(200).send({ token, expire });
  });
}
