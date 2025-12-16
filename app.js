import Fastify from 'fastify';

import { usersRoutes } from './src/routes/users.js';
import { errorHandler } from './src/error-handler.js';
import { accountsRoutes } from './src/routes/accounts.js';

const fastify = Fastify({ logger: true });

fastify.setErrorHandler(errorHandler);
fastify.register(usersRoutes, { prefix: 'api/v1/users' });
fastify.register(accountsRoutes, { prefix: 'api/v1/accounts' });

const start = async () => {
  try {
    await fastify.listen({ port: 8080, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start()
