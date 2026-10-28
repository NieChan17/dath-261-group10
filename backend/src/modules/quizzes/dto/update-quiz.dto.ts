import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateQuizDto {
  @ApiPropertyOptional({ example: 'Quiz tiêu đề mới', description: 'Tiêu đề bài kiểm tra' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Mô tả bài kiểm tra', description: 'Mô tả bài kiểm tra' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 75, description: 'Điểm sàn qua bài (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passScore?: number;

  @ApiPropertyOptional({ example: 20, description: 'Thời gian làm bài (phút)' })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;

  @ApiPropertyOptional({ example: 5, description: 'Số lần làm bài tối đa' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({ example: true, description: 'Xáo trộn câu hỏi' })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean;
}
