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
  BadRequestException,
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
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/user.decorator';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  SetStockDto,
  TransferStockDto,
  ReserveStockDto,
} from './dto/warehouse.dto';

@ApiTags('warehouses')
@Controller()
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop (vendor) ID for warehouse operations',
  required: true,
})
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  // ------------------------------------------------------------------
  //  Helpers
  // ------------------------------------------------------------------

  private getShopId(req: any): string {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException(
        'Shop ID is required. Please provide x-shop-id header.',
      );
    }
    return shopId;
  }

  // ==================================================================
  //  WAREHOUSE CRUD
  // ==================================================================

  @Post('warehouses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  async create(
    @Body() dto: CreateWarehouseDto,
    @Request() req: any,
  ) {
    const vendorId = this.getShopId(req);
    return this.warehouseService.createWarehouse(vendorId, dto);
  }

  @Get('warehouses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all warehouses for current vendor' })
  @ApiResponse({ status: 200, description: 'Warehouses retrieved successfully' })
  async list(@Request() req: any) {
    const vendorId = this.getShopId(req);
    return this.warehouseService.listWarehouses(vendorId);
  }

  @Put('warehouses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWarehouseDto,
    @Request() req: any,
  ) {
    const vendorId = this.getShopId(req);
    return this.warehouseService.updateWarehouse(id, vendorId, dto);
  }

  @Delete('warehouses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Soft-delete a warehouse (only if no stock)' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({ status: 200, description: 'Warehouse deleted successfully' })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const vendorId = this.getShopId(req);
    return this.warehouseService.deleteWarehouse(id, vendorId);
  }

  // ==================================================================
  //  STOCK MANAGEMENT
  // ==================================================================

  @Post('warehouses/:id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set stock level for a product at this warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({ status: 201, description: 'Stock set successfully' })
  async setStock(
    @Param('id') warehouseId: string,
    @Body() dto: SetStockDto,
    @Request() req: any,
  ) {
    const vendorId = this.getShopId(req);
    return this.warehouseService.setStock(warehouseId, vendorId, dto);
  }

  @Get('products/:id/stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get stock breakdown by warehouse for a product' })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({ status: 200, description: 'Stock breakdown retrieved' })
  async getStock(@Param('id') productId: string) {
    return this.warehouseService.getStock(productId);
  }

  @Post('stock/transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  @ApiResponse({ status: 201, description: 'Stock transferred successfully' })
  async transferStock(
    @Body() dto: TransferStockDto,
    @UserId() userId: string,
    @Request() req: any,
  ) {
    const vendorId = this.getShopId(req);
    return this.warehouseService.transferStock(vendorId, dto, userId);
  }

  @Get('warehouses/low-stock')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get low stock alerts across all warehouses' })
  @ApiQuery({
    name: 'threshold',
    required: false,
    type: Number,
    description: 'Override the per-product threshold',
  })
  @ApiResponse({ status: 200, description: 'Low stock alerts retrieved' })
  async getLowStock(
    @Query('threshold') threshold: string | undefined,
    @Request() req: any,
  ) {
    const vendorId = this.getShopId(req);
    const t = threshold !== undefined ? parseInt(threshold, 10) : undefined;
    return this.warehouseService.getLowStockAlerts(vendorId, t);
  }

  @Post('stock/reserve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reserve stock during checkout' })
  @ApiResponse({ status: 201, description: 'Stock reserved successfully' })
  async reserveStock(
    @Body() dto: ReserveStockDto,
    @Request() req: any,
  ) {
    const vendorId = this.getShopId(req);
    return this.warehouseService.reserveStock(
      vendorId,
      dto.product_id,
      dto.quantity,
      dto.preferred_warehouse_id,
    );
  }
}
