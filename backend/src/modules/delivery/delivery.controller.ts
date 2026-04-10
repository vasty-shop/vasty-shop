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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { CalculateDeliveryCostDto } from './dto/calculate-cost.dto';

@ApiTags('delivery')
@Controller('delivery')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations)',
  required: false,
})
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // ============================================
  // DELIVERY ADDRESSES
  // ============================================

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add new delivery address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAddress(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    return this.deliveryService.createAddress(req.user.userId, createAddressDto);
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all delivery addresses for current user' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserAddresses(@Request() req) {
    return this.deliveryService.getUserAddresses(req.user.userId);
  }

  @Get('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single delivery address' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async getAddress(@Param('id') id: string, @Request() req) {
    return this.deliveryService.getAddress(id, req.user.userId);
  }

  @Put('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update delivery address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async updateAddress(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req,
  ) {
    return this.deliveryService.updateAddress(id, updateAddressDto, req.user.userId);
  }

  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete delivery address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async deleteAddress(@Param('id') id: string, @Request() req) {
    return this.deliveryService.deleteAddress(id, req.user.userId);
  }

  @Patch('addresses/:id/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set address as default' })
  @ApiResponse({ status: 200, description: 'Default address set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async setDefaultAddress(@Param('id') id: string, @Request() req) {
    return this.deliveryService.setDefaultAddress(id, req.user.userId);
  }

  // ============================================
  // DELIVERY TRACKING
  // ============================================

  @Get('tracking/:orderNumber')
  @ApiOperation({ summary: 'Track order by order number (public)' })
  @ApiResponse({ status: 200, description: 'Tracking information retrieved' })
  @ApiResponse({ status: 404, description: 'Tracking not found' })
  async trackOrder(@Param('orderNumber') orderNumber: string) {
    return this.deliveryService.trackByOrderNumber(orderNumber);
  }

  @Get('tracking/order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get tracking information by order ID' })
  @ApiResponse({ status: 200, description: 'Tracking information retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tracking not found' })
  async getTrackingByOrderId(@Param('orderId') orderId: string) {
    return this.deliveryService.getTrackingByOrderId(orderId);
  }

  @Post('tracking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create tracking record (shop owner only, uses x-shop-id header)' })
  @ApiResponse({ status: 201, description: 'Tracking created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async createTracking(@Body() createTrackingDto: CreateTrackingDto, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.createTracking(createTrackingDto);
  }

  @Patch('tracking/:id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update tracking status (shop owner only, uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tracking not found' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async updateTrackingStatus(
    @Param('id') id: string,
    @Body() updateTrackingDto: UpdateTrackingDto,
    @Request() req,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.updateTrackingStatus(
      id,
      updateTrackingDto.status,
      updateTrackingDto.note,
      updateTrackingDto.location,
    );
  }

  @Post('tracking/:id/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add delivery note (shop owner only, uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Note added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Tracking not found' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async addDeliveryNote(@Param('id') id: string, @Body() body: { note: string }, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.addDeliveryNote(id, body.note);
  }

  // ============================================
  // DELIVERY METHODS
  // ============================================

  @Get('methods')
  @ApiOperation({ summary: 'Get available delivery methods' })
  @ApiResponse({ status: 200, description: 'Delivery methods retrieved' })
  async getDeliveryMethods(@Request() req) {
    const shopId = req.headers['x-shop-id'];
    return this.deliveryService.getDeliveryMethods(shopId);
  }

  @Post('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create delivery method (shop owner only)' })
  @ApiResponse({ status: 201, description: 'Delivery method created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createDeliveryMethod(@Body() body: any, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.createDeliveryMethod(shopId, body);
  }

  @Put('methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update delivery method (shop owner only)' })
  @ApiResponse({ status: 200, description: 'Delivery method updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Delivery method not found' })
  async updateDeliveryMethod(@Param('id') id: string, @Body() body: any, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.updateDeliveryMethod(id, shopId, body);
  }

  @Delete('methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete delivery method (shop owner only)' })
  @ApiResponse({ status: 200, description: 'Delivery method deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Delivery method not found' })
  async deleteDeliveryMethod(@Param('id') id: string, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.deleteDeliveryMethod(id, shopId);
  }

  @Patch('methods/:id/toggle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle delivery method active status (shop owner only)' })
  @ApiResponse({ status: 200, description: 'Delivery method toggled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Delivery method not found' })
  async toggleDeliveryMethod(@Param('id') id: string, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.toggleDeliveryMethod(id, shopId);
  }

  @Post('calculate-cost')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Calculate delivery cost for order' })
  @ApiResponse({ status: 200, description: 'Cost calculated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async calculateDeliveryCost(@Body() calculateCostDto: CalculateDeliveryCostDto) {
    return this.deliveryService.calculateDeliveryCost(calculateCostDto);
  }

  // ============================================
  // SHIPPING ZONES
  // ============================================

  @Get('zones/shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get shipping zones for shop' })
  @ApiResponse({ status: 200, description: 'Shipping zones retrieved' })
  async getShopShippingZones(@Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      return []; // Return empty array if no shop context
    }
    return this.deliveryService.getShippingZones(shopId);
  }

  @Post('zones')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create shipping zone (shop owner only)' })
  @ApiResponse({ status: 201, description: 'Shipping zone created' })
  async createShippingZone(@Body() body: any, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.createShippingZone(shopId, body);
  }

  @Put('zones/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update shipping zone (shop owner only)' })
  @ApiResponse({ status: 200, description: 'Shipping zone updated' })
  async updateShippingZone(@Param('id') id: string, @Body() body: any, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.updateShippingZone(id, shopId, body);
  }

  @Delete('zones/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete shipping zone (shop owner only)' })
  @ApiResponse({ status: 200, description: 'Shipping zone deleted' })
  async deleteShippingZone(@Param('id') id: string, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.deliveryService.deleteShippingZone(id, shopId);
  }
}
