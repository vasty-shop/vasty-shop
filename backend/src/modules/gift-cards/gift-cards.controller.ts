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
import { GiftCardsService } from './gift-cards.service';
import {
  CreateGiftCardTemplateDto,
  UpdateGiftCardTemplateDto,
  PurchaseGiftCardDto,
  RedeemGiftCardDto,
  TransferGiftCardDto,
  TopUpGiftCardDto,
  GetGiftCardsDto,
  CheckBalanceDto,
  GiftCardTemplateResponseDto,
  GiftCardResponseDto,
  GiftCardTransactionResponseDto,
  GiftCardBalanceResponseDto,
  PurchaseResultResponseDto,
  GiftCardStatus,
} from './dto/gift-cards.dto';

@ApiTags('Gift Cards')
@Controller('gift-cards')
export class GiftCardsController {
  constructor(private readonly giftCardsService: GiftCardsService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('templates')
  @ApiOperation({ summary: 'Get available gift card templates' })
  @ApiResponse({ status: 200, description: 'Templates list', type: [GiftCardTemplateResponseDto] })
  async getTemplates(@Query('includeInactive') includeInactive?: string) {
    return this.giftCardsService.getTemplates(includeInactive === 'true');
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template details', type: GiftCardTemplateResponseDto })
  async getTemplate(@Param('id') id: string) {
    return this.giftCardsService.getTemplate(id);
  }

  @Post('check-balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check gift card balance' })
  @ApiResponse({ status: 200, description: 'Balance info', type: GiftCardBalanceResponseDto })
  async checkBalance(@Body() dto: CheckBalanceDto) {
    return this.giftCardsService.checkBalance(dto.code);
  }

  // ============================================
  // USER ENDPOINTS
  // ============================================

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase gift cards' })
  @ApiResponse({ status: 201, description: 'Purchase result', type: PurchaseResultResponseDto })
  async purchaseGiftCards(@Req() req: any, @Body() dto: PurchaseGiftCardDto) {
    const userId = req.user.sub || req.user.userId;
    return this.giftCardsService.purchaseGiftCards(userId, dto);
  }

  @Get('my-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my gift cards' })
  @ApiResponse({ status: 200, description: 'User gift cards', type: [GiftCardResponseDto] })
  async getMyGiftCards(
    @Req() req: any,
    @Query('status') status?: GiftCardStatus,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.giftCardsService.getUserGiftCards(userId, status);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redeem gift card' })
  @ApiResponse({ status: 200, description: 'Redemption result' })
  async redeemGiftCard(@Req() req: any, @Body() dto: RedeemGiftCardDto) {
    const userId = req.user.sub || req.user.userId;
    return this.giftCardsService.redeemGiftCard(userId, dto);
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer gift card to another user' })
  @ApiResponse({ status: 200, description: 'Transfer result' })
  async transferGiftCard(@Req() req: any, @Body() dto: TransferGiftCardDto) {
    const userId = req.user.sub || req.user.userId;
    return this.giftCardsService.transferGiftCard(userId, dto);
  }

  @Post('top-up')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Top up gift card balance' })
  @ApiResponse({ status: 200, description: 'Top up result' })
  async topUpGiftCard(@Req() req: any, @Body() dto: TopUpGiftCardDto) {
    const userId = req.user.sub || req.user.userId;
    return this.giftCardsService.topUpGiftCard(userId, dto);
  }

  @Get(':code/transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get gift card transactions' })
  @ApiResponse({ status: 200, description: 'Transactions', type: [GiftCardTransactionResponseDto] })
  async getTransactions(@Param('code') code: string) {
    const card = await this.giftCardsService.getGiftCardByCode(code);
    return this.giftCardsService.getTransactions(card.id);
  }

  // ============================================
  // ADMIN - TEMPLATE MANAGEMENT
  // ============================================

  @Post('templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create gift card template (Admin)' })
  @ApiResponse({ status: 201, description: 'Template created', type: GiftCardTemplateResponseDto })
  async createTemplate(@Body() dto: CreateGiftCardTemplateDto) {
    // TODO: Add admin role check
    return this.giftCardsService.createTemplate(dto);
  }

  @Put('templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update gift card template (Admin)' })
  @ApiResponse({ status: 200, description: 'Template updated', type: GiftCardTemplateResponseDto })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateGiftCardTemplateDto) {
    // TODO: Add admin role check
    return this.giftCardsService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete gift card template (Admin)' })
  @ApiResponse({ status: 204, description: 'Template deleted' })
  async deleteTemplate(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.giftCardsService.deleteTemplate(id);
  }

  // ============================================
  // ADMIN - GIFT CARD MANAGEMENT
  // ============================================

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all gift cards (Admin)' })
  @ApiResponse({ status: 200, description: 'All gift cards', type: [GiftCardResponseDto] })
  async getAllGiftCards(@Query() query: GetGiftCardsDto) {
    // TODO: Add admin role check
    return this.giftCardsService.getGiftCards(query);
  }

  @Post('admin/cancel/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel gift card (Admin)' })
  @ApiResponse({ status: 200, description: 'Card cancelled' })
  async cancelGiftCard(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    // TODO: Add admin role check
    return this.giftCardsService.cancelGiftCard(id, reason);
  }

  @Get('admin/statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get gift card statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'Statistics' })
  async getStatistics() {
    // TODO: Add admin role check
    return this.giftCardsService.getStatistics();
  }
}
