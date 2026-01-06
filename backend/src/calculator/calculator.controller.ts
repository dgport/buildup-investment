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
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CalculatorService } from './calculator.service';

import { AuthGuard } from '@/auth/guards/basic-auth.guard';
import { CreateMortgageRateDto } from './dto/CreateMortageRate.dto';
import { UpdateMortgageRateDto } from './dto/UpdateMortageRate.dto';
import { CalculateMortgageDto } from './dto/CalculatorMortage.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Calculator')
@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calculatorService: CalculatorService) {}

  @Get('rates')
  @ApiOperation({ summary: 'Get all active mortgage rates' })
  @ApiResponse({ status: 200, description: 'Rates retrieved successfully' })
  async getAllRates() {
    return this.calculatorService.getAllRates();
  }

  @Post('rates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new mortgage rate (Admin only)' })
  @ApiBody({ type: CreateMortgageRateDto })
  @ApiResponse({ status: 201, description: 'Rate created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Rate already exists' })
  async createRate(@Body() dto: CreateMortgageRateDto) {
    return this.calculatorService.createRate(dto);
  }

  @Patch('rates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a mortgage rate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Rate ID', type: 'number' })
  @ApiBody({ type: UpdateMortgageRateDto })
  @ApiResponse({ status: 200, description: 'Rate updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Rate not found' })
  async updateRate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMortgageRateDto,
  ) {
    return this.calculatorService.updateRate(id, dto);
  }

  @Delete('rates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a mortgage rate (Admin only)' })
  @ApiParam({ name: 'id', description: 'Rate ID', type: 'number' })
  @ApiResponse({ status: 200, description: 'Rate deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Rate not found' })
  async deleteRate(@Param('id', ParseIntPipe) id: number) {
    return this.calculatorService.deleteRate(id);
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate mortgage payment' })
  @ApiBody({ type: CalculateMortgageDto })
  @ApiResponse({
    status: 200,
    description: 'Calculation completed successfully',
  })
  @ApiResponse({ status: 404, description: 'No rate found for the term' })
  async calculateMortgage(@Body() dto: CalculateMortgageDto) {
    return this.calculatorService.calculateMortgage(dto);
  }
}
