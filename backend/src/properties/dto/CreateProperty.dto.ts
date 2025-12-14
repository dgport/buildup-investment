import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import {
  PropertyType,
  PropertyStatus,
  PropertyCondition,
  DealType,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
} from '@prisma/client';

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
    description: 'Property address',
    example: '123 Main Street, Batumi',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Property title (English)',
    example: 'Luxury Apartment in Old Batumi',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Property description (English)',
    example: 'Beautiful apartment with sea view...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Property status',
    enum: PropertyStatus,
  })
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  @ApiPropertyOptional({
    description: 'Deal type',
    enum: DealType,
  })
  @IsEnum(DealType)
  @IsOptional()
  dealType?: DealType;

  @ApiPropertyOptional({
    description: 'Mark as hot sale',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  hotSale?: boolean;

  @ApiPropertyOptional({
    description: 'Is property publicly visible',
    example: true,
  })
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
    description: 'Property condition',
    enum: PropertyCondition,
  })
  @IsEnum(PropertyCondition)
  @IsOptional()
  condition?: PropertyCondition;

  @ApiPropertyOptional({
    description: 'Is non-standard layout',
    example: false,
  })
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
  @IsBoolean()
  @IsOptional()
  hasConditioner?: boolean;

  @ApiPropertyOptional({ description: 'Has furniture' })
  @IsBoolean()
  @IsOptional()
  hasFurniture?: boolean;

  @ApiPropertyOptional({ description: 'Has bed' })
  @IsBoolean()
  @IsOptional()
  hasBed?: boolean;

  @ApiPropertyOptional({ description: 'Has sofa' })
  @IsBoolean()
  @IsOptional()
  hasSofa?: boolean;

  @ApiPropertyOptional({ description: 'Has table' })
  @IsBoolean()
  @IsOptional()
  hasTable?: boolean;

  @ApiPropertyOptional({ description: 'Has chairs' })
  @IsBoolean()
  @IsOptional()
  hasChairs?: boolean;

  @ApiPropertyOptional({ description: 'Has stove' })
  @IsBoolean()
  @IsOptional()
  hasStove?: boolean;

  @ApiPropertyOptional({ description: 'Has refrigerator' })
  @IsBoolean()
  @IsOptional()
  hasRefrigerator?: boolean;

  @ApiPropertyOptional({ description: 'Has oven' })
  @IsBoolean()
  @IsOptional()
  hasOven?: boolean;

  @ApiPropertyOptional({ description: 'Has washing machine' })
  @IsBoolean()
  @IsOptional()
  hasWashingMachine?: boolean;

  @ApiPropertyOptional({ description: 'Has kitchen appliances' })
  @IsBoolean()
  @IsOptional()
  hasKitchenAppliances?: boolean;

  @ApiPropertyOptional({ description: 'Has balcony' })
  @IsBoolean()
  @IsOptional()
  hasBalcony?: boolean;

  @ApiPropertyOptional({ description: 'Balcony area in square meters' })
  @IsOptional()
  balconyArea?: number;

  @ApiPropertyOptional({ description: 'Has natural gas' })
  @IsBoolean()
  @IsOptional()
  hasNaturalGas?: boolean;

  @ApiPropertyOptional({ description: 'Has internet' })
  @IsBoolean()
  @IsOptional()
  hasInternet?: boolean;

  @ApiPropertyOptional({ description: 'Has TV' })
  @IsBoolean()
  @IsOptional()
  hasTV?: boolean;

  @ApiPropertyOptional({ description: 'Has sewerage' })
  @IsBoolean()
  @IsOptional()
  hasSewerage?: boolean;

  @ApiPropertyOptional({ description: 'Is fenced' })
  @IsBoolean()
  @IsOptional()
  isFenced?: boolean;

  @ApiPropertyOptional({ description: 'Has yard lighting' })
  @IsBoolean()
  @IsOptional()
  hasYardLighting?: boolean;

  @ApiPropertyOptional({ description: 'Has grill' })
  @IsBoolean()
  @IsOptional()
  hasGrill?: boolean;

  @ApiPropertyOptional({ description: 'Has alarm system' })
  @IsBoolean()
  @IsOptional()
  hasAlarm?: boolean;

  @ApiPropertyOptional({ description: 'Has ventilation' })
  @IsBoolean()
  @IsOptional()
  hasVentilation?: boolean;

  @ApiPropertyOptional({ description: 'Has water supply' })
  @IsBoolean()
  @IsOptional()
  hasWater?: boolean;

  @ApiPropertyOptional({ description: 'Has electricity' })
  @IsBoolean()
  @IsOptional()
  hasElectricity?: boolean;

  @ApiPropertyOptional({ description: 'Has gate' })
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
