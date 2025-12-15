import prisma from '../../prisma/prisma-client.js';
import { hashPassword, checkPassword, addHoursToDatetime } from '../utils.js';
import { createUser, findOneUser } from '../services/user_service.js';
import { createToken } from '../services/token_service.js';
import { Unauthorized } from '../error-handler.js';

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

export const usersRoutes = async (fastify, options) => {

  fastify.post(
    '/signUp',
    signupUserOptions,
    async (req, reply) => {
      const { email, firstName, lastName, password } = req.body;

      const hashedPassword = hashPassword(password);
      const user = await createUser(
        prisma, 
        email, firstName, lastName, 
        hashedPassword
      );

      const token = await createToken(prisma, user.id);

      return reply.code(201).send(token);
  });
  
  fastify.post(
    '/login',
    loginUserOptions,
    async (req, reply) => {
      const { email, password } = req.body;
      const user = await findOneUser(prisma, email);

      const isPasswordValid = checkPassword(password, user.password_hash, user.password_salt)
      
      if (!isPasswordValid) {
        throw new Unauthorized('Invalid password');
      }
      
      const token = await createToken(prisma, user.id);

      return reply.code(200).send(token);
    }
  )
}
