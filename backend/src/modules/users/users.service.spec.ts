import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseService } from '../../database/database.service';
import { Role } from '../../common/constants/roles.enum';

describe('UsersService', () => {
  let service: UsersService;
  let mockDb: {
    query: jest.Mock;
    queryOne: jest.Mock;
  };

  beforeEach(async () => {
    mockDb = {
      query: jest.fn(),
      queryOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: DatabaseService, useValue: mockDb },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findById (IDOR protection)', () => {
    it('should forbid a student from viewing another user profile', async () => {
      await expect(
        service.findById('target-user-id', {
          userId: 'other-student-id',
          email: 'student@edupulse.hcmut.edu.vn',
          role: Role.STUDENT,
          fullName: 'Student',
        }),
      ).rejects.toThrow(ForbiddenException);
      expect(mockDb.queryOne).not.toHaveBeenCalled();
    });

    it('should allow a user to view their own profile', async () => {
      mockDb.queryOne.mockResolvedValueOnce({
        id: 'self-id',
        email: 'self@edupulse.hcmut.edu.vn',
        full_name: 'Self',
        role: Role.STUDENT,
        avatar_url: null,
        created_at: new Date(),
        permissions: {},
      });

      const res = await service.findById('self-id', {
        userId: 'self-id',
        email: 'self@edupulse.hcmut.edu.vn',
        role: Role.STUDENT,
        fullName: 'Self',
      });
      expect(res.success).toBe(true);
      expect(res.data.id).toBe('self-id');
    });

    it('should allow admin to view any existing user profile', async () => {
      mockDb.queryOne.mockResolvedValueOnce(null);

      await expect(
        service.findById('missing-id', {
          userId: 'admin-id',
          email: 'admin@edupulse.hcmut.edu.vn',
          role: Role.ADMIN,
          fullName: 'Admin',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
