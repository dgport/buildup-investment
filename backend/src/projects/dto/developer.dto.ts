import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ToBoolean,
  ToNumber,
  TrimToNull,
} from '@/common/decorators/transform.decorators';

export class CreateDeveloperDto {
  @ApiProperty({ example: 'Orbi Group' })
  @TrimToNull()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    description: 'URL slug; generated from name if omitted',
  })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug may contain a-z, 0-9 and -' })
  @MaxLength(80)
  slug?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsUrl({ require_tld: false })
  website?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(1900)
  @Max(2100)
  foundedYear?: number | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  published?: boolean;

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
  descriptionEn?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(5000)
  descriptionRu?: string | null;
}

export class UpdateDeveloperDto extends PartialType(CreateDeveloperDto) {}
