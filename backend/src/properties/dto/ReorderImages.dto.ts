import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, ArrayUnique, IsArray, IsInt } from 'class-validator';

export class ReorderImagesDto {
  @ApiProperty({
    description: 'Gallery image IDs in the desired display order',
    example: [12, 10, 11],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  imageIds: number[];
}
