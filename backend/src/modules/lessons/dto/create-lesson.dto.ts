import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ example: 'Bài 1.1: Tổng quan quy trình Software Engineering', description: 'Tiêu đề bài học' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề bài học không được để trống' })
  title: string;

  @ApiProperty({
    example: 'video',
    enum: ['video', 'slides', 'text', 'quiz', 'assignment'],
    description: 'Định dạng nội dung học tập chính',
  })
  @IsString()
  @IsIn(['video', 'slides', 'text', 'quiz', 'assignment'])
  contentType: string;

  @ApiPropertyOptional({ example: 45, description: 'Thời lượng ước tính (phút)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number = 0;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị bài học trong chương' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
