import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 'Chương 1: Tổng quan quy trình Phần mềm', description: 'Tiêu đề chương mục' })
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề chương không được để trống' })
  title: string;

  @ApiPropertyOptional({ example: 1, description: 'Thứ tự hiển thị của chương mục (bắt đầu từ 0 hoặc 1)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
