import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParcelService } from './parcel.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreateParcelDto,
  UpdateParcelStatusDto,
  CalculateShippingDto,
  ConfigureParcelCategoryDto,
  ConfigureDeliveryTypeDto,
  QueryParcelsDto,
  BulkStatusUpdateDto,
} from './dto/parcel.dto';

@ApiTags('parcel')
@Controller('parcel')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Track parcel by tracking number (public)' })
  @ApiResponse({ status: 200, description: 'Tracking information' })
  async track(@Param('trackingNumber') trackingNumber: string) {
    return this.parcelService.trackByNumber(trackingNumber);
  }

  @Post('calculate-shipping')
  @ApiOperation({ summary: 'Calculate shipping cost (public)' })
  @ApiResponse({ status: 200, description: 'Shipping cost calculated' })
  async calculateShipping(@Body() dto: CalculateShippingDto) {
    return this.parcelService.calculateShipping(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all parcel categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async getCategories() {
    return this.parcelService.getAllCategories();
  }

  @Get('delivery-types')
  @ApiOperation({ summary: 'Get all delivery types' })
  @ApiResponse({ status: 200, description: 'List of delivery types' })
  async getDeliveryTypes() {
    return this.parcelService.getAllDeliveryTypes();
  }

  // ============================================
  // AUTHENTICATED ENDPOINTS
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new parcel shipment' })
  @ApiResponse({ status: 201, description: 'Parcel created' })
  async create(@Body() dto: CreateParcelDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.parcelService.create(dto, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all parcels' })
  @ApiResponse({ status: 200, description: 'List of parcels' })
  async findAll(@Query() query: QueryParcelsDto) {
    return this.parcelService.findAll(query);
  }

  @Get('my-parcels')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my parcels' })
  @ApiResponse({ status: 200, description: 'List of user parcels' })
  async getMyParcels(@Request() req, @Query() query: QueryParcelsDto) {
    const userId = req.user.sub || req.user.userId;
    return this.parcelService.findAll({ ...query, userId });
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get parcel statistics (admin)' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiResponse({ status: 200, description: 'Parcel statistics' })
  async getStats(@Query('period') period?: string, @Query('zoneId') zoneId?: string) {
    return this.parcelService.getStats(period, zoneId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get parcel by ID' })
  @ApiResponse({ status: 200, description: 'Parcel details' })
  async findById(@Param('id') id: string) {
    return this.parcelService.findById(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update parcel status' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateParcelStatusDto) {
    return this.parcelService.updateStatus(id, dto);
  }

  @Post('bulk-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bulk update parcel status (admin)' })
  @ApiResponse({ status: 200, description: 'Bulk update completed' })
  async bulkUpdateStatus(@Body() dto: BulkStatusUpdateDto) {
    return this.parcelService.bulkUpdateStatus(dto);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel parcel' })
  @ApiResponse({ status: 200, description: 'Parcel cancelled' })
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.parcelService.cancel(id, reason, userId);
  }

  // ============================================
  // ADMIN CONFIGURATION
  // ============================================

  @Put('categories/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Configure parcel category (admin)' })
  @ApiResponse({ status: 200, description: 'Category configured' })
  async configureCategory(@Body() dto: ConfigureParcelCategoryDto) {
    return this.parcelService.configureCategory(dto);
  }

  @Put('delivery-types/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Configure delivery type (admin)' })
  @ApiResponse({ status: 200, description: 'Delivery type configured' })
  async configureDeliveryType(@Body() dto: ConfigureDeliveryTypeDto) {
    return this.parcelService.configureDeliveryType(dto);
  }
}
