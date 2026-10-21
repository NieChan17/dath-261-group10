import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsUUID, Min, ValidateNested } from 'class-validator';

export class SectionOrderItemDto {
  @ApiProperty({ example: 'c0310301-0000-0000-0000-000000000001', description: 'ID của chương mục' })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 1, description: 'Thứ tự hiển thị mới' })
  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderSectionsDto {
  @ApiProperty({ type: [SectionOrderItemDto], description: 'Danh sách các chương và thứ tự mới' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionOrderItemDto)
  sections: SectionOrderItemDto[];
}
