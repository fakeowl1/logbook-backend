import { createUser, deactivateUser, findOneUser } from '../../services/user_service.js';
import { createToken } from '../../services/token_service.js';
import { prismaMock } from '../../../prisma/singleton.js';
import { hashPassword } from '../../utils';

import { InvalidData, RecordAlreadyExists, RecordNotFound, Unauthorized } from '../../error-handler.js';

import prisma from '../../../prisma/prisma-client.js'


describe('User Services', () => {
  beforeAll(async () => {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "users", 
        "tokens", 
        "transactions", 
        "transfers", 
        "accounts"
      RESTART IDENTITY CASCADE;
    `);
  });
  
  let createdUserIds = []
  
  afterEach(async () => {
    // Delete all users from table after every operation
    if (createdUserIds.length > 0) {
      await prisma.users.deleteMany({
        where: { id: {in: createdUserIds} }
      });
      createdUserIds = [];
    }
  })

  describe('createUser', () => {
    it('should throw error if email is invalid', async () => {
      const firstName = 'X';
      const lastName = 'X';
      const email = 'hello@gmail'
      const hashedPassword = hashPassword('qwerty123')

      await expect(createUser(email, firstName, lastName, hashedPassword)).rejects.toThrow(InvalidData);
    });

    it('should throw error if email is used', async () => {
      const firstName = 'X';
      const lastName = 'X';
      const email = 'hello@gmail.com'
      const hashedPassword = hashPassword('qwerty123');

      const user = await createUser(email, firstName, lastName, hashedPassword);

      createdUserIds.push(user.id);

      await expect(createUser(email, firstName, lastName, hashedPassword)).rejects.toThrow(RecordAlreadyExists);
    });
  });

  describe('findOneUser', () => {
    it('should throw error if user is not found', async () => {
      const email = 'someemail@gmail.com';
      await expect(findOneUser(email)).rejects.toThrow(RecordNotFound);
    });

    it('should find a user if email is valid',  async () => {
      const firstName = 'X';
      const lastName = 'X';
      const email = 'hello@gmail.com'
      const hashedPassword = hashPassword('qwerty123');


      const createdUser = await createUser(email, firstName, lastName, hashedPassword);
      createdUserIds.push(createdUserIds.id);
      const findedUser = await findOneUser(email);

      await expect(findedUser).toEqual(createdUser);
    });
  });

  describe('deleteUser', () => {
    it('should throw an error if token is invalid', async () => {
      const token = 'someInvalidToken';
      await expect(deactivateUser(token)).rejects.toThrow(Unauthorized);
    });
    // TODO: Write a test for user deactivation

    // it('should deactive user if token is valid', async () => {
    //   const firstName = 'X';
    //   const lastName = 'X';
    //   const email = 'hello@gmail.com'
    //   const hashedPassword = hashPassword('qwerty123');
    //   
    //   const createdUser = await createUser(email, firstName, lastName, hashedPassword);
    //   createdUserIds.push(createdUserIds.id);
    //
    //   const token = await createToken(createdUser.id);
    //   
    //   deactivateUser(token);
    // });
  })
});

