import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { LeadStatus } from '@prisma/client';
import { TrimToNull } from '@/common/decorators/transform.decorators';
import { LANGUAGES } from '@/common/constants/language';

export class CreateLeadDto {
  @ApiProperty({ example: 'ლადო ასამბაძე' })
  @TrimToNull()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '+995 555 12 34 56' })
  @TrimToNull()
  @IsString()
  @Matches(/^[+\d][\d\s()-]{6,24}$/, { message: 'phone looks invalid' })
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(2000)
  message?: string | null;

  @ApiPropertyOptional({ description: 'Unit type the visitor is interested in' })
  @IsOptional()
  @TrimToNull()
  @IsString()
  unitTypeId?: string | null;

  @ApiPropertyOptional({ enum: LANGUAGES, default: 'ka' })
  @IsOptional()
  @IsIn(LANGUAGES as unknown as string[])
  locale?: string;

  /** Honeypot – bots fill it, humans never see it. */
  @ApiPropertyOptional({ description: 'Leave empty' })
  @IsOptional()
  @IsString()
  @MaxLength(0)
  website?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;

  @ApiPropertyOptional({ description: 'Internal note' })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(2000)
  note?: string | null;
}
