import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSectionDto {
  @ApiPropertyOptional({ example: 'Chương 1: Tổng quan quy trình Phần mềm (Cập nhật)', description: 'Tiêu đề chương' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 2, description: 'Thứ tự hiển thị' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
