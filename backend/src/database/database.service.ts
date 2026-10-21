import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor(private configService: ConfigService) {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      'postgresql://edupulse_user:secure_staging_password@localhost:5432/edupulse_staging';

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      const res = await client.query('SELECT NOW() as current_time, version()');
      client.release();
      this.logger.log(
        `Connected to PostgreSQL successfully at: ${res.rows[0].current_time}`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not connect to PostgreSQL immediately: ${error.message}. Continuing startup...`,
      );
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('PostgreSQL connection pool closed');
  }

  getPool(): Pool {
    return this.pool;
  }

  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<T[]> {
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        this.logger.warn(`Slow query (${duration}ms): ${text}`);
      }
      return res.rows;
    } catch (error) {
      this.logger.error(`Database query failed: ${text}`, error.stack);
      throw error;
    }
  }

  async queryOne<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
