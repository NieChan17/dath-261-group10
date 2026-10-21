import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';
import { PasswordService } from './security/password.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

describe('AuthService', () => {
  let service: AuthService;
  let mockDb: {
    query: jest.Mock;
    queryOne: jest.Mock;
  };
  let mockPasswordService: {
    hashPassword: jest.Mock;
    verifyPassword: jest.Mock;
  };
  let mockJwtService: {
    sign: jest.Mock;
    verify: jest.Mock;
  };
  let mockConfigService: {
    get: jest.Mock;
  };
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };
    mockPasswordService = {
      hashPassword: jest.fn().mockResolvedValue('hashed_pw'),
      verifyPassword: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock.jwt.token'),
      verify: jest.fn(),
    };
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'JWT_SECRET') return 'test_secret';
        if (key === 'JWT_EXPIRES_IN') return '1h';
        return null;
      }),
    };
    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      mockDb.queryOne.mockResolvedValueOnce({ id: 'existing-id' });

      await expect(
        service.register(
          { email: 'test@example.com', password: 'password', fullName: 'Test' },
          mockResponse as Response,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should register successfully and set HttpOnly cookies', async () => {
      mockDb.queryOne
        .mockResolvedValueOnce(null) // no existing email
        .mockResolvedValueOnce({ id: 'role-student-id', name: 'student' }) // role found
        .mockResolvedValueOnce({
          id: 'new-user-id',
          email: 'test@example.com',
          full_name: 'Test Student',
          avatar_url: null,
          created_at: new Date(),
        }); // user inserted

      const result = await service.register(
        { email: 'test@example.com', password: 'password', fullName: 'Test Student' },
        mockResponse as Response,
      );

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock.jwt.token');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'mock.jwt.token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'mock.jwt.token',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);

      await expect(
        service.login(
          { email: 'notfound@example.com', password: 'password' },
          mockResponse as Response,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        password_hash: 'hashed_pw',
      });
      mockPasswordService.verifyPassword.mockResolvedValueOnce(false);

      await expect(
        service.login(
          { email: 'test@example.com', password: 'wrong' },
          mockResponse as Response,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should login successfully and set HttpOnly cookies', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: 'user-id',
        email: 'test@example.com',
        password_hash: 'hashed_pw',
        full_name: 'Test Student',
        role: 'student',
        avatar_url: null,
        created_at: new Date(),
      });
      mockPasswordService.verifyPassword.mockResolvedValueOnce(true);

      const result = await service.login(
        { email: 'test@example.com', password: 'correct' },
        mockResponse as Response,
      );

      expect(result.success).toBe(true);
      expect(result.user.id).toBe('user-id');
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
    });
  });

  describe('logout', () => {
    it('should clear cookies on logout', () => {
      const result = service.logout(mockResponse as Response);
      expect(result.success).toBe(true);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.anything(),
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refresh_token',
        expect.anything(),
      );
    });
  });
});
