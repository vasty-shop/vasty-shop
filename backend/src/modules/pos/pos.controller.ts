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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { POSService } from './pos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  CreatePOSOrderDto,
  RefundPOSOrderDto,
  OpenSessionDto,
  CloseSessionDto,
  CashDrawerDto,
  QueryPOSOrdersDto,
  POSSettingsDto,
  HoldOrderDto,
  QuickProductDto,
} from './dto/pos.dto';

@ApiTags('pos')
@Controller('pos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class POSController {
  constructor(private readonly posService: POSService) {}

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  @Post('sessions/open')
  @ApiOperation({ summary: 'Open a new POS session' })
  @ApiResponse({ status: 201, description: 'Session opened' })
  async openSession(@Body() dto: OpenSessionDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.posService.openSession(dto, userId);
  }

  @Post('sessions/:id/close')
  @ApiOperation({ summary: 'Close POS session' })
  @ApiResponse({ status: 200, description: 'Session closed' })
  async closeSession(
    @Param('id') id: string,
    @Body() dto: CloseSessionDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.posService.closeSession(id, dto, userId);
  }

  @Get('sessions/current')
  @ApiOperation({ summary: 'Get current open session' })
  @ApiQuery({ name: 'shopId', required: true })
  @ApiResponse({ status: 200, description: 'Current session' })
  async getCurrentSession(@Query('shopId') shopId: string, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.posService.getCurrentSession(shopId, userId);
  }

  @Get('sessions/history')
  @ApiOperation({ summary: 'Get session history' })
  @ApiQuery({ name: 'shopId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Session history' })
  async getSessionHistory(
    @Query('shopId') shopId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.posService.getSessionHistory(
      shopId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Post('sessions/:id/cash-drawer')
  @ApiOperation({ summary: 'Cash drawer operation (add/remove)' })
  @ApiResponse({ status: 200, description: 'Cash drawer updated' })
  async cashDrawerOperation(
    @Param('id') id: string,
    @Body() dto: CashDrawerDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.posService.cashDrawerOperation(id, dto, userId);
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  @Post('orders')
  @ApiOperation({ summary: 'Create POS order' })
  @ApiResponse({ status: 201, description: 'Order created' })
  async createOrder(@Body() dto: CreatePOSOrderDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.posService.createOrder(dto, userId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get POS orders' })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async getOrders(@Query() query: QueryPOSOrdersDto) {
    return this.posService.getOrders(query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get POS order by ID' })
  @ApiResponse({ status: 200, description: 'Order details' })
  async getOrder(@Param('id') id: string) {
    return this.posService.getOrder(id);
  }

  @Post('orders/:id/refund')
  @ApiOperation({ summary: 'Refund POS order' })
  @ApiResponse({ status: 200, description: 'Order refunded' })
  async refundOrder(
    @Param('id') id: string,
    @Body() dto: RefundPOSOrderDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.posService.refundOrder(id, dto, userId);
  }

  // ============================================
  // HOLD ORDERS
  // ============================================

  @Post('hold')
  @ApiOperation({ summary: 'Hold order for later' })
  @ApiResponse({ status: 201, description: 'Order held' })
  async holdOrder(@Body() dto: HoldOrderDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.posService.holdOrder(dto, userId);
  }

  @Get('hold')
  @ApiOperation({ summary: 'Get held orders' })
  @ApiQuery({ name: 'shopId', required: true })
  @ApiResponse({ status: 200, description: 'Held orders' })
  async getHeldOrders(@Query('shopId') shopId: string) {
    return this.posService.getHeldOrders(shopId);
  }

  @Delete('hold/:id')
  @ApiOperation({ summary: 'Delete held order' })
  @ApiResponse({ status: 200, description: 'Held order deleted' })
  async deleteHeldOrder(@Param('id') id: string) {
    return this.posService.deleteHeldOrder(id);
  }

  // ============================================
  // PRODUCTS
  // ============================================

  @Get('products/search')
  @ApiOperation({ summary: 'Search products for POS' })
  @ApiQuery({ name: 'shopId', required: true })
  @ApiQuery({ name: 'q', required: true })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchProducts(@Query('shopId') shopId: string, @Query('q') query: string) {
    return this.posService.searchProducts(shopId, query);
  }

  @Post('quick-products')
  @ApiOperation({ summary: 'Create quick product' })
  @ApiResponse({ status: 201, description: 'Quick product created' })
  async createQuickProduct(@Body() dto: QuickProductDto) {
    return this.posService.createQuickProduct(dto);
  }

  @Get('quick-products')
  @ApiOperation({ summary: 'Get quick products' })
  @ApiQuery({ name: 'shopId', required: true })
  @ApiResponse({ status: 200, description: 'Quick products' })
  async getQuickProducts(@Query('shopId') shopId: string) {
    return this.posService.getQuickProducts(shopId);
  }

  // ============================================
  // SETTINGS & REPORTS
  // ============================================

  @Get('settings')
  @ApiOperation({ summary: 'Get POS settings' })
  @ApiQuery({ name: 'shopId', required: true })
  @ApiResponse({ status: 200, description: 'POS settings' })
  async getSettings(@Query('shopId') shopId: string) {
    const settings = await this.posService.getSettings(shopId);
    return { data: settings };
  }

  @Put('settings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR)
  @ApiOperation({ summary: 'Update POS settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(
    @Query('shopId') shopId: string,
    @Body() dto: POSSettingsDto,
  ) {
    return this.posService.updateSettings(shopId, dto);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get POS reports' })
  @ApiQuery({ name: 'shopId', required: true })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'POS reports' })
  async getReports(
    @Query('shopId') shopId: string,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.posService.getReports(shopId, period, startDate, endDate);
  }
}
