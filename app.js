import Fastify from 'fastify';

import { usersRoutes } from './src/routes/users.js';
import { errorHandler } from './src/error-handler.js';

const fastify = Fastify({ logger: true });

fastify.setErrorHandler(errorHandler);
fastify.register(usersRoutes, { prefix: 'api/v1/users' });

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start()
