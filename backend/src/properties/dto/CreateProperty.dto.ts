import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PropertyType,
  DealType,
  Region,
  HeatingType,
  ParkingType,
  HotWaterType,
  Occupancy,
} from '@prisma/client';
import {
  ToBoolean,
  ToNumber,
  TrimToNull,
} from '@/common/decorators/transform.decorators';

/**
 * Property payload. Sent as multipart/form-data (together with `images[]`),
 * so every scalar arrives as a string and is converted by the decorators.
 */
export class CreatePropertyDto {
  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ enum: DealType })
  @IsEnum(DealType)
  dealType: DealType;

  // ─── Translatable texts ────────────────────────────────────────────────────
  // At least one title (in any language) is required – checked in the service.

  @ApiPropertyOptional({ description: 'Title (English). Alias of titleEn.' })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(200)
  title?: string | null;

  @ApiPropertyOptional({
    description: 'Description (English). Alias of descriptionEn.',
  })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(5000)
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(200)
  titleEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(200)
  titleKa?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(200)
  titleRu?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(5000)
  descriptionEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(5000)
  descriptionKa?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(5000)
  descriptionRu?: string | null;

  // ─── Location ──────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Map pin as "lat,lng"',
    example: '41.6401,41.6168',
  })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @Matches(/^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/, {
    message: 'location must be "lat,lng"',
  })
  location?: string | null;

  @ApiPropertyOptional({ enum: Region })
  @IsOptional()
  @TrimToNull()
  @IsEnum(Region)
  region?: Region | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(300)
  address?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(40)
  contactPhone?: string | null;

  // ─── Numbers ───────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ description: 'Price in USD' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  price?: number | null;

  @ApiPropertyOptional({ description: 'Total area in m²' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  totalArea?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  rooms?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  bedrooms?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  bathrooms?: number | null;

  @ApiPropertyOptional({ description: 'Floor the unit is on' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  floors?: number | null;

  @ApiPropertyOptional({ description: 'Total floors in the building' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  floorsTotal?: number | null;

  @ApiPropertyOptional({ description: 'Ceiling height in meters' })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0)
  ceilingHeight?: number | null;

  @ApiPropertyOptional({ description: 'Balcony area in m²' })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(0)
  balconyArea?: number | null;

  // ─── Enums ─────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ enum: Occupancy })
  @IsOptional()
  @TrimToNull()
  @IsEnum(Occupancy)
  occupancy?: Occupancy | null;

  @ApiPropertyOptional({ enum: HeatingType })
  @IsOptional()
  @TrimToNull()
  @IsEnum(HeatingType)
  heating?: HeatingType | null;

  @ApiPropertyOptional({ enum: HotWaterType })
  @IsOptional()
  @TrimToNull()
  @IsEnum(HotWaterType)
  hotWater?: HotWaterType | null;

  @ApiPropertyOptional({ enum: ParkingType })
  @IsOptional()
  @TrimToNull()
  @IsEnum(ParkingType)
  parking?: ParkingType | null;

  // ─── Flags ─────────────────────────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hotSale?: boolean;

  @ApiPropertyOptional({ description: 'Visible in public listings' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  public?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isNonStandard?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasConditioner?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasFurniture?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasBed?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasSofa?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasTable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasChairs?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasStove?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasRefrigerator?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasOven?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasWashingMachine?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasKitchenAppliances?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasBalcony?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasNaturalGas?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasInternet?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasTV?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasSewerage?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isFenced?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasYardLighting?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasGrill?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasAlarm?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasVentilation?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasWater?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasElectricity?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hasGate?: boolean;
}
