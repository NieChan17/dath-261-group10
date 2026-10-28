import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RubricEvaluationItemDto {
  @ApiProperty({
    example: 'c0310306-0000-0000-0000-000000000001',
    description: 'ID tiêu chí rubric được chấm',
  })
  @IsUUID()
  @IsNotEmpty()
  rubricId: string;

  @ApiProperty({
    example: 28.5,
    description: 'Điểm số giảng viên chấm cho tiêu chí này (<= max_points của rubric)',
  })
  @IsNumber()
  @Min(0, { message: 'Điểm tiêu chí không được nhỏ hơn 0' })
  pointsAwarded: number;

  @ApiPropertyOptional({
    example: 'Cấu trúc monorepo phân tách rõ ràng, các file cấu hình TypeScript chuẩn.',
    description: 'Nhận xét riêng cho tiêu chí này',
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}

export class GradeSubmissionDto {
  @ApiProperty({
    type: [RubricEvaluationItemDto],
    description: 'Bảng điểm chi tiết theo từng tiêu chí rubric của bài tập',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RubricEvaluationItemDto)
  evaluations: RubricEvaluationItemDto[];

  @ApiPropertyOptional({
    example: 'Bài làm rất tốt, Docker compose chạy ổn định. Cần tối ưu thêm kích thước image container.',
    description: 'Nhận xét tổng quan của giảng viên',
  })
  @IsOptional()
  @IsString()
  generalFeedback?: string;
}
