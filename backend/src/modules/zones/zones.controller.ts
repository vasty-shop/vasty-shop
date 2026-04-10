import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZonesService } from './zones.service';
import {
  CreateZoneDto,
  UpdateZoneDto,
  CreateDeliveryOptionDto,
  UpdateDeliveryOptionDto,
  AssignZoneToShopDto,
  CheckDeliveryAvailabilityDto,
  CalculateDeliveryFeeDto,
  ZoneResponseDto,
  DeliveryOptionResponseDto,
  DeliveryAvailabilityResponseDto,
  DeliveryFeeResponseDto,
} from './dto/zones.dto';

@ApiTags('Delivery Zones')
@Controller('zones')
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get()
  @ApiOperation({ summary: 'Get all delivery zones' })
  @ApiResponse({ status: 200, description: 'List of zones', type: [ZoneResponseDto] })
  async getZones(
    @Query('includeInactive') includeInactive?: string,
    @Query('shopId') shopId?: string,
  ) {
    return this.zonesService.getZones(includeInactive === 'true', shopId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get zone by ID' })
  @ApiResponse({ status: 200, description: 'Zone details', type: ZoneResponseDto })
  async getZone(@Param('id') id: string) {
    return this.zonesService.getZone(id);
  }

  @Get(':id/delivery-options')
  @ApiOperation({ summary: 'Get delivery options for a zone' })
  @ApiResponse({ status: 200, description: 'Delivery options', type: [DeliveryOptionResponseDto] })
  async getDeliveryOptions(
    @Param('id') id: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.zonesService.getDeliveryOptions(id, includeInactive === 'true');
  }

  @Post('check-availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check delivery availability for location' })
  @ApiResponse({ status: 200, description: 'Availability result', type: DeliveryAvailabilityResponseDto })
  async checkAvailability(@Body() dto: CheckDeliveryAvailabilityDto) {
    return this.zonesService.checkDeliveryAvailability(dto);
  }

  @Post('calculate-fee')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate delivery fee' })
  @ApiResponse({ status: 200, description: 'Fee calculation', type: DeliveryFeeResponseDto })
  async calculateFee(@Body() dto: CalculateDeliveryFeeDto) {
    return this.zonesService.calculateDeliveryFee(dto);
  }

  // ============================================
  // ADMIN - ZONE MANAGEMENT
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create delivery zone (Admin)' })
  @ApiResponse({ status: 201, description: 'Zone created', type: ZoneResponseDto })
  async createZone(@Body() dto: CreateZoneDto) {
    // TODO: Add admin role check
    return this.zonesService.createZone(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery zone (Admin)' })
  @ApiResponse({ status: 200, description: 'Zone updated', type: ZoneResponseDto })
  async updateZone(@Param('id') id: string, @Body() dto: UpdateZoneDto) {
    // TODO: Add admin role check
    return this.zonesService.updateZone(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete delivery zone (Admin)' })
  @ApiResponse({ status: 204, description: 'Zone deleted' })
  async deleteZone(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.zonesService.deleteZone(id);
  }

  // ============================================
  // ADMIN - DELIVERY OPTIONS
  // ============================================

  @Post('delivery-options')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create delivery option (Admin)' })
  @ApiResponse({ status: 201, description: 'Option created', type: DeliveryOptionResponseDto })
  async createDeliveryOption(@Body() dto: CreateDeliveryOptionDto) {
    // TODO: Add admin role check
    return this.zonesService.createDeliveryOption(dto);
  }

  @Put('delivery-options/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery option (Admin)' })
  @ApiResponse({ status: 200, description: 'Option updated', type: DeliveryOptionResponseDto })
  async updateDeliveryOption(@Param('id') id: string, @Body() dto: UpdateDeliveryOptionDto) {
    // TODO: Add admin role check
    return this.zonesService.updateDeliveryOption(id, dto);
  }

  @Delete('delivery-options/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete delivery option (Admin)' })
  @ApiResponse({ status: 204, description: 'Option deleted' })
  async deleteDeliveryOption(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.zonesService.deleteDeliveryOption(id);
  }

  // ============================================
  // VENDOR - SHOP ZONE MANAGEMENT
  // ============================================

  @Post('shop-zones')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign zone to shop (Vendor)' })
  @ApiResponse({ status: 200, description: 'Zone assigned' })
  async assignZoneToShop(@Body() dto: AssignZoneToShopDto) {
    return this.zonesService.assignZoneToShop(dto);
  }

  @Get('shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get zones for shop (Vendor)' })
  @ApiResponse({ status: 200, description: 'Shop zones' })
  async getShopZones(@Param('shopId') shopId: string) {
    return this.zonesService.getShopZones(shopId);
  }

  @Delete('shop/:shopId/zone/:zoneId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove zone from shop (Vendor)' })
  @ApiResponse({ status: 204, description: 'Zone removed' })
  async removeZoneFromShop(
    @Param('shopId') shopId: string,
    @Param('zoneId') zoneId: string,
  ) {
    await this.zonesService.removeZoneFromShop(shopId, zoneId);
  }
}
