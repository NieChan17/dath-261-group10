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

export class RubricLevelDto {
  @ApiProperty({ example: 'Xuất sắc', description: 'Tên mức đánh giá' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 30, description: 'Điểm số tương ứng' })
  @IsNumber()
  @Min(0)
  points: number;

  @ApiPropertyOptional({ example: 'Đáp ứng toàn bộ tiêu chí một cách xuất sắc', description: 'Mô tả mức độ' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateRubricDto {
  @ApiProperty({
    example: 'Cấu trúc Monorepo & Kiến trúc dự án',
    description: 'Tên tiêu chí đánh giá (Criterion name)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên tiêu chí không được để trống' })
  criterionName: string;

  @ApiPropertyOptional({
    example: 'Đánh giá cấu trúc thư mục, phân tách backend/frontend, tsconfig...',
    description: 'Mô tả chi tiết tiêu chí',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 30,
    description: 'Điểm số tối đa của tiêu chí này',
  })
  @IsNumber()
  @Min(0.1, { message: 'Điểm tối đa phải lớn hơn 0' })
  maxPoints: number;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự tiêu chí trong bảng rubric' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({
    type: [RubricLevelDto],
    description: 'Danh sách các thang bậc đánh giá chi tiết (VD: Giỏi, Khá, Trung bình)',
  })
  @IsOptional()
  @IsArray()
  levels?: RubricLevelDto[];
}
