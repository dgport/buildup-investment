import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PartnersService } from './partners.service';
import { CreatePartnerDto } from './dto/CreatePartner.dto';
import { UpdatePartnerDto } from './dto/UpdatePartner.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../common/config/multer.config';
import { UpsertTranslationDto } from './dto/UpsertTranslations.dto';
import { AuthGuard } from '@/auth/guards/basic-auth.guard';

@ApiTags('Partners')
@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all partners with pagination' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Language code (e.g., en, ka, ru)',
    example: 'en',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
    type: 'number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
    type: 'number',
  })
  @ApiResponse({ status: 200, description: 'Partners retrieved successfully' })
  async findAll(
    @Query('lang') lang?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.partnersService.findAll({
      lang,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiResponse({ status: 201, description: 'Partner created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Partner already exists' })
  @UseInterceptors(FileInterceptor('image', multerConfig('partners')))
  @ApiBody({ type: CreatePartnerDto })
  async createPartner(
    @Body() dto: CreatePartnerDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.partnersService.createPartner(dto, image);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a partner' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Partner updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  @ApiResponse({ status: 409, description: 'Partner name already exists' })
  @UseInterceptors(FileInterceptor('image', multerConfig('partners')))
  @ApiBody({
    type: UpdatePartnerDto,
    description: 'Partner update data',
  })
  async updatePartner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartnerDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.partnersService.updatePartner(id, dto, image);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a partner' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Partner deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async deletePartner(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.deletePartner(id);
  }

  @Get(':id/translations')
  @ApiOperation({ summary: 'Get all translations for a partner' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translations retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async getTranslations(@Param('id', ParseIntPipe) id: number) {
    return this.partnersService.getTranslations(id);
  }

  @Patch(':id/translations')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or update a translation' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: 'Translation added/updated successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  @ApiBody({ type: UpsertTranslationDto })
  async upsertTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertTranslationDto,
  ) {
    return this.partnersService.upsertTranslation(
      id,
      dto.language,
      dto.companyName,
    );
  }

  @Delete(':id/translations/:language')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific translation' })
  @ApiParam({ name: 'id', description: 'Partner ID', type: 'number' })
  @ApiParam({
    name: 'language',
    description: 'Language code (e.g., ka, ru)',
    example: 'ka',
  })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  async deleteTranslation(
    @Param('id', ParseIntPipe) id: number,
    @Param('language') language: string,
  ) {
    return this.partnersService.deleteTranslation(id, language);
  }
}
