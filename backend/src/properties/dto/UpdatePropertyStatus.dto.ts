import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PropertyStatus } from '@prisma/client';
import { TrimToNull } from '@/common/decorators/transform.decorators';

export class UpdatePropertyStatusDto {
  @IsEnum(PropertyStatus)
  status: PropertyStatus;

  /** Shown to the owner when the listing is rejected. */
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string | null;
}
