import { createAccount, findAccountById, deleteAccount } from '../services/account_service.js';
import { getUserIdFromToken } from '../services/token_service.js';

export const accountsRoutes = async (fastify, options) => {

  // CREATE ACCOUNT
  fastify.post('/', async (req, reply) => {
    const token = req.headers.authorization;
    const { currency } = req.body;

    const user_id = await getUserIdFromToken(token);
    const account = await createAccount(user_id, currency);

    return reply.code(201).send(account);
  });

  // CHECK ACCOUNT
  fastify.get('/:id', async (req, reply) => {
    const token = req.headers.authorization;
    const account_id = Number(req.params.id);

    const user_id = await getUserIdFromToken(token);
    const account = await findAccountById(user_id, account_id);

    return reply.code(200).send(account);
  });

  // DELETE ACCOUNT
  fastify.delete('/:id', async (req, reply) => {
    const token = req.headers.authorization;
    const account_id = Number(req.params.id);

    const user_id = await getUserIdFromToken(token);
    await deleteAccount(user_id, account_id);

    return reply.code(204).send({ status: "Your account successfully deactivated" });
  });
};
