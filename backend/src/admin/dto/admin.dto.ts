import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import {
  ToBoolean,
  ToNumber,
  TrimToNull,
} from '@/common/decorators/transform.decorators';

export class ListUsersQueryDto {
  @IsOptional() @ToNumber() @IsInt() @Min(1) page?: number;
  @IsOptional() @ToNumber() @IsInt() @Min(1) limit?: number;
  @IsOptional() @IsString() @MaxLength(100) search?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
}

export class UpdateUserDto {
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @ToBoolean() @IsBoolean() isActive?: boolean;
}

/** Every key the admin can change lives here; unknown keys are rejected. */
export const SETTING_KEYS = [
  'default_contact_phone',
  'listing_moderation',
] as const;
export type SettingKey = (typeof SETTING_KEYS)[number];

export class UpdateSettingsDto {
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(40)
  default_contact_phone?: string | null;
  @IsOptional() @IsIn(['on', 'off']) listing_moderation?: 'on' | 'off';
}
