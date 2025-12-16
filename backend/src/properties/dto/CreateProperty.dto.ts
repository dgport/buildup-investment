import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  PropertyType,
  DealType,
  Region,
  HeatingType,
  HotWaterType,
  ParkingType,
  Occupancy,
} from '@prisma/client';
import { Transform } from 'class-transformer';

export class CreatePropertyDto {
  @ApiProperty({ enum: PropertyType })
  propertyType: PropertyType;

  @ApiProperty({ enum: DealType })
  dealType: DealType;

  @ApiPropertyOptional()
  location?: string; // City name like "Batumi", "Tbilisi"

  @ApiPropertyOptional({ enum: Region })
  region?: Region;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Location (city name as string)',
    example: 'Batumi',
  })
  @ApiProperty({
    description: 'Property title',
    example: 'Luxury Apartment with Sea View',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Property description',
    example: 'Beautiful apartment with stunning sea views...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Property price',
    example: 150000,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  price?: number;

  @ApiPropertyOptional({
    description: 'Hot sale flag',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hotSale?: boolean;

  @ApiPropertyOptional({
    description: 'Public visibility',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  public?: boolean;

  @ApiPropertyOptional({
    description: 'Total area in square meters',
    example: 85,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  totalArea?: number;

  @ApiPropertyOptional({
    description: 'Number of rooms',
    example: 3,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  rooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bedrooms',
    example: 2,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  bedrooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bathrooms',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  bathrooms?: number;

  @ApiPropertyOptional({
    description: 'Floor number',
    example: 5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  floors?: number;

  @ApiPropertyOptional({
    description: 'Total floors in building',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  floorsTotal?: number;

  @ApiPropertyOptional({
    description: 'Ceiling height in meters',
    example: 3.2,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  ceilingHeight?: number;

  @ApiPropertyOptional({
    description: 'Non-standard layout flag',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isNonStandard?: boolean;

  @ApiPropertyOptional({
    description: 'Occupancy type',
    enum: Occupancy,
    example: Occupancy.TWO,
  })
  @IsEnum(Occupancy)
  @IsOptional()
  occupancy?: Occupancy;

  @ApiPropertyOptional({
    description: 'Heating type',
    enum: HeatingType,
    example: HeatingType.CENTRAL_HEATING,
  })
  @IsEnum(HeatingType)
  @IsOptional()
  heating?: HeatingType;

  @ApiPropertyOptional({
    description: 'Hot water type',
    enum: HotWaterType,
    example: HotWaterType.CENTRAL_HEATING,
  })
  @IsEnum(HotWaterType)
  @IsOptional()
  hotWater?: HotWaterType;

  @ApiPropertyOptional({
    description: 'Parking type',
    enum: ParkingType,
    example: ParkingType.PARKING_SPACE,
  })
  @IsEnum(ParkingType)
  @IsOptional()
  parking?: ParkingType;

  // Boolean amenities
  @ApiPropertyOptional({
    description: 'Has air conditioner',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasConditioner?: boolean;

  @ApiPropertyOptional({
    description: 'Has furniture',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasFurniture?: boolean;

  @ApiPropertyOptional({
    description: 'Has bed',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasBed?: boolean;

  @ApiPropertyOptional({
    description: 'Has sofa',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasSofa?: boolean;

  @ApiPropertyOptional({
    description: 'Has table',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasTable?: boolean;

  @ApiPropertyOptional({
    description: 'Has chairs',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasChairs?: boolean;

  @ApiPropertyOptional({
    description: 'Has stove',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasStove?: boolean;

  @ApiPropertyOptional({
    description: 'Has refrigerator',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasRefrigerator?: boolean;

  @ApiPropertyOptional({
    description: 'Has oven',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasOven?: boolean;

  @ApiPropertyOptional({
    description: 'Has washing machine',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasWashingMachine?: boolean;

  @ApiPropertyOptional({
    description: 'Has kitchen appliances',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasKitchenAppliances?: boolean;

  @ApiPropertyOptional({
    description: 'Has balcony',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasBalcony?: boolean;

  @ApiPropertyOptional({
    description: 'Balcony area in square meters',
    example: 5.5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  balconyArea?: number;

  @ApiPropertyOptional({
    description: 'Has natural gas',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasNaturalGas?: boolean;

  @ApiPropertyOptional({
    description: 'Has internet',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasInternet?: boolean;

  @ApiPropertyOptional({
    description: 'Has TV',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasTV?: boolean;

  @ApiPropertyOptional({
    description: 'Has sewerage',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasSewerage?: boolean;

  @ApiPropertyOptional({
    description: 'Is fenced',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFenced?: boolean;

  @ApiPropertyOptional({
    description: 'Has yard lighting',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasYardLighting?: boolean;

  @ApiPropertyOptional({
    description: 'Has grill',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasGrill?: boolean;

  @ApiPropertyOptional({
    description: 'Has alarm',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasAlarm?: boolean;

  @ApiPropertyOptional({
    description: 'Has ventilation',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasVentilation?: boolean;

  @ApiPropertyOptional({
    description: 'Has water',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasWater?: boolean;

  @ApiPropertyOptional({
    description: 'Has electricity',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasElectricity?: boolean;

  @ApiPropertyOptional({
    description: 'Has gate',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  hasGate?: boolean;

  @ApiPropertyOptional({
    description: 'Property images (multiple files)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  images?: any;
}
