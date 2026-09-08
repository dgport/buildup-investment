import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ProjectStatus, Region } from '@prisma/client';
import {
  ToBoolean,
  ToNumber,
  TrimToNull,
} from '@/common/decorators/transform.decorators';
import { PROJECT_AMENITIES } from '@/common/constants/project-amenities';

export class CreateProjectDto {
  @ApiProperty({ description: 'Developer ID' })
  @IsString()
  developerId: string;

  @ApiPropertyOptional({ description: 'URL slug; generated from the title if omitted' })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug may contain a-z, 0-9 and -' })
  @MaxLength(80)
  slug?: string | null;

  // ─── Texts (at least one title required – checked in the service) ─────────

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
  titleEn?: string | null;

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
  @MaxLength(10000)
  descriptionKa?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(10000)
  descriptionEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(10000)
  descriptionRu?: string | null;

  // ─── Location ──────────────────────────────────────────────────────────────

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

  @ApiPropertyOptional({ description: '"lat,lng"', example: '41.6401,41.6168' })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @Matches(/^-?\d{1,2}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/, {
    message: 'location must be "lat,lng"',
  })
  location?: string | null;

  // ─── Facts ─────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'Construction progress 0-100' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number | null;

  @ApiPropertyOptional({ description: '1-4' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(1)
  @Max(4)
  deliveryQuarter?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(2000)
  @Max(2100)
  deliveryYear?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(1)
  floors?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(1)
  totalApartments?: number | null;

  @ApiPropertyOptional({ description: 'USD per m², cheapest' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  pricePerSqmFrom?: number | null;

  @ApiPropertyOptional({ description: 'USD, cheapest unit' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  priceFrom?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  hotSale?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  published?: boolean;

  @ApiPropertyOptional({ description: 'YouTube / Vimeo URL' })
  @IsOptional()
  @TrimToNull()
  @IsUrl()
  videoUrl?: string | null;

  @ApiPropertyOptional({ description: '3D tour URL' })
  @IsOptional()
  @TrimToNull()
  @IsUrl()
  tourUrl?: string | null;

  // ─── Payment terms ─────────────────────────────────────────────────────────

  @ApiPropertyOptional()
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  installmentAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Down payment %' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  @Max(100)
  downPaymentPercent?: number | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(1)
  @Max(600)
  installmentMonths?: number | null;

  @ApiPropertyOptional({
    enum: PROJECT_AMENITIES,
    isArray: true,
    description: 'Array or comma-separated list',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.split(',').map((v) => v.trim()).filter(Boolean)
      : value,
  )
  @IsArray()
  @ArrayUnique()
  @IsIn(PROJECT_AMENITIES as unknown as string[], { each: true })
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Manual ordering (lower first)' })
  @IsOptional()
  @ToNumber()
  @IsInt()
  sortOrder?: number;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
