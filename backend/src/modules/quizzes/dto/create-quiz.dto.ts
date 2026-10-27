import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class CreateQuizDto {
  @ApiProperty({
    example: 'Quiz 2.2: Trắc nghiệm kiến trúc RBAC & Token Auth',
    description: 'Tiêu đề bài kiểm tra trắc nghiệm',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề bài thi không được để trống' })
  title: string;

  @ApiPropertyOptional({
    example: 'Bài kiểm tra gồm 10 câu hỏi trắc nghiệm, thời gian 15 phút.',
    description: 'Mô tả hướng dẫn làm bài',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 80,
    description: 'Điểm sàn để qua bài (tính theo thang 100)',
    default: 80,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passScore?: number = 80;

  @ApiPropertyOptional({
    example: 15,
    description: 'Thời gian làm bài tính bằng phút (null nếu không giới hạn)',
    default: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number = 15;

  @ApiPropertyOptional({
    example: 3,
    description: 'Số lần tối đa được làm bài (null là không giới hạn)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Có xáo trộn thứ tự câu hỏi khi học viên làm bài hay không',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  shuffleQuestions?: boolean = false;

  @ApiPropertyOptional({
    type: [CreateQuestionDto],
    description: 'Danh sách các câu hỏi ban đầu',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}
