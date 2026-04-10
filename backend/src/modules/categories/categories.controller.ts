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
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@Controller('categories')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations)',
  required: false,
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories with product counts' })
  @ApiResponse({ status: 200, description: 'List of categories returned successfully' })
  @ApiQuery({ name: 'includeInactive', required: false, description: 'Include inactive categories' })
  async findAll(@Query('includeInactive') includeInactive?: boolean) {
    return this.categoriesService.findAll(includeInactive === true);
  }

  @Get('shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get categories for vendor shop (platform-wide categories with shop product counts, uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Categories returned successfully' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByShop(@Request() req: any) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.categoriesService.findByShop(shopId);
  }

  // Keep legacy endpoint for backward compatibility
  @Get('by-shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get categories for vendor shop (legacy - use shop endpoint with x-shop-id header instead)' })
  @ApiResponse({ status: 200, description: 'Categories returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  async findByShopLegacy(@Param('shopId') shopId: string) {
    return this.categoriesService.findByShop(shopId);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree (hierarchical structure)' })
  @ApiResponse({ status: 200, description: 'Category tree returned successfully' })
  async findTree() {
    return this.categoriesService.findTree();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured categories for homepage' })
  @ApiResponse({ status: 200, description: 'Featured categories returned successfully' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of categories to return' })
  async findFeatured(@Query('limit') limit?: number) {
    return this.categoriesService.findFeatured(limit);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug (SEO-friendly URL)' })
  @ApiResponse({ status: 200, description: 'Category found successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single category by ID' })
  @ApiResponse({ status: 200, description: 'Category found successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products in category with pagination' })
  @ApiResponse({ status: 200, description: 'Products returned successfully' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of products to return' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of products to skip' })
  async getProducts(
    @Param('id') id: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.categoriesService.getProducts(id, limit, offset);
  }

  @Get(':id/subcategories')
  @ApiOperation({ summary: 'Get subcategories of a category' })
  @ApiResponse({ status: 200, description: 'Subcategories returned successfully' })
  @ApiParam({ name: 'id', description: 'Parent category ID' })
  async getSubcategories(@Param('id') id: string) {
    return this.categoriesService.getSubcategories(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new category (admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update category (admin only)' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category (admin only)' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete category with products or subcategories' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }

  @Patch(':id/featured')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Toggle category featured status' })
  @ApiResponse({ status: 200, description: 'Category featured status toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async toggleFeatured(@Param('id') id: string) {
    return this.categoriesService.toggleFeatured(id);
  }
}
