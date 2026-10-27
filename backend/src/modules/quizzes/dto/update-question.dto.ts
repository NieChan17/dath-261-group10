import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateQuestionDto {
  @ApiPropertyOptional({ example: 'Nội dung câu hỏi cập nhật', description: 'Nội dung câu hỏi' })
  @IsOptional()
  @IsString()
  prompt?: string;

  @ApiPropertyOptional({ example: 'multiple_choice', description: 'Loại câu hỏi' })
  @IsOptional()
  @IsString()
  questionType?: string;

  @ApiPropertyOptional({ example: 10, description: 'Điểm số của câu hỏi' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @ApiPropertyOptional({ example: ['A', 'B', 'C', 'D'], description: 'Danh sách lựa chọn' })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiPropertyOptional({ example: 'A', description: 'Đáp án chính xác' })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiPropertyOptional({ example: 'Giải thích chi tiết đáp án', description: 'Giải thích' })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ example: 2, description: 'Thứ tự câu hỏi' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
