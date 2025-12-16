// import { InvalidData, RecordAlreadyExists, RecordNotFound } from '../error-handler.js';
import { generateToken, hashPassword, checkPassword, addHoursToDatetime } from '../utils.js';
import { Unauthorized } from '../error-handler.js';

export const createToken = async (prisma, user_id) => {
  return await prisma.$transaction(async (tx) => {
      const token = generateToken();
      const expire = addHoursToDatetime(new Date(), 6);

      await tx.tokens.create({ 
        data: { 
          token: token, 
          expire: expire,
          user_id: user_id
        } 
      });

      return { token, expire };
  }); 
};

export const getUserIdFromToken = async (token) => {
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