import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { UnitAvailability } from '@prisma/client';
import { ToNumber, TrimToNull } from '@/common/decorators/transform.decorators';

export class CreateUnitTypeDto {
  @ApiProperty({ description: 'Number of rooms, 0 = studio', example: 2 })
  @ToNumber()
  @IsInt()
  @Min(0)
  @Max(20)
  rooms: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  @Max(20)
  bedrooms?: number | null;

  @ApiProperty({ description: 'm²', example: 45.5 })
  @ToNumber()
  @IsNumber()
  @Min(1)
  areaFrom: number;

  @ApiPropertyOptional({ description: 'm²' })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  @Min(1)
  areaTo?: number | null;

  @ApiPropertyOptional({ description: 'USD per m²' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  pricePerSqm?: number | null;

  @ApiPropertyOptional({ description: 'USD total, cheapest' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  priceFrom?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(-5)
  floorsFrom?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(-5)
  floorsTo?: number | null;

  @ApiPropertyOptional({ description: 'How many units of this type are left' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  availableCount?: number | null;

  @ApiPropertyOptional({ enum: UnitAvailability })
  @IsOptional()
  @IsEnum(UnitAvailability)
  availability?: UnitAvailability;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(120)
  titleKa?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(120)
  titleEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(120)
  titleRu?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(3000)
  descriptionKa?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(3000)
  descriptionEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(3000)
  descriptionRu?: string | null;
}

export class UpdateUnitTypeDto extends PartialType(CreateUnitTypeDto) {}
