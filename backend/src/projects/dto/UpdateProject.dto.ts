import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  Min,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export enum Region {
  BATUMI = 'BATUMI',
  KOBULETI = 'KOBULETI',
  CHAKVI = 'CHAKVI',
  MAKHINJAURI = 'MAKHINJAURI',
  GONIO = 'GONIO',
  UREKI = 'UREKI',
}
export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Luxury Residence' })
  @IsOptional()
  @IsString()
  projectName?: string;

  @ApiPropertyOptional({
    example: '41.6168,41.6401',
    description: 'Coordinates (latitude,longitude)',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'Rustaveli Avenue 45, Batumi',
    description: 'Street address from map',
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({
    enum: Region,
    example: Region.BATUMI,
  })
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

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
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return false;
  })
  @IsBoolean()
  hotSale?: boolean;

  @ApiPropertyOptional({
    description: 'Make project publicly visible',
    default: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return true;
  })
  @IsBoolean()
  public?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : parseInt(value, 10)))
  @IsInt()
  partnerId?: number;
}
