import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @ApiProperty({
    example: 'Cờ bảo mật nào trong Cookie ngăn chặn truy cập từ Javascript?',
    description: 'Nội dung câu hỏi',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung câu hỏi không được để trống' })
  prompt: string;

  @ApiPropertyOptional({
    example: 'multiple_choice',
    description: 'Loại câu hỏi (multiple_choice, single_choice, true_false)',
    default: 'multiple_choice',
  })
  @IsOptional()
  @IsString()
  questionType?: string = 'multiple_choice';

  @ApiPropertyOptional({ example: 5, description: 'Điểm số của câu hỏi', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number = 1;

  @ApiProperty({
    example: ['HttpOnly', 'Secure', 'SameSite', 'Domain'],
    description: 'Danh sách các lựa chọn trả lời',
  })
  @IsArray()
  options: string[];

  @ApiProperty({
    example: 'HttpOnly',
    description: 'Đáp án chính xác',
  })
  @IsString()
  @IsNotEmpty({ message: 'Đáp án đúng không được để trống' })
  correctAnswer: string;

  @ApiPropertyOptional({
    example: 'HttpOnly cookie ngăn mã client-side truy xuất token, giảm thiểu nguy cơ đánh cắp token qua XSS.',
    description: 'Giải thích chi tiết cho đáp án',
  })
  @IsOptional()
  @IsString()
  explanation?: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự câu hỏi' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
