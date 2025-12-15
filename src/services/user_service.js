import { InvalidData, RecordAlreadyExists, RecordNotFound, Unauthorized } from '../error-handler.js';

export const createUser = async (prisma, email, firstName, lastName, hashedPassword) => {
  return await prisma.$transaction(async (tx) => {
      const validEmail = /^[\w\-.]+@([\w-]+\.)+[\w-]{2,}$/;
      
      if (!validEmail.test(email)) {
        throw new InvalidData("Email is invalid");
      }

      const isEmailUsed = await tx.users.findUnique({
        where: { email }
      });
      
      if (isEmailUsed) {
        throw new RecordAlreadyExists("User with this email alredy exists");
      }

      await tx.users.create({
        data: {
          email: email,
          first_name: firstName,
          last_name: lastName,
          password_hash: hashedPassword.hash,
          password_salt: hashedPassword.salt
        }
      });

      const user = await tx.users.findUnique({
        where: { email }
      });

      return user;
  }); 
};

export const findOneUser = async (prisma, email) => {
  const user = await prisma.users.findUnique({
    where: { email }
  });

  if (!user) {
    throw new RecordNotFound(`User is not found`);
  }

  return user;
};

export const deactivateUser = async (prisma, token) => {
  return prisma.$transaction(async (tx) => {
      const tokenRecord = await tx.tokens.findUnique({
        where: { token }
      });

      if (!tokenRecord) {
        throw new Unauthorized('Inavalid token');
      }

      await tx.users.update({
        where: {
          user_id: tokenRecord.user_id
        },
        data: {
          is_deleted: true,
        }
      });
  });
};
