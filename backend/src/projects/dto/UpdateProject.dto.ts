import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsBoolean,
} from 'class-validator';

const toBoolean = ({ value }: { value: any }): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === '1';
  }
  if (typeof value === 'number') return value === 1;
  return false;
};

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
    description: 'Starting price (integer)',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)))
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
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  @Min(1)
  numFloors?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Number of apartments',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  @Min(1)
  numApartments?: number;

  @ApiPropertyOptional({ description: 'Mark as hot sale', default: false })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  hotSale?: boolean;

  @ApiPropertyOptional({
    description: 'Make project publicly visible',
    default: true,
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  public?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  partnerId?: number;
}
