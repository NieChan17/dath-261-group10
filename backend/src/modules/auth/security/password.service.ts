import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private argon2Module: any = null;

  constructor() {
    try {
      // Dynamically require argon2 to allow seamless fallback if native binary has platform quirks
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.argon2Module = require('argon2');
      this.logger.log('Argon2 module loaded successfully for primary password hashing');
    } catch (e) {
      this.logger.warn('Argon2 could not be loaded; falling back to bcryptjs for password hashing');
    }
  }

  async hashPassword(password: string): Promise<string> {
    if (this.argon2Module) {
      try {
        return await this.argon2Module.hash(password, {
          type: this.argon2Module.argon2id,
          memoryCost: 2 ** 16, // 64 MB
          timeCost: 3,
          parallelism: 1,
        });
      } catch (err) {
        this.logger.warn(`Argon2 hash failed (${err.message}), falling back to bcrypt`);
      }
    }
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) return false;

    // Detect if hash is Argon2
    if (hash.startsWith('$argon2') && this.argon2Module) {
      try {
        return await this.argon2Module.verify(hash, password);
      } catch (err) {
        this.logger.error('Argon2 verification error', err);
        return false;
      }
    }

    // Detect if hash is Bcrypt
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
      return bcrypt.compare(password, hash);
    }

    // Fallback: try bcrypt then argon2
    try {
      const match = await bcrypt.compare(password, hash);
      if (match) return true;
    } catch {
      // not a bcrypt hash
    }

    if (this.argon2Module) {
      try {
        return await this.argon2Module.verify(hash, password);
      } catch {
        return false;
      }
    }

    return false;
  }
}
