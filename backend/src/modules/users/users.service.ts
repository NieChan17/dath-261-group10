import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { PaginationQueryDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { Role } from '../../common/constants/roles.enum';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<any>> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (query.search && query.search.trim()) {
      whereClauses.push(
        `(u.full_name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`,
      );
      params.push(`%${query.search.trim()}%`);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count
    const countSql = `
      SELECT COUNT(*) as total 
      FROM users u
      ${whereSql}
    `;
    const countResult = await this.db.queryOne<{ total: string }>(countSql, params);
    const total = parseInt(countResult?.total || '0', 10);

    // Data query
    const dataSql = `
      SELECT u.id, u.email, u.full_name, u.avatar_url, u.created_at, r.name as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const users = await this.db.query(dataSql, params);
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      success: true,
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        role: u.role,
        avatarUrl: u.avatar_url,
        createdAt: u.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string) {
    const user = await this.db.queryOne(
      `SELECT u.id, u.email, u.full_name, u.avatar_url, u.created_at, r.name as role, r.permissions
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [id],
    );

    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        permissions: user.permissions,
      },
    };
  }

  async updateRole(userId: string, newRole: Role) {
    const roleRecord = await this.db.queryOne(
      'SELECT id, name FROM roles WHERE name = $1',
      [newRole],
    );

    if (!roleRecord) {
      throw new BadRequestException(`Vai trò '${newRole}' không hợp lệ`);
    }

    const updatedUser = await this.db.queryOne(
      `UPDATE users 
       SET role_id = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING id, email, full_name, avatar_url, created_at`,
      [roleRecord.id, userId],
    );

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }

    return {
      success: true,
      message: `Đã cập nhật vai trò của người dùng thành '${newRole}'`,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        role: roleRecord.name,
        avatarUrl: updatedUser.avatar_url,
      },
    };
  }
}
