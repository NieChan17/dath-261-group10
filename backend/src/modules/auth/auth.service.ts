import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { DatabaseService } from '../../database/database.service';
import { PasswordService } from './security/password.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../../common/constants/roles.enum';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private db: DatabaseService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    // 1. Check if email already exists
    const existing = await this.db.queryOne(
      'SELECT id FROM users WHERE email = $1',
      [dto.email.toLowerCase().trim()],
    );
    if (existing) {
      throw new ConflictException('Email này đã được đăng ký trong hệ thống');
    }

    // 2. Validate role
    const requestedRole = dto.role || Role.STUDENT;
    const roleRecord = await this.db.queryOne(
      'SELECT id, name FROM roles WHERE name = $1',
      [requestedRole],
    );
    if (!roleRecord) {
      throw new BadRequestException(`Vai trò '${requestedRole}' không tồn tại trong hệ thống`);
    }

    // 3. Hash password using Argon2/bcrypt
    const passwordHash = await this.passwordService.hashPassword(dto.password);

    // 4. Insert user
    const newUser = await this.db.queryOne(
      `INSERT INTO users (role_id, email, password_hash, full_name, avatar_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, avatar_url, created_at`,
      [
        roleRecord.id,
        dto.email.toLowerCase().trim(),
        passwordHash,
        dto.fullName.trim(),
        dto.avatarUrl || null,
      ],
    );

    if (!newUser) {
      throw new InternalServerErrorException('Không thể tạo tài khoản');
    }

    const userData = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: roleRecord.name,
      avatarUrl: newUser.avatar_url,
      createdAt: newUser.created_at,
    };

    // 5. Generate tokens and set cookies
    const tokens = this.generateTokens(userData);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      success: true,
      message: 'Đăng ký tài khoản thành công',
      user: userData,
      accessToken: tokens.accessToken,
    };
  }

  async login(dto: LoginDto, res: Response) {
    // 1. Query user with role
    const user = await this.db.queryOne(
      `SELECT u.id, u.email, u.password_hash, u.full_name, u.avatar_url, u.created_at, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [dto.email.toLowerCase().trim()],
    );

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    // 2. Verify password with Argon2/bcrypt
    const isPasswordValid = await this.passwordService.verifyPassword(
      dto.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    };

    // 3. Generate tokens & set HttpOnly cookies
    const tokens = this.generateTokens(userData);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: userData,
      accessToken: tokens.accessToken,
    };
  }

  async refreshToken(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Không tìm thấy refresh token trong cookie');
    }

    try {
      const refreshSecret =
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'super-secret-refresh-key-edupulse-2026';

      const payload = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      const user = await this.db.queryOne(
        `SELECT u.id, u.email, u.full_name, u.avatar_url, u.created_at, r.name as role
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1`,
        [payload.sub],
      );

      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }

      const userData = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
      };

      const tokens = this.generateTokens(userData);
      this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      return {
        success: true,
        message: 'Làm mới token thành công',
        accessToken: tokens.accessToken,
        user: userData,
      };
    } catch (err) {
      this.clearAuthCookies(res);
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  logout(res: Response) {
    this.clearAuthCookies(res);
    return {
      success: true,
      message: 'Đăng xuất thành công, cookie đã được xóa an toàn',
    };
  }

  async getMe(userId: string) {
    const user = await this.db.queryOne(
      `SELECT u.id, u.email, u.full_name, u.avatar_url, u.created_at, r.name as role, r.permissions
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = $1`,
      [userId],
    );

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin tài khoản');
    }

    return {
      success: true,
      user: {
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

  private generateTokens(user: { id: string; email: string; role: string; fullName: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };

    const accessSecret =
      this.configService.get<string>('JWT_SECRET') ||
      'super-secret-edupulse-jwt-key-2026-hk261';
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super-secret-refresh-key-edupulse-2026';

    const accessToken = this.jwtService.sign(payload, {
      secret: accessSecret,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return { accessToken, refreshToken };
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    // Access Token Cookie (1 hour)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    // Refresh Token Cookie (7 days)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearAuthCookies(res: Response) {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }
}
