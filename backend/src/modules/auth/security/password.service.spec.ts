import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash and verify passwords correctly', async () => {
    const rawPassword = 'SecurePassword@2026';
    const hash = await service.hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toEqual(rawPassword);

    const isValid = await service.verifyPassword(rawPassword, hash);
    expect(isValid).toBe(true);

    const isInvalid = await service.verifyPassword('WrongPassword', hash);
    expect(isInvalid).toBe(false);
  });

  it('should verify standard bcrypt hash correctly', async () => {
    // Bcrypt hash of 'Admin@123456'
    const bcryptHash = '$2a$10$axXebPS4l6D1v8go06855O6Rsthd/tZyQ/KkHziwrhlxznzUOxO4y';
    const isValid = await service.verifyPassword('Admin@123456', bcryptHash);
    expect(isValid).toBe(true);

    const isInvalid = await service.verifyPassword('IncorrectPassword', bcryptHash);
    expect(isInvalid).toBe(false);
  });

  it('should return false for empty or null passwords', async () => {
    expect(await service.verifyPassword('', 'somehash')).toBe(false);
    expect(await service.verifyPassword('test', '')).toBe(false);
  });
});
