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
  Request,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToWishlistDto, CreateWishlistDto, UpdateWishlistDto, WishlistPrivacy } from './dto';

@ApiTags('wishlist')
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  // Helper to get user ID with fallback for compatibility
  private getUserId(req: any): string {
    return req.user.sub || req.user.userId;
  }

  /**
   * Get all wishlists for authenticated user
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all user wishlists' })
  @ApiResponse({ status: 200, description: 'List of user wishlists' })
  async getUserWishlists(@Request() req) {
    return this.wishlistService.getUserWishlists(this.getUserId(req));
  }

  /**
   * Get a single wishlist by ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a single wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist details' })
  @ApiResponse({ status: 404, description: 'Wishlist not found' })
  async getWishlist(@Param('id') id: string, @Request() req) {
    return this.wishlistService.getWishlist(id, this.getUserId(req));
  }

  /**
   * Get shared wishlist by token (no auth required)
   */
  @Get('shared/:token')
  @ApiOperation({ summary: 'Get shared wishlist by token' })
  @ApiResponse({ status: 200, description: 'Shared wishlist details' })
  @ApiResponse({ status: 404, description: 'Shared wishlist not found' })
  async getSharedWishlist(@Param('token') token: string) {
    return this.wishlistService.getSharedWishlist(token);
  }

  /**
   * Create a new wishlist
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new wishlist' })
  @ApiResponse({ status: 201, description: 'Wishlist created successfully' })
  async createWishlist(@Body() dto: CreateWishlistDto, @Request() req) {
    return this.wishlistService.createWishlist(dto, this.getUserId(req));
  }

  /**
   * Update wishlist details
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update wishlist details' })
  @ApiResponse({ status: 200, description: 'Wishlist updated successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist not found' })
  async updateWishlist(
    @Param('id') id: string,
    @Body() dto: UpdateWishlistDto,
    @Request() req,
  ) {
    return this.wishlistService.updateWishlist(id, dto, this.getUserId(req));
  }

  /**
   * Add a product to wishlist
   */
  @Post('add')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add product to wishlist' })
  @ApiResponse({ status: 201, description: 'Product added to wishlist' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Product already in wishlist' })
  async addToWishlist(@Body() dto: AddToWishlistDto, @Request() req) {
    return this.wishlistService.addToWishlist(dto, this.getUserId(req));
  }

  /**
   * Remove a product from wishlist
   * NOTE: This specific route must come BEFORE the generic @Delete(':id') route
   */
  @Delete('remove/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove product from wishlist' })
  @ApiResponse({ status: 200, description: 'Product removed from wishlist' })
  @ApiResponse({ status: 404, description: 'Product not found in wishlist' })
  async removeFromWishlist(
    @Param('productId') productId: string,
    @Query('wishlistId') wishlistId: string,
    @Request() req,
  ) {
    return this.wishlistService.removeFromWishlist(productId, this.getUserId(req), wishlistId);
  }

  /**
   * Clear all items from a wishlist
   * NOTE: This specific route must come BEFORE the generic @Delete(':id') route
   */
  @Delete('clear/:wishlistId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Clear all items from wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist cleared successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist not found' })
  async clearWishlist(@Param('wishlistId') wishlistId: string, @Request() req) {
    return this.wishlistService.clearWishlist(wishlistId, this.getUserId(req));
  }

  /**
   * Delete a wishlist
   * NOTE: Generic :id route must come AFTER specific routes like 'remove/:productId' and 'clear/:wishlistId'
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a wishlist' })
  @ApiResponse({ status: 200, description: 'Wishlist deleted successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist not found' })
  async deleteWishlist(@Param('id') id: string, @Request() req) {
    return this.wishlistService.deleteWishlist(id, this.getUserId(req));
  }

  /**
   * Check if a product is in user's wishlist
   */
  @Get('check/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check if product is in wishlist' })
  @ApiResponse({ status: 200, description: 'Product wishlist status' })
  async checkProductInWishlist(@Param('productId') productId: string, @Request() req) {
    return this.wishlistService.checkProductInWishlist(productId, this.getUserId(req));
  }

  /**
   * Update wishlist privacy
   */
  @Patch(':id/privacy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update wishlist privacy' })
  @ApiResponse({ status: 200, description: 'Privacy updated successfully' })
  @ApiResponse({ status: 404, description: 'Wishlist not found' })
  async updatePrivacy(
    @Param('id') id: string,
    @Body('privacy') privacy: WishlistPrivacy,
    @Request() req,
  ) {
    return this.wishlistService.updatePrivacy(id, privacy, this.getUserId(req));
  }

  /**
   * Move all wishlist items to cart
   */
  @Post(':id/move-to-cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Move all wishlist items to cart' })
  @ApiResponse({
    status: 200,
    description: 'Items moved to cart',
    schema: {
      example: {
        success: true,
        addedCount: 5,
        addedProducts: ['Product 1', 'Product 2'],
        unavailableCount: 1,
        unavailableProducts: ['Product 3'],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Wishlist not found' })
  async moveToCart(@Param('id') id: string, @Request() req) {
    return this.wishlistService.moveToCart(id, this.getUserId(req));
  }
}
