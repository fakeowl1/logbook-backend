import { createUser, deactivateUser, findOneUser, findOneUserByEmail } from '../../services/user_service.js';
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
  
  afterEach(async () => {
    await prisma.users.deleteMany({});
    await prisma.tokens.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

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

      await expect(createUser(email, firstName, lastName, hashedPassword)).rejects.toThrow(RecordAlreadyExists);
    });
  });

  describe('findOneUserByEmail', () => {
    it('should throw error if user is not found', async () => {
      const email = 'someemail@gmail.com';
      await expect(findOneUserByEmail(email)).rejects.toThrow(RecordNotFound);
    });

    it('should find a user if email is valid',  async () => {
      const firstName = 'X';
      const lastName = 'X';
      const email = 'hello@gmail.com'
      const hashedPassword = hashPassword('qwerty123');

      const createdUser = await createUser(email, firstName, lastName, hashedPassword);
      const findedUser = await findOneUserByEmail(email);

      expect(findedUser).toEqual(createdUser);
    });
  });

  describe('deactivateUser', () => {
    it('should throw an error if token is invalid', async () => {
      const token = 'someInvalidToken';
      await expect(deactivateUser(token)).rejects.toThrow(Unauthorized);
    });

    it('should deactive user if token is valid', async () => {
      const firstName = 'X';
      const lastName = 'X';
      const email = 'hello@gmail.com'
      const hashedPassword = hashPassword('qwerty123');
      
      const createdUser = await createUser(email, firstName, lastName, hashedPassword);
      
      const token = await createToken(createdUser.id);
      await deactivateUser(token.token);

      await expect(findOneUser(createdUser.id)).rejects.toThrow(RecordNotFound);
    });
  });
});

