import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateCourseDto {
  @ApiPropertyOptional({ example: 'Integrated Software Engineering Project (Updated)', description: 'Tiêu đề khóa học' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Mã môn học' })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiPropertyOptional({ description: 'Mô tả khóa học' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Ảnh đại diện khóa học' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ description: 'Danh mục khóa học' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['Beginner', 'Intermediate', 'Advanced'] })
  @IsOptional()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  level?: 'Beginner' | 'Intermediate' | 'Advanced';

  @ApiPropertyOptional({ description: 'Trạng thái xuất bản' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
