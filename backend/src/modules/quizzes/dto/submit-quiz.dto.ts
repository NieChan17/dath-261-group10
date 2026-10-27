import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerItemDto {
  @ApiProperty({
    example: 'c0310304-0000-0000-0000-000000000001',
    description: 'ID của câu hỏi',
  })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    example: 'HttpOnly',
    description: 'Câu trả lời của sinh viên (chuỗi hoặc mảng nếu chọn nhiều)',
  })
  @IsNotEmpty()
  answer: string | string[];
}

export class SubmitQuizDto {
  @ApiPropertyOptional({
    type: [QuizAnswerItemDto],
    description: 'Danh sách câu trả lời theo từng câu hỏi (dạng mảng)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerItemDto)
  answers?: QuizAnswerItemDto[];

  @ApiPropertyOptional({
    example: {
      'c0310304-0000-0000-0000-000000000001': 'HttpOnly',
      'c0310304-0000-0000-0000-000000000002': 'Argon2',
    },
    description: 'Hoặc gửi dạng Key-Value map: { [questionId]: answer }',
  })
  @IsOptional()
  answersMap?: Record<string, string | string[]>;

  @ApiPropertyOptional({
    example: '7780b0dd-b5f4-421a-88b8-c5ffe4347e87',
    description: 'ID của submission đang làm dở (nếu có)',
  })
  @IsOptional()
  @IsString()
  submissionId?: string;
}
