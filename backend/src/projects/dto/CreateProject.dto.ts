import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Luxury Residence', description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiProperty({ example: 'Batumi, Georgia', description: 'Project location' })
  @IsString()
  @IsNotEmpty()
  projectLocation: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Main project image',
  })
  image?: any;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Gallery images',
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
    description: 'Number of floors in the project',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numFloors?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Number of apartments in the project',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  numApartments?: number;

  @ApiProperty({ example: 1, description: 'Partner ID' })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  partnerId: number;
}
