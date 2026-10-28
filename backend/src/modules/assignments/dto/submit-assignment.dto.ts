import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiPropertyOptional({
    example: 'Em nộp bài tập lớn nhóm 10. Phần Docker Compose đã được cấu hình tại docker-compose.yml',
    description: 'Ghi chú của học viên khi nộp bài',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'https://storage.googleapis.com/edupulse-uploads/assignment-10.zip',
    description: 'URL file bài nộp (nếu không upload qua form-data)',
  })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({
    example: 'group10-assignment1.zip',
    description: 'Tên file gốc ban đầu',
  })
  @IsOptional()
  @IsString()
  originalFilename?: string;

  @ApiPropertyOptional({
    example: 10485760,
    description: 'Kích thước file tính theo bytes',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  fileSizeBytes?: number;

  @ApiPropertyOptional({
    example: 'application/zip',
    description: 'MIME type của file',
  })
  @IsOptional()
  @IsString()
  mimeType?: string;
}
