import { Controller, Get, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from './common/decorators/public.decorator';
import { DatabaseService } from './database/database.service';

@ApiTags('System Health')
@Controller()
export class AppController {
  constructor(@Optional() private readonly db?: DatabaseService) {}

  @Public()
  @SkipThrottle()
  @Get('health')
  @ApiOperation({ summary: 'System health and database readiness check' })
  async healthCheck() {
    let database = 'unknown';
    if (this.db) {
      try {
        await this.db.queryOne('SELECT 1 AS ok');
        database = 'connected';
      } catch {
        database = 'disconnected';
      }
    }

    return {
      status: database === 'disconnected' ? 'degraded' : 'ok',
      service: 'EduPulse Backend API',
      version: '1.0.0',
      database,
      timestamp: new Date().toISOString(),
    };
  }
}
