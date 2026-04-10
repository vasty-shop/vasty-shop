import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import {
  TopUpWalletDto,
  TransferFundsDto,
  PayWithWalletDto,
  GetTransactionsDto,
  WalletResponseDto,
  TransactionResponseDto,
  CreateTopupIntentDto,
  ConfirmTopupDto,
  AdminAdjustBalanceDto,
} from './dto/wallet.dto';

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user wallet' })
  @ApiResponse({ status: 200, description: 'Wallet details', type: WalletResponseDto })
  async getWallet(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.walletService.getOrCreateWallet(userId);
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Wallet balance' })
  async getBalance(@Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    return this.walletService.getWalletBalance(userId);
  }

  @Post('topup/intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create top-up payment intent' })
  @ApiResponse({ status: 201, description: 'Payment intent created' })
  async createTopupIntent(@Req() req: any, @Body() dto: CreateTopupIntentDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.walletService.createTopupIntent(userId, dto.amount, dto.currency);
  }

  @Post('topup/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm top-up after successful payment' })
  @ApiResponse({ status: 200, description: 'Top-up confirmed' })
  async confirmTopup(@Body() dto: ConfirmTopupDto) {
    return this.walletService.confirmTopup(dto.topupId, dto.paymentIntentId);
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer funds to another user' })
  @ApiResponse({ status: 200, description: 'Transfer successful' })
  async transferFunds(@Req() req: any, @Body() dto: TransferFundsDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.walletService.transferFunds(userId, dto);
  }

  @Post('pay')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pay for order with wallet balance' })
  @ApiResponse({ status: 200, description: 'Payment successful' })
  async payWithWallet(@Req() req: any, @Body() dto: PayWithWalletDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.walletService.payWithWallet(userId, dto);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction history' })
  @ApiResponse({ status: 200, description: 'Transaction list', type: [TransactionResponseDto] })
  async getTransactions(@Req() req: any, @Query() dto: GetTransactionsDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.walletService.getTransactions(userId, dto);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Post('admin/adjust')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Adjust user wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance adjusted' })
  async adminAdjustBalance(@Req() req: any, @Body() dto: AdminAdjustBalanceDto) {
    const adminUserId = req.user?.sub || req.user?.userId;
    // TODO: Add admin role check
    return this.walletService.adminAdjustBalance(
      adminUserId,
      dto.userId,
      dto.amount,
      dto.reason,
      dto.notes,
    );
  }

  @Get('admin/user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get user wallet' })
  @ApiResponse({ status: 200, description: 'User wallet details' })
  async adminGetUserWallet(@Param('userId') userId: string) {
    // TODO: Add admin role check
    return this.walletService.getOrCreateWallet(userId);
  }

  @Get('admin/user/:userId/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get user transactions' })
  @ApiResponse({ status: 200, description: 'User transaction list' })
  async adminGetUserTransactions(
    @Param('userId') userId: string,
    @Query() dto: GetTransactionsDto,
  ) {
    // TODO: Add admin role check
    return this.walletService.getTransactions(userId, dto);
  }
}
