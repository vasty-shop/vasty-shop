import {
  Controller,
  Get,
  Post,
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
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopOwnerGuard } from '../auth/guards/shop-owner.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddOrderNoteDto } from './dto/add-order-note.dto';

@ApiTags('Orders')
@Controller('orders')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations)',
  required: false,
})
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create order from cart' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid' })
  @ApiResponse({ status: 422, description: 'Some items are no longer available' })
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.userId, createOrderDto);
  }

  @Post(':id/confirm-payment')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm payment for an order (from Stripe Checkout Session or PaymentIntent)' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async confirmPayment(
    @Request() req,
    @Param('id') orderId: string,
    @Body() body: { paymentIntentId?: string; sessionId?: string },
  ) {
    return this.ordersService.confirmPayment(
      req.user.userId,
      orderId,
      body.paymentIntentId || '',
      body.sessionId,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user order history with pagination (filter by shop if shopId provided)' })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  @ApiQuery({ name: 'shopId', required: false, example: 'shop-uuid', description: 'Filter orders by shop' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of orders with pagination' })
  async getOrders(@Request() req, @Query() query: any) {
    // Accept shopId from query params or header
    const shopId = query.shopId || req.headers['x-shop-id'];

    return this.ordersService.findAll(req.user.userId, {
      status: query.status,
      shopId: shopId,
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders (admin only)' })
  @ApiQuery({ name: 'status', required: false, example: 'pending,processing' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of all orders with pagination' })
  async getAllOrders(@Request() req, @Query() query: any) {
    // TODO: Add admin role check
    return this.ordersService.findAllAdmin({
      status: query.status,
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 100,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });
  }

  @Get('admin/payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payment transactions (admin only)' })
  @ApiQuery({ name: 'status', required: false, example: 'completed', description: 'Filter by status: all, completed, pending, failed, refunded' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  @ApiResponse({ status: 200, description: 'List of payment transactions with stats' })
  async getAdminPayments(@Request() req, @Query() query: any) {
    // TODO: Add admin role check
    return this.ordersService.getAdminPaymentTransactions({
      status: query.status || 'all',
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 100,
    });
  }

  @Get('shop')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get orders for shop (vendor mode) - shows ALL orders for the shop' })
  @ApiQuery({ name: 'status', required: false, example: 'pending,processing' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiResponse({ status: 200, description: 'List of shop orders with pagination' })
  async getShopOrders(@Request() req, @Query() query: any) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    // Use findAllForShop for vendor mode - shows ALL orders for the shop
    return this.ordersService.findAllForShop(shopId, {
      status: query.status,
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 100,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single order details' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrder(@Request() req, @Param('id') id: string) {
    return this.ordersService.findOne(id, req.user.userId);
  }

  @Get('number/:orderNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order by order number' })
  @ApiParam({ name: 'orderNumber', example: 'FLX-2025-12345' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderByNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get('track/:trackingNumber')
  @ApiOperation({ summary: 'Track order by tracking number (public)' })
  @ApiParam({ name: 'trackingNumber', example: 'TRK123456789' })
  @ApiResponse({ status: 200, description: 'Order tracking information' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async trackOrder(@Param('trackingNumber') trackingNumber: string) {
    return this.ordersService.trackOrder(trackingNumber);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel order (customer only, pending/processing status)' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel order with current status' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancelOrder(@Request() req, @Param('id') id: string) {
    return this.ordersService.cancel(id, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update order status (shop owner only)' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    return this.ordersService.updateStatus(id, updateDto, shopId);
  }

  @Post(':id/notes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add note to order' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Note added successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async addOrderNote(
    @Request() req,
    @Param('id') id: string,
    @Body() addNoteDto: AddOrderNoteDto,
  ) {
    const shopId = req.headers['x-shop-id'];
    const isShopOwner = !!shopId;
    return this.ordersService.addNote(
      id,
      addNoteDto,
      req.user.userId,
      isShopOwner,
    );
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request refund for delivered order' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Refund requested successfully' })
  @ApiResponse({ status: 400, description: 'Cannot refund order with current status' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async requestRefund(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { amount: number; reason: string },
  ) {
    return this.ordersService.refund(
      id,
      body.amount,
      body.reason,
      req.user.userId,
    );
  }

  @Get('shop/statistics')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order statistics for shop (shop owner only)' })
  @ApiResponse({ status: 200, description: 'Order statistics' })
  @ApiResponse({ status: 400, description: 'Shop ID header missing' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getShopStatistics(@Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    return this.ordersService.getStatistics(shopId);
  }

  // Legacy endpoint - kept for backward compatibility
  @Get('shop/:shopId/statistics')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get order statistics for shop (shop owner only) - DEPRECATED: Use x-shop-id header instead',
    deprecated: true
  })
  @ApiParam({ name: 'shopId', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Order statistics' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getShopStatisticsLegacy(@Param('shopId') shopId: string) {
    return this.ordersService.getStatistics(shopId);
  }

  @Get(':id/timeline')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order status timeline' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Order timeline' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderTimeline(@Request() req, @Param('id') id: string) {
    const order = await this.ordersService.findOne(id, req.user.userId);
    return this.ordersService.calculateOrderTimeline(order);
  }

  @Post(':id/accept')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Accept order (change status to processing) - shop owner only' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Order accepted and moved to processing' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async acceptOrder(@Request() req, @Param('id') id: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    return this.ordersService.updateStatus(
      id,
      { status: 'processing', statusNote: 'Order accepted by vendor' },
      shopId,
    );
  }

  @Post(':id/ship')
  @UseGuards(JwtAuthGuard, ShopOwnerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark order as shipped - shop owner only' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Order marked as shipped' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async shipOrder(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { trackingNumber?: string; carrier?: string },
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    return this.ordersService.updateStatus(
      id,
      {
        status: 'shipped',
        statusNote: 'Order has been shipped',
        trackingNumber: body.trackingNumber,
        carrier: body.carrier,
      },
      shopId,
    );
  }

  @Get(':id/delivery-location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get delivery location for order - for live tracking' })
  @ApiParam({ name: 'id', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: 200, description: 'Delivery location information' })
  @ApiResponse({ status: 404, description: 'Order not found or no delivery assigned' })
  async getDeliveryLocation(@Param('id') id: string) {
    return this.ordersService.getDeliveryLocation(id);
  }
}
