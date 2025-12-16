import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class UpsertProjectTranslationDto {
  @ApiProperty({ example: 'ka' })
  @IsString()
  @IsNotEmpty()
  language: string;

  @ApiProperty({ example: 'საცხოვრებელი კომპლექსი' })
  @IsString()
  @IsNotEmpty()
  projectName: string;

  @ApiPropertyOptional({ example: 'რუსთაველის გამზირი 45, ბათუმი' })
  @IsOptional()
  @IsString()
  street?: string;
}
