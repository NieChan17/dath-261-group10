import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
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
import { CreateRubricDto } from './create-rubric.dto';

export class CreateAssignmentDto {
  @ApiProperty({
    example: 'Bài tập lớn 1: Thiết lập Monorepo & Cấu hình CI/CD Pipeline',
    description: 'Tiêu đề bài tập nộp file',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề bài tập không được để trống' })
  title: string;

  @ApiProperty({
    example: 'Sinh viên đóng gói mã nguồn hoặc tài liệu cấu hình monorepo, docker-compose dạng file ZIP.',
    description: 'Mô tả chi tiết và yêu cầu bài tập',
  })
  @IsString()
  @IsNotEmpty({ message: 'Mô tả bài tập không được để trống' })
  description: string;

  @ApiPropertyOptional({
    example: ['zip', 'pdf', 'tar.gz', 'docx'],
    description: 'Danh sách các đuôi file được phép nộp (không có dấu chấm)',
    default: ['zip', 'pdf', 'tar.gz'],
  })
  @IsOptional()
  @IsArray()
  allowedFileTypes?: string[] = ['zip', 'pdf', 'tar.gz'];

  @ApiPropertyOptional({
    example: 25,
    description: 'Dung lượng file tối đa cho phép (MB)',
    default: 25,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxFileSizeMb?: number = 25;

  @ApiPropertyOptional({
    example: '2026-11-15T23:59:59.000Z',
    description: 'Hạn chót nộp bài (ISO 8601 string)',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Tổng điểm tối đa của bài tập',
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalPoints?: number = 100;

  @ApiPropertyOptional({
    example: 50,
    description: 'Điểm sàn để qua bài tập (0-100)',
    default: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  passScore?: number = 50;

  @ApiPropertyOptional({
    type: [CreateRubricDto],
    description: 'Bảng tiêu chí rubric chấm điểm đính kèm bài tập',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRubricDto)
  rubrics?: CreateRubricDto[];
}
