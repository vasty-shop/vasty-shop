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
import { CashbackService } from './cashback.service';
import {
  CreateCashbackRuleDto,
  UpdateCashbackRuleDto,
  GetCashbackHistoryDto,
  CashbackRuleResponseDto,
  CashbackTransactionResponseDto,
} from './dto/cashback.dto';

@ApiTags('Cashback')
@Controller('cashback')
export class CashbackController {
  constructor(private readonly cashbackService: CashbackService) {}

  // ============================================
  // USER ENDPOINTS
  // ============================================

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user cashback history' })
  @ApiResponse({ status: 200, description: 'Cashback history', type: [CashbackTransactionResponseDto] })
  async getUserHistory(@Req() req: any, @Query() dto: GetCashbackHistoryDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.cashbackService.getUserCashbackHistory(userId, dto);
  }

  @Get('total')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user total cashback stats' })
  @ApiResponse({ status: 200, description: 'Cashback totals' })
  async getUserTotal(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.cashbackService.getUserTotalCashback(userId);
  }

  @Get('calculate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate potential cashback for an order' })
  @ApiResponse({ status: 200, description: 'Calculated cashback' })
  async calculateCashback(
    @Req() req: any,
    @Query('amount') amount: string,
    @Query('shopId') shopId?: string,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const orderAmount = parseFloat(amount);
    if (isNaN(orderAmount)) {
      return { amount: 0, rule: null };
    }
    return this.cashbackService.calculateCashback(userId, orderAmount, shopId);
  }

  // ============================================
  // ADMIN ENDPOINTS - RULES
  // ============================================

  @Get('rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all cashback rules (Admin)' })
  @ApiResponse({ status: 200, description: 'List of rules', type: [CashbackRuleResponseDto] })
  async getRules(@Query('includeInactive') includeInactive?: string) {
    return this.cashbackService.getRules(includeInactive === 'true');
  }

  @Get('rules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get cashback rule by ID (Admin)' })
  @ApiResponse({ status: 200, description: 'Rule details', type: CashbackRuleResponseDto })
  async getRule(@Param('id') id: string) {
    return this.cashbackService.getRule(id);
  }

  @Post('rules')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create cashback rule (Admin)' })
  @ApiResponse({ status: 201, description: 'Rule created', type: CashbackRuleResponseDto })
  async createRule(@Body() dto: CreateCashbackRuleDto) {
    // TODO: Add admin role check
    return this.cashbackService.createRule(dto);
  }

  @Put('rules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update cashback rule (Admin)' })
  @ApiResponse({ status: 200, description: 'Rule updated', type: CashbackRuleResponseDto })
  async updateRule(@Param('id') id: string, @Body() dto: UpdateCashbackRuleDto) {
    // TODO: Add admin role check
    return this.cashbackService.updateRule(id, dto);
  }

  @Delete('rules/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete cashback rule (Admin)' })
  @ApiResponse({ status: 204, description: 'Rule deleted' })
  async deleteRule(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.cashbackService.deleteRule(id);
  }

  // ============================================
  // ADMIN ENDPOINTS - PROCESSING
  // ============================================

  @Post('credit/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Credit pending cashback for order (Admin/System)' })
  @ApiResponse({ status: 200, description: 'Cashback credited' })
  async creditCashback(@Param('orderId') orderId: string) {
    // TODO: Add admin role check or internal service call
    return this.cashbackService.creditCashback(orderId);
  }

  @Post('cancel/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pending cashback for order (Admin/System)' })
  @ApiResponse({ status: 200, description: 'Cashback cancelled' })
  async cancelCashback(@Param('orderId') orderId: string) {
    // TODO: Add admin role check or internal service call
    await this.cashbackService.cancelCashback(orderId);
    return { success: true };
  }
}
