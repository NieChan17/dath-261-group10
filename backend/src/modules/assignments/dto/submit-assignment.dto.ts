import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SubmitAssignmentDto {
  @ApiPropertyOptional({
    example: 'Submission notes describing implementation details.',
    description: 'Student submission notes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;

  @ApiPropertyOptional({
    example: 'https://storage.googleapis.com/edupulse-uploads/assignment-10.zip',
    description: 'External submission file URL (HTTP/HTTPS only when not uploading multipart)',
  })
  @IsOptional()
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'fileUrl must be a valid http:// or https:// URL' },
  )
  @MaxLength(2048)
  fileUrl?: string;

  @ApiPropertyOptional({
    example: 'group10-assignment1.zip',
    description: 'Original filename',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  originalFilename?: string;

  @ApiPropertyOptional({
    example: 10485760,
    description: 'File size in bytes',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50 * 1024 * 1024)
  fileSizeBytes?: number;

  @ApiPropertyOptional({
    example: 'application/zip',
    description: 'File MIME type',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;
}
