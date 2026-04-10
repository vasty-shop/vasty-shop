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
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiHeader,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  QueryProductsDto,
  UpdateInventoryDto,
  UpdateStatusDto,
} from './dto/query-products.dto';
import {
  UploadImageDto,
  ReorderImagesDto,
  UpdateImageDto,
  BulkUploadImagesDto,
} from './dto/manage-images.dto';
import { BulkEditDto } from './dto/bulk-edit.dto';

@ApiTags('products')
@Controller('products')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations)',
  required: false,
})
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List all products with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of products returned successfully' })
  async findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, description: 'Featured products returned successfully' })
  async findFeatured(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.productsService.findFeatured(limit, offset);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name, description, or tags' })
  @ApiResponse({ status: 200, description: 'Search results returned successfully' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  async search(@Query() query: QueryProductsDto) {
    return this.productsService.search(query.search || '', query);
  }

  @Get('by-category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({ status: 200, description: 'Products by category returned successfully' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() query: QueryProductsDto,
  ) {
    return this.productsService.findByCategory(categoryId, query);
  }

  @Get('shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get products by shop (uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Shop products returned successfully' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async findByShop(
    @Query() query: QueryProductsDto,
    @Request() req: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.productsService.findByShop(shopId, query);
  }

  // Keep legacy endpoint for public API backward compatibility
  @Get('by-shop/:shopId')
  @ApiOperation({ summary: 'Get products by shop (legacy - use shop endpoint with x-shop-id header instead)' })
  @ApiResponse({ status: 200, description: 'Shop products returned successfully' })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  async findByShopLegacy(
    @Param('shopId') shopId: string,
    @Query() query: QueryProductsDto,
  ) {
    return this.productsService.findByShop(shopId, query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (SEO-friendly URL)' })
  @ApiResponse({ status: 200, description: 'Product found successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single product by ID' })
  @ApiResponse({ status: 200, description: 'Product found successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related products (same category)' })
  @ApiResponse({ status: 200, description: 'Related products returned successfully' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async findRelated(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.productsService.findRelated(id, limit);
  }

  @Post('upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a product image to storage' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully', schema: { properties: { url: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header or no file provided' })
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    console.log('Upload image request received');
    console.log('File:', file ? `${file.originalname} (${file.size} bytes)` : 'No file');
    console.log('Headers:', req.headers['x-shop-id']);

    const shopId = req.headers['x-shop-id'];

    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    if (!file) {
      console.error('No file in request. Body keys:', Object.keys(req.body || {}));
      throw new Error('No file provided. Please ensure the file field is named "file".');
    }

    return this.productsService.uploadProductImage(file, shopId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product (requires authentication, uses x-shop-id header)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not shop owner' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async create(@Body() createProductDto: CreateProductDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    const shopId = req.headers['x-shop-id'];

    // Shop ID is required for creating products
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    // Add shopId to DTO if not already present
    const productData = { ...createProductDto, shopId };
    return this.productsService.create(productData, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product (requires authentication and shop ownership)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not shop owner' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.update(id, updateProductDto, userId);
  }

  @Patch(':id/inventory')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product inventory' })
  @ApiResponse({ status: 200, description: 'Inventory updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async updateInventory(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.updateInventory(id, updateInventoryDto, userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update product status (publish/unpublish/archive)' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.updateStatus(id, updateStatusDto.status, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not shop owner' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.remove(id, userId);
  }

  // ============================================
  // IMAGE MANAGEMENT ENDPOINTS
  // ============================================

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload/add a new image to product' })
  @ApiResponse({ status: 201, description: 'Image added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async addImage(
    @Param('id') id: string,
    @Body() uploadImageDto: UploadImageDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.addImage(id, uploadImageDto, userId);
  }

  @Post(':id/images/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload multiple images to product at once' })
  @ApiResponse({ status: 201, description: 'Images added successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async addBulkImages(
    @Param('id') id: string,
    @Body() bulkUploadDto: BulkUploadImagesDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.addBulkImages(id, bulkUploadDto.images, userId);
  }

  @Put(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update image metadata (alt text, primary status)' })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product or image not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  async updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() updateImageDto: UpdateImageDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.updateImage(id, imageId, updateImageDto, userId);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete/remove an image from product' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product or image not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  async removeImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.removeImage(id, imageId, userId);
  }

  @Put(':id/images/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reorder product images' })
  @ApiResponse({ status: 200, description: 'Images reordered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async reorderImages(
    @Param('id') id: string,
    @Body() reorderDto: ReorderImagesDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.reorderImages(id, reorderDto.imageIds, userId);
  }

  @Put(':id/images/:imageId/primary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set an image as the primary/featured image' })
  @ApiResponse({ status: 200, description: 'Primary image set successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product or image not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiParam({ name: 'imageId', description: 'Image ID' })
  async setPrimaryImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.setPrimaryImage(id, imageId, userId);
  }

  // ============================================
  // CONVENIENCE STATUS ENDPOINTS
  // ============================================

  @Put(':id/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish product (set status to active)' })
  @ApiResponse({ status: 200, description: 'Product published successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async publishProduct(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.updateStatus(id, 'active', userId);
  }

  @Put(':id/draft')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set product as draft (unpublish)' })
  @ApiResponse({ status: 200, description: 'Product set as draft successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async draftProduct(@Param('id') id: string, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    return this.productsService.updateStatus(id, 'draft', userId);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  @Patch('bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Bulk edit multiple products',
    description: 'Perform bulk operations on multiple products: update status, price, inventory, category, or delete',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk operation completed',
    schema: {
      properties: {
        successCount: { type: 'number', description: 'Number of products successfully updated' },
        failedCount: { type: 'number', description: 'Number of products that failed to update' },
        updatedProductIds: { type: 'array', items: { type: 'string' } },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              error: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  async bulkEdit(@Body() bulkEditDto: BulkEditDto, @Request() req: any) {
    const userId = req.user?.userId || req.user?.id;
    const shopId = req.headers['x-shop-id'];

    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    return this.productsService.bulkEdit(bulkEditDto, userId, shopId);
  }
}
