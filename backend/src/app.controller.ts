import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('System Health')
@Controller()
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của hệ thống (Health Check)' })
  healthCheck() {
    return {
      status: 'ok',
      service: 'EduPulse Backend API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
