import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { EmailService } from '../auth/services/email.service';

export class ContactDto {
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 120)
  fullName!: string;

  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @Length(2, 5000)
  message!: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly email: EmailService) {}

  @Post()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async submit(@Body() dto: ContactDto) {
    await this.email.sendAdminAlert(
      'BuildUp — ახალი საკონტაქტო შეტყობინება',
      [
        { label: 'სახელი', value: dto.fullName },
        { label: 'ელფოსტა', value: dto.email },
        { label: 'ტელეფონი', value: dto.phone || '—' },
        { label: 'შეტყობინება', value: dto.message },
      ],
      'პასუხის გაგზავნა',
      `mailto:${encodeURIComponent(dto.email)}`,
      true,
    );
    return { success: true };
  }
}
