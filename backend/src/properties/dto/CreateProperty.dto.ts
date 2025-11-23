import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsInt,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum PropertyType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND',
  HOTEL = 'HOTEL',
}

enum PropertyStatus {
  OLD_BUILDING = 'OLD_BUILDING',
  NEW_BUILDING = 'NEW_BUILDING',
  UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
}

enum PropertyCondition {
  NEWLY_RENOVATED = 'NEWLY_RENOVATED',
  OLD_RENOVATED = 'OLD_RENOVATED',
  REPAIRING = 'REPAIRING',
}

enum HeatingType {
  CENTRAL_HEATING = 'CENTRAL_HEATING',
  INDIVIDUAL = 'INDIVIDUAL',
  GAS = 'GAS',
  ELECTRIC = 'ELECTRIC',
  NONE = 'NONE',
}

enum ParkingType {
  PARKING_SPACE = 'PARKING_SPACE',
  GARAGE = 'GARAGE',
  OPEN_LOT = 'OPEN_LOT',
  NONE = 'NONE',
}

enum HotWaterType {
  CENTRAL_HEATING = 'CENTRAL_HEATING',
  BOILER = 'BOILER',
  SOLAR = 'SOLAR',
  NONE = 'NONE',
}

enum Occupancy {
  ONE = 'ONE',
  TWO = 'TWO',
  THREE = 'THREE',
  FOUR = 'FOUR',
  FIVE = 'FIVE',
  SIX = 'SIX',
  SEVEN = 'SEVEN',
  EIGHT = 'EIGHT',
  NINE = 'NINE',
  TEN_PLUS = 'TEN_PLUS',
}

export class CreatePropertyDto {
  @ApiProperty({
    description: 'Type of property',
    enum: PropertyType,
    example: 'APARTMENT',
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({
    description: 'Status of the property',
    enum: PropertyStatus,
    example: 'NEW_BUILDING',
  })
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  @ApiProperty({ description: 'Property address', example: '123 Main Street' })
  @IsString()
  address: string;

  @ApiPropertyOptional({ description: 'Property price', example: 150000 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsInt()
  price?: number;

  @ApiPropertyOptional({
    description: 'Property title (English)',
    example: 'Luxury Apartment',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Property description (English)',
    example: 'Beautiful apartment with sea view',
  })
  @IsOptional()
  @IsString()
  description?: string;

  // Main details
  @ApiPropertyOptional({ description: 'Total area in sq meters', example: 120 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsInt()
  totalArea?: number;

  @ApiPropertyOptional({ description: 'Number of rooms', example: 3 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsInt()
  rooms?: number;

  @ApiPropertyOptional({ description: 'Number of bedrooms', example: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsInt()
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Number of bathrooms', example: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsInt()
  bathrooms?: number;

  @ApiPropertyOptional({
    description: 'Floor number',
    example: 5,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsInt()
  floors?: number;

  @ApiPropertyOptional({
    description: 'Total number of floors in building',
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : null))
  @IsInt()
  floorsTotal?: number;

  @ApiPropertyOptional({
    description: 'Ceiling height in meters',
    example: 3.0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber()
  ceilingHeight?: number;

  // Condition & Status
  @ApiPropertyOptional({
    description: 'Property condition',
    enum: PropertyCondition,
    example: 'NEWLY_RENOVATED',
  })
  @IsOptional()
  @IsEnum(PropertyCondition)
  condition?: PropertyCondition;

  @ApiPropertyOptional({
    description: 'Is non-standard layout',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isNonStandard?: boolean;

  // Occupancy
  @ApiPropertyOptional({
    description: 'Occupancy capacity',
    enum: Occupancy,
    example: 'FOUR',
  })
  @IsOptional()
  @IsEnum(Occupancy)
  occupancy?: Occupancy;

  // Utilities
  @ApiPropertyOptional({
    description: 'Heating type',
    enum: HeatingType,
    example: 'CENTRAL_HEATING',
  })
  @IsOptional()
  @IsEnum(HeatingType)
  heating?: HeatingType;

  @ApiPropertyOptional({
    description: 'Hot water type',
    enum: HotWaterType,
    example: 'BOILER',
  })
  @IsOptional()
  @IsEnum(HotWaterType)
  hotWater?: HotWaterType;

  @ApiPropertyOptional({
    description: 'Parking type',
    enum: ParkingType,
    example: 'GARAGE',
  })
  @IsOptional()
  @IsEnum(ParkingType)
  parking?: ParkingType;

  // Amenities
  @ApiPropertyOptional({ description: 'Has air conditioner', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasConditioner?: boolean;

  @ApiPropertyOptional({ description: 'Has furniture', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasFurniture?: boolean;

  @ApiPropertyOptional({ description: 'Has bed', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasBed?: boolean;

  @ApiPropertyOptional({ description: 'Has sofa', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasSofa?: boolean;

  @ApiPropertyOptional({ description: 'Has table', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasTable?: boolean;

  @ApiPropertyOptional({ description: 'Has chairs', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasChairs?: boolean;

  @ApiPropertyOptional({ description: 'Has stove', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasStove?: boolean;

  @ApiPropertyOptional({ description: 'Has refrigerator', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasRefrigerator?: boolean;

  @ApiPropertyOptional({ description: 'Has oven', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasOven?: boolean;

  @ApiPropertyOptional({ description: 'Has washing machine', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasWashingMachine?: boolean;

  @ApiPropertyOptional({
    description: 'Has kitchen appliances',
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasKitchenAppliances?: boolean;

  @ApiPropertyOptional({ description: 'Has balcony', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasBalcony?: boolean;

  @ApiPropertyOptional({
    description: 'Balcony area in sq meters',
    example: 10.5,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : null))
  @IsNumber()
  balconyArea?: number;

  @ApiPropertyOptional({ description: 'Has natural gas', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasNaturalGas?: boolean;

  @ApiPropertyOptional({ description: 'Has internet', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasInternet?: boolean;

  @ApiPropertyOptional({ description: 'Has TV', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasTV?: boolean;

  @ApiPropertyOptional({ description: 'Has sewerage', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasSewerage?: boolean;

  @ApiPropertyOptional({ description: 'Is fenced', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFenced?: boolean;

  @ApiPropertyOptional({ description: 'Has yard lighting', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasYardLighting?: boolean;

  @ApiPropertyOptional({ description: 'Has grill', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasGrill?: boolean;

  @ApiPropertyOptional({ description: 'Has alarm system', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasAlarm?: boolean;

  @ApiPropertyOptional({ description: 'Has ventilation', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasVentilation?: boolean;

  @ApiPropertyOptional({ description: 'Has water supply', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasWater?: boolean;

  @ApiPropertyOptional({ description: 'Has electricity', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasElectricity?: boolean;

  @ApiPropertyOptional({ description: 'Has gate', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasGate?: boolean;

  @ApiPropertyOptional({
    description: 'Property images',
    type: 'array',
    items: { type: 'string', format: 'binary' },
  })
  images?: any[];
}
