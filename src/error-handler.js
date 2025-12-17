class AppException extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode || 500;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class RecordNotFound extends AppException {
  constructor(message) {
    super(message, 404);
  }
};

class RecordAlreadyExists extends AppException {
  constructor(message) {
    super(message, 409);
  }
};

class Unauthorized extends AppException {
  constructor(message) {
    super(message, 401);
  }
}

class InvalidData extends AppException {
  constructor(message) {
    super(message, 405)
  }
}

const errorHandler = (err, req, reply) => {
  if (err instanceof AppException) {
    return reply.code(err.statusCode).send({ error: err.message });
  }

  if (err.validation) {
    return reply.code(400).send({
      error: err.message,
    });
  }
  
  reply.log.error({
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
    },
    err,
  }, 'Unhandled error occured.');

  return reply.code(500).send(err.message);
};

export {
  RecordNotFound,
  RecordAlreadyExists,
  Unauthorized,
  InvalidData,
  errorHandler,
};
