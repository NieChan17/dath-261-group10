import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateLessonProgressDto {
  @ApiPropertyOptional({ example: true, description: 'Đánh dấu bài học đã hoàn thành' })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;

  @ApiPropertyOptional({ example: 125, minimum: 0, description: 'Vị trí video gần nhất (giây)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  lastPositionSeconds?: number;
}
