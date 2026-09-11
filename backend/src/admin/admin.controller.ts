import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/auth/types/user.type';
import { AdminService } from './admin.service';
import {
  ListUsersQueryDto,
  UpdateSettingsDto,
  UpdateUserDto,
} from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({
    summary:
      'Dashboard counters, pending listings and latest leads (admin only)',
  })
  getStats(@Query('lang') lang?: string) {
    return this.adminService.getStats(lang);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users (admin only)' })
  listUsers(@Query() query: ListUsersQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Change a user role or active flag (admin only)' })
  updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: User,
  ) {
    return this.adminService.updateUser(id, dto, actor.id);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Site-wide settings (admin only)' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update site-wide settings (admin only)' })
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.adminService.updateSettings(dto);
  }
}
