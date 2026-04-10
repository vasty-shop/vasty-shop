import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RefundService } from './refund.service';
import {
  CreateRefundRequestDto,
  ProcessRefundDto,
  GetRefundsDto,
  RefundResponseDto,
} from './dto/refund.dto';

@ApiTags('Refunds')
@Controller('refunds')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  // ============================================
  // CUSTOMER ENDPOINTS
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a refund request' })
  @ApiResponse({ status: 201, description: 'Refund request created', type: RefundResponseDto })
  async createRefundRequest(@Req() req: any, @Body() dto: CreateRefundRequestDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.refundService.createRefundRequest(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user refund requests' })
  @ApiResponse({ status: 200, description: 'List of refund requests', type: [RefundResponseDto] })
  async getUserRefunds(@Req() req: any, @Query() dto: GetRefundsDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.refundService.getUserRefunds(userId, dto);
  }

  @Get('reasons')
  @ApiOperation({ summary: 'Get available refund reasons' })
  @ApiResponse({ status: 200, description: 'List of refund reasons' })
  async getRefundReasons() {
    return this.refundService.getRefundReasons();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get refund request by ID' })
  @ApiResponse({ status: 200, description: 'Refund request details', type: RefundResponseDto })
  async getRefundById(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.userId;
    return this.refundService.getRefundById(id, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending refund request' })
  @ApiResponse({ status: 200, description: 'Refund request cancelled' })
  async cancelRefund(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.userId;
    return this.refundService.cancelRefund(id, userId);
  }

  // ============================================
  // VENDOR ENDPOINTS
  // ============================================

  @Get('shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shop refund requests (vendor)' })
  @ApiResponse({ status: 200, description: 'List of shop refund requests', type: [RefundResponseDto] })
  async getShopRefunds(@Param('shopId') shopId: string, @Query() dto: GetRefundsDto) {
    return this.refundService.getShopRefunds(shopId, dto);
  }

  @Get('shop/:shopId/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shop refund statistics (vendor)' })
  @ApiResponse({ status: 200, description: 'Refund statistics' })
  async getShopRefundStats(@Param('shopId') shopId: string) {
    return this.refundService.getRefundStats(shopId);
  }

  @Post('process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process refund request (approve/reject)' })
  @ApiResponse({ status: 200, description: 'Refund processed' })
  async processRefund(@Req() req: any, @Body() dto: ProcessRefundDto) {
    const reviewerId = req.user?.sub || req.user?.userId;
    return this.refundService.processRefund(dto, reviewerId);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all refund requests (admin)' })
  @ApiResponse({ status: 200, description: 'List of all refund requests' })
  async getAllRefunds(@Query() dto: GetRefundsDto) {
    // TODO: Add admin role check
    return this.refundService.getShopRefunds('', dto); // Empty shopId returns all
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform refund statistics (admin)' })
  @ApiResponse({ status: 200, description: 'Platform-wide refund statistics' })
  async getPlatformRefundStats() {
    // TODO: Add admin role check
    return this.refundService.getRefundStats();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get any refund request by ID (admin)' })
  @ApiResponse({ status: 200, description: 'Refund request details' })
  async adminGetRefund(@Param('id') id: string) {
    // TODO: Add admin role check
    return this.refundService.getRefundById(id);
  }
}
