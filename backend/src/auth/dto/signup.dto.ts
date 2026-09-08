import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SignupRequest {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  // \p{L} = any letter in any alphabet (Georgian, Cyrillic, Latin, …)
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'First name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @MinLength(2)
  @MaxLength(50)
  firstname: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Matches(/^[\p{L}\s'-]+$/u, {
    message:
      'Last name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @MinLength(2)
  @MaxLength(50)
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @MaxLength(255)
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
    },
  )
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsUrl()
  avatar?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value?.trim(),
  )
  @IsString()
  @MaxLength(40)
  phone?: string;
}
