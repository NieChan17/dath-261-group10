import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateAssignmentDto {
  @ApiPropertyOptional({ example: 'Tiêu đề bài tập mới', description: 'Tiêu đề' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Mô tả bài tập mới', description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: ['zip', 'pdf'], description: 'Định dạng file cho phép' })
  @IsOptional()
  @IsArray()
  allowedFileTypes?: string[];

  @ApiPropertyOptional({ example: 50, description: 'Dung lượng tối đa (MB)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxFileSizeMb?: number;

  @ApiPropertyOptional({ example: '2026-11-20T23:59:59.000Z', description: 'Hạn nộp bài' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ example: 100, description: 'Tổng điểm tối đa' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalPoints?: number;

  @ApiPropertyOptional({ example: 60, description: 'Điểm sàn qua bài' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passScore?: number;
}
