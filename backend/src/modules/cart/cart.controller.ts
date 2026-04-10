import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get current user cart (authenticated or guest)' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Session ID for guest users',
  })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  async getCart(@Request() req, @Headers('x-session-id') sessionId?: string) {
    const userId = req.user?.userId || null;

    if (userId) {
      return this.cartService.getCart(userId);
    } else if (sessionId) {
      return this.cartService.getGuestCart(sessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }
  }

  @Get('guest/:sessionId')
  @ApiOperation({ summary: 'Get guest cart by session ID' })
  @ApiParam({ name: 'sessionId', example: 'abc123def456' })
  @ApiResponse({ status: 200, description: 'Guest cart retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async getGuestCart(@Param('sessionId') sessionId: string) {
    return this.cartService.getGuestCart(sessionId);
  }

  @Post('add')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 422, description: 'Insufficient stock' })
  async addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    const userId = req.user?.userId || null;
    return this.cartService.addItem(userId, addToCartDto);
  }

  @Put('item/:itemId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'itemId', example: 'item_1234567890_abc123' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Session ID for guest users',
  })
  @ApiResponse({ status: 200, description: 'Cart item updated successfully' })
  @ApiResponse({ status: 404, description: 'Cart or item not found' })
  @ApiResponse({ status: 422, description: 'Insufficient stock' })
  async updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body() updateDto: UpdateCartItemDto,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.userId || null;

    let cart;
    if (userId) {
      cart = await this.cartService.getCart(userId);
    } else if (sessionId) {
      cart = await this.cartService.getGuestCart(sessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }

    return this.cartService.updateItem(cart.id, itemId, updateDto);
  }

  @Delete('item/:itemId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'itemId', example: 'item_1234567890_abc123' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Session ID for guest users',
  })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 404, description: 'Cart or item not found' })
  async removeCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.userId || null;

    let cart;
    if (userId) {
      cart = await this.cartService.getCart(userId);
    } else if (sessionId) {
      cart = await this.cartService.getGuestCart(sessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }

    return this.cartService.removeItem(cart.id, itemId);
  }

  @Delete('clear')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Clear entire cart' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Session ID for guest users',
  })
  @ApiResponse({ status: 200, description: 'Cart cleared successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async clearCart(@Request() req, @Headers('x-session-id') sessionId?: string) {
    const userId = req.user?.userId || null;

    let cart;
    if (userId) {
      cart = await this.cartService.getCart(userId);
    } else if (sessionId) {
      cart = await this.cartService.getGuestCart(sessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }

    return this.cartService.clearCart(cart.id);
  }

  @Post('apply-coupon')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Apply coupon code to cart' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Session ID for guest users',
  })
  @ApiResponse({ status: 200, description: 'Coupon applied successfully' })
  @ApiResponse({ status: 400, description: 'Invalid coupon or already applied' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async applyCoupon(
    @Request() req,
    @Body() applyCouponDto: ApplyCouponDto,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.userId || null;
    const cartSessionId = applyCouponDto.sessionId || sessionId;

    let cart;
    if (userId) {
      cart = await this.cartService.getCart(userId);
    } else if (cartSessionId) {
      cart = await this.cartService.getGuestCart(cartSessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }

    return this.cartService.applyCoupon(cart.id, applyCouponDto);
  }

  @Delete('remove-coupon/:code')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Remove coupon from cart' })
  @ApiParam({ name: 'code', example: 'SUMMER2024' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Session ID for guest users',
  })
  @ApiResponse({ status: 200, description: 'Coupon removed successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async removeCoupon(
    @Request() req,
    @Param('code') code: string,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.userId || null;

    let cart;
    if (userId) {
      cart = await this.cartService.getCart(userId);
    } else if (sessionId) {
      cart = await this.cartService.getGuestCart(sessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }

    return this.cartService.removeCoupon(cart.id, code);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Merge guest cart with user cart after login' })
  @ApiResponse({
    status: 200,
    description: 'Carts merged successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async mergeCart(@Request() req, @Body() body: { sessionId: string }) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new BadRequestException('User must be authenticated');
    }

    return this.cartService.mergeGuestCart(body.sessionId, userId);
  }

  @Get('check-inventory')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Check inventory availability for cart items' })
  @ApiHeader({
    name: 'x-session-id',
    required: false,
    description: 'Session ID for guest users',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory check completed',
  })
  async checkInventory(
    @Request() req,
    @Headers('x-session-id') sessionId?: string,
  ) {
    const userId = req.user?.userId || null;

    let cart;
    if (userId) {
      cart = await this.cartService.getCart(userId);
    } else if (sessionId) {
      cart = await this.cartService.getGuestCart(sessionId);
    } else {
      throw new BadRequestException('userId or sessionId required');
    }

    return this.cartService.checkInventory(cart.id);
  }
}
