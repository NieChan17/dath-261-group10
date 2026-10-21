import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateLessonDto {
  @ApiPropertyOptional({ description: 'Tiêu đề bài học' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    enum: ['video', 'slides', 'text', 'quiz', 'assignment'],
    description: 'Định dạng nội dung bài học',
  })
  @IsOptional()
  @IsIn(['video', 'slides', 'text', 'quiz', 'assignment'])
  contentType?: string;

  @ApiPropertyOptional({ description: 'Thời lượng ước tính (phút)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
