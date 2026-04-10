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
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DisbursementService } from './disbursement.service';
import {
  SetupPaymentMethodDto,
  UpdatePaymentMethodDto,
  SetDisbursementSettingsDto,
  RequestDisbursementDto,
  ProcessDisbursementDto,
  GetDisbursementsDto,
  CreateStripeConnectAccountDto,
  PaymentMethodResponseDto,
  DisbursementSettingsResponseDto,
  DisbursementResponseDto,
  BalanceResponseDto,
  StripeConnectResponseDto,
} from './dto/disbursement.dto';

@ApiTags('Disbursement')
@Controller('disbursements')
export class DisbursementController {
  constructor(private readonly disbursementService: DisbursementService) {}

  // ============================================
  // VENDOR - PAYMENT METHODS
  // ============================================

  @Get('payment-methods/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment methods for shop' })
  @ApiResponse({ status: 200, description: 'Payment methods', type: [PaymentMethodResponseDto] })
  async getPaymentMethods(@Param('shopId') shopId: string) {
    return this.disbursementService.getPaymentMethods(shopId);
  }

  @Post('payment-methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup payment method' })
  @ApiResponse({ status: 201, description: 'Method created', type: PaymentMethodResponseDto })
  async setupPaymentMethod(@Body() dto: SetupPaymentMethodDto) {
    return this.disbursementService.setupPaymentMethod(dto);
  }

  @Put('payment-methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment method' })
  @ApiResponse({ status: 200, description: 'Method updated', type: PaymentMethodResponseDto })
  async updatePaymentMethod(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return this.disbursementService.updatePaymentMethod(id, dto);
  }

  @Delete('payment-methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiResponse({ status: 204, description: 'Method deleted' })
  async deletePaymentMethod(@Param('id') id: string) {
    await this.disbursementService.deletePaymentMethod(id);
  }

  // ============================================
  // VENDOR - SETTINGS
  // ============================================

  @Get('settings/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get disbursement settings' })
  @ApiResponse({ status: 200, description: 'Settings', type: DisbursementSettingsResponseDto })
  async getSettings(@Param('shopId') shopId: string) {
    return this.disbursementService.getSettings(shopId);
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set disbursement settings' })
  @ApiResponse({ status: 200, description: 'Settings saved', type: DisbursementSettingsResponseDto })
  async setSettings(@Body() dto: SetDisbursementSettingsDto) {
    return this.disbursementService.setSettings(dto);
  }

  // ============================================
  // VENDOR - BALANCE & EARNINGS
  // ============================================

  @Get('balance/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor balance' })
  @ApiResponse({ status: 200, description: 'Balance info', type: BalanceResponseDto })
  async getBalance(@Param('shopId') shopId: string) {
    return this.disbursementService.getBalance(shopId);
  }

  // ============================================
  // VENDOR - DISBURSEMENT REQUESTS
  // ============================================

  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request disbursement' })
  @ApiResponse({ status: 201, description: 'Disbursement requested', type: DisbursementResponseDto })
  async requestDisbursement(@Body() dto: RequestDisbursementDto) {
    return this.disbursementService.requestDisbursement(dto);
  }

  @Get('shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shop disbursements' })
  @ApiResponse({ status: 200, description: 'Disbursements list', type: [DisbursementResponseDto] })
  async getShopDisbursements(
    @Param('shopId') shopId: string,
    @Query() query: GetDisbursementsDto,
  ) {
    return this.disbursementService.getDisbursements({ ...query, shopId });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get disbursement by ID' })
  @ApiResponse({ status: 200, description: 'Disbursement details', type: DisbursementResponseDto })
  async getDisbursement(@Param('id') id: string) {
    return this.disbursementService.getDisbursement(id);
  }

  @Delete(':id/shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel disbursement (Vendor)' })
  @ApiResponse({ status: 204, description: 'Disbursement cancelled' })
  async cancelDisbursement(
    @Param('id') id: string,
    @Param('shopId') shopId: string,
  ) {
    await this.disbursementService.cancelDisbursement(id, shopId);
  }

  // ============================================
  // ADMIN - PROCESS DISBURSEMENTS
  // ============================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all disbursements (Admin)' })
  @ApiResponse({ status: 200, description: 'All disbursements', type: [DisbursementResponseDto] })
  async getAllDisbursements(@Query() query: GetDisbursementsDto) {
    // TODO: Add admin role check
    return this.disbursementService.getDisbursements(query);
  }

  @Post('admin/process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process disbursement (Admin)' })
  @ApiResponse({ status: 200, description: 'Disbursement processed', type: DisbursementResponseDto })
  async processDisbursement(@Body() dto: ProcessDisbursementDto) {
    // TODO: Add admin role check
    return this.disbursementService.processDisbursement(dto);
  }

  // ============================================
  // STRIPE CONNECT
  // ============================================

  @Post('stripe-connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe Connect account' })
  @ApiResponse({ status: 201, description: 'Account created', type: StripeConnectResponseDto })
  async createStripeConnectAccount(@Body() dto: CreateStripeConnectAccountDto) {
    return this.disbursementService.createStripeConnectAccount(dto);
  }

  @Get('stripe-connect/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Stripe Connect status' })
  @ApiResponse({ status: 200, description: 'Connect status' })
  async getStripeConnectStatus(@Param('shopId') shopId: string) {
    return this.disbursementService.getStripeConnectStatus(shopId);
  }
}
