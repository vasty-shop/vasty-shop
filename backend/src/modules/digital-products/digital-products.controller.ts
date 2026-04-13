import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DigitalProductsService } from './digital-products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopOwnerGuard } from '../auth/guards/shop-owner.guard';

@ApiTags('Digital Products')
@Controller()
export class DigitalProductsController {
  constructor(private readonly digitalProductsService: DigitalProductsService) {}

  // ============================================
  // Vendor: Digital File Management
  // ============================================

  @Post('products/:id/digital-files')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a digital file for a product (vendor)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiHeader({ name: 'x-shop-id', description: 'Shop ID', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'The digital file to upload' },
        downloadLimit: { type: 'number', description: 'Max downloads allowed (optional)', nullable: true },
      },
      required: ['file'],
    },
  })
  @ApiResponse({ status: 201, description: 'Digital file uploaded successfully' })
  @ApiResponse({ status: 400, description: 'No file provided' })
  @ApiResponse({ status: 403, description: 'Product does not belong to your shop' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async uploadDigitalFile(
    @Param('id') productId: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('downloadLimit') downloadLimit?: string,
  ) {
    if (!file) {
      throw new Error('No file provided');
    }
    const shopId = req.headers['x-shop-id'];
    const limit = downloadLimit ? parseInt(downloadLimit, 10) : undefined;
    return this.digitalProductsService.uploadFile(productId, shopId, file, limit);
  }

  @Get('products/:id/digital-files')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List digital files for a product (vendor)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiHeader({ name: 'x-shop-id', description: 'Shop ID', required: true })
  @ApiResponse({ status: 200, description: 'List of digital files' })
  async listDigitalFiles(@Param('id') productId: string) {
    return this.digitalProductsService.listFiles(productId);
  }

  @Delete('digital-files/:fileId')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a digital file (vendor)' })
  @ApiParam({ name: 'fileId', description: 'Digital file ID' })
  @ApiHeader({ name: 'x-shop-id', description: 'Shop ID', required: true })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 403, description: 'File does not belong to your shop' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteDigitalFile(@Param('fileId') fileId: string, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    return this.digitalProductsService.deleteFile(fileId, shopId);
  }

  // ============================================
  // Vendor: License Key Management
  // ============================================

  @Post('products/:id/licenses')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Generate license keys for a product (vendor)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiHeader({ name: 'x-shop-id', description: 'Shop ID', required: true })
  @ApiQuery({ name: 'count', required: false, description: 'Number of keys to generate', example: 1 })
  @ApiResponse({ status: 201, description: 'License keys generated' })
  @ApiResponse({ status: 403, description: 'Product does not belong to your shop' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async generateLicenseKeys(
    @Param('id') productId: string,
    @Request() req,
    @Query('count', new DefaultValuePipe(1), ParseIntPipe) count: number,
  ) {
    const shopId = req.headers['x-shop-id'];
    return this.digitalProductsService.generateLicenseKeys(productId, shopId, count);
  }

  @Get('products/:id/licenses')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List license keys for a product (vendor)' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiHeader({ name: 'x-shop-id', description: 'Shop ID', required: true })
  @ApiResponse({ status: 200, description: 'List of license keys' })
  async listLicenseKeys(@Param('id') productId: string, @Request() req) {
    const shopId = req.headers['x-shop-id'];
    return this.digitalProductsService.listLicenseKeys(productId, shopId);
  }

  // ============================================
  // Buyer: Download
  // ============================================

  @Get('orders/:orderId/downloads/:productId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get download URLs for a purchased digital product (buyer)' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Download URLs with signed links' })
  @ApiResponse({ status: 400, description: 'Product not in order or payment not complete' })
  @ApiResponse({ status: 403, description: 'Order does not belong to you' })
  @ApiResponse({ status: 404, description: 'Order or product not found' })
  async getDownloadUrl(
    @Param('orderId') orderId: string,
    @Param('productId') productId: string,
    @Request() req,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    return this.digitalProductsService.getDownloadUrl(
      orderId,
      productId,
      req.user.userId,
      ipAddress,
    );
  }

  // ============================================
  // Public: License Validation
  // ============================================

  @Get('licenses/validate/:key')
  @ApiOperation({ summary: 'Validate a license key (public)' })
  @ApiParam({ name: 'key', description: 'License key to validate', example: 'ABCD-EF12-GH34-JK56' })
  @ApiResponse({ status: 200, description: 'License validation result' })
  async validateLicenseKey(@Param('key') key: string) {
    return this.digitalProductsService.validateLicenseKey(key);
  }
}
