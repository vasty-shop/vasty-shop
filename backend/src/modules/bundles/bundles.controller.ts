import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BundlesService } from './bundles.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateBundleDto,
  UpdateBundleDto,
  AddBundleToCartDto,
} from './dto/create-bundle.dto';

@ApiTags('bundles')
@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a product bundle (vendor)' })
  @ApiResponse({ status: 201, description: 'Bundle created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateBundleDto, @Request() req: any) {
    const vendorId = req.user?.userId || req.user?.id;
    return this.bundlesService.createBundle(vendorId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List product bundles (public)' })
  @ApiResponse({ status: 200, description: 'Bundles listed successfully' })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(
    @Query('vendorId') vendorId?: string,
    @Query('active') active?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.bundlesService.listBundles({
      vendorId,
      isActive: active !== undefined ? active === 'true' : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get bundle details with savings calculation (public)' })
  @ApiResponse({ status: 200, description: 'Bundle details returned' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  async findOne(@Param('id') id: string) {
    return this.bundlesService.getBundle(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a bundle (vendor)' })
  @ApiResponse({ status: 200, description: 'Bundle updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not bundle owner' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBundleDto,
    @Request() req: any,
  ) {
    const vendorId = req.user?.userId || req.user?.id;
    return this.bundlesService.updateBundle(id, vendorId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a bundle (vendor)' })
  @ApiResponse({ status: 204, description: 'Bundle deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - not bundle owner' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const vendorId = req.user?.userId || req.user?.id;
    await this.bundlesService.deleteBundle(id, vendorId);
  }

  @Post(':id/add-to-cart')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add all bundle items to cart (buyer)' })
  @ApiResponse({ status: 200, description: 'Bundle items added to cart' })
  @ApiResponse({ status: 400, description: 'Validation error or insufficient stock' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Bundle not found' })
  @ApiParam({ name: 'id', description: 'Bundle ID' })
  async addToCart(
    @Param('id') id: string,
    @Body() dto: AddBundleToCartDto,
    @Request() req: any,
  ) {
    const userId = req.user?.userId || req.user?.id;
    return this.bundlesService.addBundleToCart(userId, id, dto);
  }
}
