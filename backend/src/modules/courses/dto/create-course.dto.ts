import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'CO3103', description: 'Mã định danh khóa học (duy nhất)' })
  @IsString()
  @IsNotEmpty({ message: 'Mã khóa học không được để trống' })
  code: string;

  @ApiProperty({ example: 'Integrated Software Engineering Project', description: 'Tiêu đề khóa học' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề khóa học không được để trống' })
  title: string;

  @ApiPropertyOptional({ example: 'Mô tả chi tiết nội dung môn học capstone...', description: 'Mô tả khóa học' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/thumbnail.jpg', description: 'Ảnh đại diện khóa học' })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 'Software Engineering', description: 'Danh mục khóa học' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' })
  @IsOptional()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  level?: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';

  @ApiPropertyOptional({ default: false, description: 'Trạng thái xuất bản khóa học' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = false;
}
