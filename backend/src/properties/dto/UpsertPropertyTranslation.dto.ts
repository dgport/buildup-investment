import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertPropertyTranslationDto {
  @ApiProperty({
    description: 'Language code',
    example: 'ka',
  })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({
    description: 'Property title in specified language',
    example: 'ფუფუნებული ბინა ძველ ბათუმში',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Property address in specified language',
    example: 'მთავარი ქუჩა 123, ბათუმი',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Property description in specified language',
    example: 'ლამაზი ბინა ზღვის ხედით...',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
