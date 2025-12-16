import { addHoursToDatetime, checkPassword, generateToken, hashPassword } from "../../utils";

describe('generateToken', () => {
  it('should return a string with a length of 64 characters', () => {
    const token = generateToken();
    expect(typeof token).toBe('string');
    expect(token).toHaveLength(64);
  });
});

describe('hashPassword', () => {
  it('should return an object with fields: hash and salt', () => {
    const password = 'qwerty123';
    const hashedPassword = hashPassword(password);
    
    expect(typeof hashedPassword).toBe('object');
    expect(hashedPassword).toHaveProperty('hash');
    expect(hashedPassword).toHaveProperty('salt');
  });
});

describe('checkPassword', () => {
  it('should return true if hash and salt are matched password and false if is unmatch', () => {
    const password = 'qwerty123';
    const hashedPassword = hashPassword(password);
    
    expect(checkPassword('qwerty123', hashedPassword.hash, hashedPassword.salt)).toBe(true);
    expect(checkPassword('test', hashedPassword.hash, hashedPassword.salt)).toBe(false);
  });
});

describe('addHoursToDateTime', () => {
  it('should return a current datetime + N hours', () => {
    const now = new Date(2025, 1, 1, 5, 0);
    const newDateTime = addHoursToDatetime(now, 5);

    expect(newDateTime).toStrictEqual(new Date(2025, 1, 1, 10, 0));
  });
});
