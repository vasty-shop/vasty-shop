import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ValidateCouponDto, ApplyCouponDto } from './dto/validate-coupon.dto';

@ApiTags('offers')
@Controller('offers')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations)',
  required: false,
})
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new offer/coupon (admin/shop owner, uses x-shop-id header)' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async createOffer(@Body() createOfferDto: CreateOfferDto, @Request() req: any) {
    const shopId = req.headers['x-shop-id'];

    // Shop ID is required for creating offers
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    // Add shopId to DTO if not already present
    const offerData = { ...createOfferDto, shopId };
    return this.offersService.createOffer(offerData, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all offers' })
  @ApiResponse({ status: 200, description: 'List of offers' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by offer type' })
  @ApiQuery({ name: 'shopId', required: false, description: 'Filter by shop ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async getOffers(@Query() query: any) {
    return this.offersService.getOffers(query);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active offers only' })
  @ApiResponse({ status: 200, description: 'List of active offers' })
  async getActiveOffers() {
    return this.offersService.getActiveOffers();
  }

  @Get('shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get offers by shop (uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Shop offers returned successfully' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async getOffersByShop(
    @Query() query: any,
    @Request() req: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.offersService.getOffers({ ...query, shopId });
  }

  // Keep legacy endpoint for backward compatibility
  @Get('by-shop/:shopId')
  @ApiOperation({ summary: 'Get offers by shop (legacy - use shop endpoint with x-shop-id header instead)' })
  @ApiResponse({ status: 200, description: 'Shop offers returned successfully' })
  async getOffersByShopLegacy(
    @Param('shopId') shopId: string,
    @Query() query: any,
  ) {
    return this.offersService.getOffers({ ...query, shopId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiResponse({ status: 200, description: 'Offer details' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async getOffer(@Param('id') id: string) {
    return this.offersService.getOffer(id);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  @ApiResponse({ status: 200, description: 'Coupon validation result' })
  @ApiResponse({ status: 404, description: 'Coupon not found' })
  @ApiResponse({ status: 400, description: 'Coupon not valid' })
  async validateCoupon(@Body() validateCouponDto: ValidateCouponDto) {
    return this.offersService.validateCoupon(validateCouponDto);
  }

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Apply coupon to cart' })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Coupon or cart not found' })
  @ApiResponse({ status: 400, description: 'Coupon not valid' })
  async applyCoupon(@Body() applyCouponDto: ApplyCouponDto, @Request() req: any) {
    return this.offersService.applyCoupon(applyCouponDto, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update offer' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async updateOffer(
    @Param('id') id: string,
    @Body() updateOfferDto: Partial<CreateOfferDto>,
    @Request() req: any,
  ) {
    return this.offersService.updateOffer(id, updateOfferDto, req.user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change offer status' })
  @ApiResponse({ status: 200, description: 'Offer status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async changeOfferStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.offersService.changeOfferStatus(id, status, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete offer' })
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async deleteOffer(@Param('id') id: string, @Request() req: any) {
    return this.offersService.deleteOffer(id, req.user);
  }
}
