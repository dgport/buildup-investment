import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { LANGUAGES } from '@/common/constants/language';
import { TrimToNull } from '@/common/decorators/transform.decorators';

export class UpsertPropertyTranslationDto {
  @ApiProperty({ description: 'Language code', example: 'ka', enum: LANGUAGES })
  @IsString()
  @IsIn(LANGUAGES as unknown as string[])
  language: string;

  @ApiProperty({
    description: 'Property title in specified language',
    example: 'ფუფუნებული ბინა ძველ ბათუმში',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Property address in specified language',
    example: 'მთავარი ქუჩა 123, ბათუმი',
  })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(300)
  address?: string;

  @ApiPropertyOptional({
    description: 'Property description in specified language',
    example: 'ლამაზი ბინა ზღვის ხედით...',
  })
  @IsOptional()
  @TrimToNull()
  @IsString()
  @MaxLength(5000)
  description?: string;
}
