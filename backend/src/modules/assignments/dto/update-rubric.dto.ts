import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { RubricLevelDto } from './create-rubric.dto';

export class UpdateRubricDto {
  @ApiPropertyOptional({ example: 'Tên tiêu chí cập nhật', description: 'Tên tiêu chí' })
  @IsOptional()
  @IsString()
  criterionName?: string;

  @ApiPropertyOptional({ example: 'Mô tả tiêu chí cập nhật', description: 'Mô tả tiêu chí' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 40, description: 'Điểm tối đa' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  maxPoints?: number;

  @ApiPropertyOptional({ example: 2, description: 'Thứ tự tiêu chí' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ type: [RubricLevelDto], description: 'Các mức đánh giá' })
  @IsOptional()
  @IsArray()
  levels?: RubricLevelDto[];
}
