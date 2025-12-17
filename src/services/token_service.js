import { Unauthorized } from '../error-handler.js';

import { generateToken, addHoursToDatetime } from '../utils.js';
import prisma from '../../prisma/prisma-client.js';

export const createToken = async (user_id) => {
  return await prisma.$transaction(async (tx) => {
      const token = generateToken();
      const expire = addHoursToDatetime(new Date(), 6);

      const tokenRecord = await tx.tokens.create({ 
        data: { 
          token: token, 
          expire: expire,
          user_id: user_id
        } 
      });

      return tokenRecord;
  }); 
};

export const getUserIdFromToken = async (token) => {
  if (!token) {
    throw new Unauthorized('token required');
  }

  const tokenRecord = await prisma.tokens.findFirst({
    where: { token: token }
  });

  if (!tokenRecord || new Date(tokenRecord.expire) < new Date()) {
    throw new Unauthorized('token is invalid or expired');
  }

  return tokenRecord.user_id;
};
