import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination.dto';

export class CourseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Lọc theo danh mục khóa học (ví dụ: Software Engineering, Computer Science)' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo cấp độ khóa học',
    enum: ['Beginner', 'Intermediate', 'Advanced'],
  })
  @IsOptional()
  @IsIn(['Beginner', 'Intermediate', 'Advanced'])
  level?: 'Beginner' | 'Intermediate' | 'Advanced';

  @ApiPropertyOptional({ description: 'Lọc theo ID giảng viên' })
  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái xuất bản (Chỉ Admin/Instructor có hiệu lực)' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true || value === 1 || value === '1') return true;
    if (value === 'false' || value === false || value === 0 || value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  isPublished?: boolean;
}
