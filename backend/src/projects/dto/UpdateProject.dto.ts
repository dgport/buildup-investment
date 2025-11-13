import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Luxury Residence' })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiPropertyOptional({ example: 'Batumi, Georgia' })
  @IsOptional()
  @IsString()
  projectLocation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Main project image',
  })
  image?: any;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Gallery images (will be added to existing)',
  })
  gallery?: any;

  @ApiPropertyOptional({
    example: 50000,
    description: 'Starting price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceFrom?: number;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Expected delivery date',
  })
  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of floors',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numFloors?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Number of apartments',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numApartments?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partnerId?: number;
}
