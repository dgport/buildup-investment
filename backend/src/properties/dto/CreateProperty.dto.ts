import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import {
  PropertyType,
  DealType,
  Region,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
} from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ enum: DealType })
  @IsEnum(DealType)
  dealType: DealType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ enum: Region })
  @IsOptional()
  @IsEnum(Region)
  region?: Region;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hotSale?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  public?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  totalArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  rooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  bedrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  bathrooms?: number;

  @ApiPropertyOptional()
  @IsOptional()
  floors?: number;

  @ApiPropertyOptional()
  @IsOptional()
  floorsTotal?: number;

  @ApiPropertyOptional()
  @IsOptional()
  ceilingHeight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isNonStandard?: boolean;

  @ApiPropertyOptional({ enum: Occupancy })
  @IsOptional()
  @IsEnum(Occupancy)
  occupancy?: Occupancy;

  @ApiPropertyOptional({ enum: HeatingType })
  @IsOptional()
  @IsEnum(HeatingType)
  heating?: HeatingType;

  @ApiPropertyOptional({ enum: HotWaterType })
  @IsOptional()
  @IsEnum(HotWaterType)
  hotWater?: HotWaterType;

  @ApiPropertyOptional({ enum: ParkingType })
  @IsOptional()
  @IsEnum(ParkingType)
  parking?: ParkingType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasConditioner?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasFurniture?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasBed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasSofa?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasChairs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasStove?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasRefrigerator?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasOven?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasWashingMachine?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasKitchenAppliances?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasBalcony?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  balconyArea?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasNaturalGas?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasInternet?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTV?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasSewerage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFenced?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasYardLighting?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasGrill?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAlarm?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasVentilation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasWater?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasElectricity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasGate?: boolean;
}
