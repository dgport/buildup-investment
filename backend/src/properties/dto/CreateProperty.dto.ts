import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  PropertyType,
  DealType,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
  City,
} from '@prisma/client';

// Helper function to convert string "true"/"false" to boolean
const toBoolean = ({ value }: { value: any }): boolean | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  return undefined;
};

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Type of property',
    enum: PropertyType,
    example: 'APARTMENT',
  })
  @IsEnum(PropertyType)
  @IsNotEmpty()
  propertyType: PropertyType;

  @ApiProperty({
    description: 'Deal type',
    enum: DealType,
    example: 'SALE',
  })
  @IsEnum(DealType)
  @IsNotEmpty()
  dealType: DealType;

  @ApiProperty({
    description: 'Property title (English)',
    example: 'Luxury Apartment in Old Batumi',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  // OPTIONAL FIELDS - Location
  @ApiPropertyOptional({
    description: 'City where property is located',
    enum: City,
    example: 'BATUMI',
  })
  @IsEnum(City)
  @IsOptional()
  city?: City;

  @ApiPropertyOptional({
    description: 'Property address',
    example: '123 Main Street, Batumi',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Specific location details (e.g., coordinates, landmarks)',
    example: '41.6168° N, 41.6367° E',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Property description (English)',
    example: 'Beautiful apartment with sea view...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Mark as hot sale',
    example: false,
  })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hotSale?: boolean;

  @ApiPropertyOptional({
    description: 'Is property publicly visible',
    example: true,
  })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  public?: boolean;

  @ApiPropertyOptional({
    description: 'Property price',
    example: 150000,
  })
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Total area in square meters',
    example: 85,
  })
  @IsOptional()
  totalArea?: number;

  @ApiPropertyOptional({
    description: 'Number of rooms',
    example: 3,
  })
  @IsOptional()
  rooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bedrooms',
    example: 2,
  })
  @IsOptional()
  bedrooms?: number;

  @ApiPropertyOptional({
    description: 'Number of bathrooms',
    example: 1,
  })
  @IsOptional()
  bathrooms?: number;

  @ApiPropertyOptional({
    description: 'Floor number',
    example: 5,
  })
  @IsOptional()
  floors?: number;

  @ApiPropertyOptional({
    description: 'Total number of floors in building',
    example: 10,
  })
  @IsOptional()
  floorsTotal?: number;

  @ApiPropertyOptional({
    description: 'Ceiling height in meters',
    example: 3.0,
  })
  @IsOptional()
  ceilingHeight?: number;

  @ApiPropertyOptional({
    description: 'Is non-standard layout',
    example: false,
  })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isNonStandard?: boolean;

  @ApiPropertyOptional({
    description: 'Occupancy status',
    enum: Occupancy,
  })
  @IsEnum(Occupancy)
  @IsOptional()
  occupancy?: Occupancy;

  @ApiPropertyOptional({
    description: 'Heating type',
    enum: HeatingType,
  })
  @IsEnum(HeatingType)
  @IsOptional()
  heating?: HeatingType;

  @ApiPropertyOptional({
    description: 'Hot water type',
    enum: HotWaterType,
  })
  @IsEnum(HotWaterType)
  @IsOptional()
  hotWater?: HotWaterType;

  @ApiPropertyOptional({
    description: 'Parking type',
    enum: ParkingType,
  })
  @IsEnum(ParkingType)
  @IsOptional()
  parking?: ParkingType;

  // Amenities - all optional boolean fields
  @ApiPropertyOptional({ description: 'Has air conditioner' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasConditioner?: boolean;

  @ApiPropertyOptional({ description: 'Has furniture' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasFurniture?: boolean;

  @ApiPropertyOptional({ description: 'Has bed' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasBed?: boolean;

  @ApiPropertyOptional({ description: 'Has sofa' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasSofa?: boolean;

  @ApiPropertyOptional({ description: 'Has table' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasTable?: boolean;

  @ApiPropertyOptional({ description: 'Has chairs' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasChairs?: boolean;

  @ApiPropertyOptional({ description: 'Has stove' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasStove?: boolean;

  @ApiPropertyOptional({ description: 'Has refrigerator' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasRefrigerator?: boolean;

  @ApiPropertyOptional({ description: 'Has oven' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasOven?: boolean;

  @ApiPropertyOptional({ description: 'Has washing machine' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasWashingMachine?: boolean;

  @ApiPropertyOptional({ description: 'Has kitchen appliances' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasKitchenAppliances?: boolean;

  @ApiPropertyOptional({ description: 'Has balcony' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasBalcony?: boolean;

  @ApiPropertyOptional({ description: 'Balcony area in square meters' })
  @IsOptional()
  balconyArea?: number;

  @ApiPropertyOptional({ description: 'Has natural gas' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasNaturalGas?: boolean;

  @ApiPropertyOptional({ description: 'Has internet' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasInternet?: boolean;

  @ApiPropertyOptional({ description: 'Has TV' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasTV?: boolean;

  @ApiPropertyOptional({ description: 'Has sewerage' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasSewerage?: boolean;

  @ApiPropertyOptional({ description: 'Is fenced' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  isFenced?: boolean;

  @ApiPropertyOptional({ description: 'Has yard lighting' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasYardLighting?: boolean;

  @ApiPropertyOptional({ description: 'Has grill' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasGrill?: boolean;

  @ApiPropertyOptional({ description: 'Has alarm system' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasAlarm?: boolean;

  @ApiPropertyOptional({ description: 'Has ventilation' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasVentilation?: boolean;

  @ApiPropertyOptional({ description: 'Has water supply' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasWater?: boolean;

  @ApiPropertyOptional({ description: 'Has electricity' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasElectricity?: boolean;

  @ApiPropertyOptional({ description: 'Has gate' })
  @Transform(toBoolean)
  @IsBoolean()
  @IsOptional()
  hasGate?: boolean;

  @ApiPropertyOptional({
    description: 'Property images (max 20)',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  images?: any;
}
