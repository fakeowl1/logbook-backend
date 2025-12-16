import prisma from '../../prisma/prisma-client.js';
import { createAccount, findAccountById, deleteAccount } from '../services/account_service.js';
import { Unauthorized } from '../error-handler.js';

const getUserIdFromToken = async (token) => {
  if (!token) {
    throw new Unauthorized('token required');
  }

  const tokenRecord = await prisma.tokens.findUnique({
    where: { token }
  });

  if (!tokenRecord || new Date(tokenRecord.expire) < new Date()) {
    throw new Unauthorized('token is invalid or expired');
  }

  return tokenRecord.user_id;
};

export const accountsRoutes = async (fastify, options) => {

  // CREATE ACCOUNT
  fastify.post('/', async (req, reply) => {
    const token = req.headers.authorization;
    const { currency } = req.body;

    const user_id = await getUserIdFromToken(token);
    const account = await createAccount(prisma, user_id, currency);

    return reply.code(201).send(account);
  });

  // CHECK ACCOUNT
  fastify.get('/:id', async (req, reply) => {
    const token = req.headers.authorization;
    const account_id = Number(req.params.id);

    const user_id = await getUserIdFromToken(token);
    const account = await findAccountById(prisma, user_id, account_id);

    return reply.code(200).send(account);
  });

  // DELETE ACCOUNT
  fastify.delete('/:id', async (req, reply) => {
    const token = req.headers.authorization;
    const account_id = Number(req.params.id);

    const user_id = await getUserIdFromToken(token);
    await deleteAccount(prisma, user_id, account_id);

    return reply.code(204).send();
  });
};
