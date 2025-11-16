import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsBoolean,
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
    description: 'Number of floors in the project',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  @Min(1)
  numFloors?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Number of apartments in the project',
  })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  @Min(1)
  numApartments?: number;

  @ApiPropertyOptional({ description: 'Mark as hot sale', default: false })
  @IsOptional()
  @Transform(({ value }) => {
    console.log(
      '🔥 hotSale TRANSFORM - raw value:',
      JSON.stringify(value),
      'type:',
      typeof value,
    );
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  hotSale?: boolean;

  @ApiPropertyOptional({
    description: 'Make project publicly visible',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    console.log(
      '👁️ public TRANSFORM - raw value:',
      JSON.stringify(value),
      'type:',
      typeof value,
    );
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  public?: boolean;

  @ApiProperty({ example: 1, description: 'Partner ID' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsNotEmpty()
  partnerId: number;
}
