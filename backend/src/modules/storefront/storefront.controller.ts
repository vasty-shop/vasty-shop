import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Header,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { StorefrontService } from './storefront.service';
import {
  StorefrontProductsQueryDto,
  AddToCartDto,
  CheckoutDto,
  StorefrontLoginDto,
  StorefrontRegisterDto,
} from './dto';

@ApiTags('storefront')
@Controller('storefront')
export class StorefrontController {
  constructor(private readonly storefrontService: StorefrontService) {}

  // ============================================
  // PRODUCTS
  // ============================================

  @Get('products')
  @ApiOperation({ summary: 'List products with faceted filtering, sorting, and pagination' })
  @ApiResponse({ status: 200, description: 'Product listing returned successfully' })
  @Header('Cache-Control', 'public, max-age=300')
  async getProducts(@Query() query: StorefrontProductsQueryDto) {
    return this.storefrontService.getProducts(query);
  }

  @Get('products/:slug')
  @ApiOperation({ summary: 'Get product detail by slug' })
  @ApiResponse({ status: 200, description: 'Product detail returned successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'slug', description: 'Product slug (SEO-friendly URL)' })
  @Header('Cache-Control', 'public, max-age=60')
  async getProduct(@Param('slug') slug: string) {
    return this.storefrontService.getProduct(slug);
  }

  // ============================================
  // CATEGORIES
  // ============================================

  @Get('categories')
  @ApiOperation({ summary: 'Get category tree with product counts' })
  @ApiResponse({ status: 200, description: 'Category tree returned successfully' })
  @Header('Cache-Control', 'public, max-age=300')
  async getCategories() {
    return this.storefrontService.getCategories();
  }

  // ============================================
  // CART (stateless -- cart ID is the session)
  // ============================================

  @Post('cart')
  @ApiOperation({ summary: 'Create a new cart (returns cartId)' })
  @ApiResponse({ status: 201, description: 'Cart created successfully' })
  async createCart() {
    return this.storefrontService.createCart();
  }

  @Get('cart/:id')
  @ApiOperation({ summary: 'Get cart by ID' })
  @ApiResponse({ status: 200, description: 'Cart returned successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  @ApiParam({ name: 'id', description: 'Cart ID' })
  async getCart(@Param('id') id: string) {
    return this.storefrontService.getCart(id);
  }

  @Post('cart/:id/items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({ status: 200, description: 'Item added to cart' })
  @ApiResponse({ status: 404, description: 'Cart or product not found' })
  @ApiResponse({ status: 422, description: 'Insufficient stock' })
  @ApiParam({ name: 'id', description: 'Cart ID' })
  @HttpCode(HttpStatus.OK)
  async addToCart(@Param('id') id: string, @Body() dto: AddToCartDto) {
    return this.storefrontService.addToCart(id, dto);
  }

  @Delete('cart/:id/items/:itemId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({ status: 200, description: 'Item removed from cart' })
  @ApiResponse({ status: 404, description: 'Cart or item not found' })
  @ApiParam({ name: 'id', description: 'Cart ID' })
  @ApiParam({ name: 'itemId', description: 'Cart item ID' })
  @HttpCode(HttpStatus.OK)
  async removeFromCart(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.storefrontService.removeFromCart(id, itemId);
  }

  @Post('cart/:id/checkout')
  @ApiOperation({ summary: 'Initiate checkout for cart' })
  @ApiResponse({ status: 200, description: 'Checkout initiated successfully' })
  @ApiResponse({ status: 400, description: 'Cart is empty or product unavailable' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  @ApiResponse({ status: 422, description: 'Insufficient stock' })
  @ApiParam({ name: 'id', description: 'Cart ID' })
  @HttpCode(HttpStatus.OK)
  async checkout(@Param('id') id: string, @Body() dto: CheckoutDto) {
    return this.storefrontService.checkout(id, dto);
  }

  // ============================================
  // STOREFRONT AUTH
  // ============================================

  @Post('auth/login')
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: StorefrontLoginDto) {
    return this.storefrontService.login(dto.email, dto.password);
  }

  @Post('auth/register')
  @ApiOperation({ summary: 'Customer registration' })
  @ApiResponse({ status: 201, description: 'Registration successful' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() dto: StorefrontRegisterDto) {
    return this.storefrontService.register(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.phone,
    );
  }
}
