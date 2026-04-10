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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';
import { FlashSalesService } from './flash-sales.service';
import {
  CreateFlashSaleDto,
  UpdateFlashSaleDto,
  AddProductsToFlashSaleDto,
  UpdateFlashSaleProductDto,
  RemoveProductsFromFlashSaleDto,
  BulkUpdateProductsDto,
  FlashSaleFilterDto,
  FlashSaleProductFilterDto,
  SubscribeToFlashSaleDto,
  JoinWaitlistDto,
  ValidateFlashSalePurchaseDto,
  ReserveFlashSaleItemsDto,
  ReleaseReservationDto,
  FlashSaleAnalyticsDto,
  FlashSaleComparisonDto,
  ScheduleFlashSaleDto,
  ExtendFlashSaleDto,
  CloneFlashSaleDto,
  GrantEarlyAccessDto,
  CreateFlashSaleBundleDto,
  UpdateFlashSaleBundleDto,
} from './dto/flash-sales.dto';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get()
  async getFlashSales(@Query() dto: FlashSaleFilterDto) {
    return this.flashSalesService.getFlashSales(dto);
  }

  @Get('active')
  async getActiveFlashSales(@Query('shopId') shopId?: string) {
    return this.flashSalesService.getActiveFlashSales(shopId);
  }

  @Get('upcoming')
  async getUpcomingFlashSales(
    @Query('shopId') shopId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.flashSalesService.getUpcomingFlashSales(shopId, limit ? parseInt(limit) : 5);
  }

  @Get(':id')
  async getFlashSale(@Param('id') id: string) {
    return this.flashSalesService.getFlashSale(id);
  }

  @Get(':id/products')
  async getFlashSaleProducts(
    @Param('id') flashSaleId: string,
    @Query() dto: FlashSaleProductFilterDto,
  ) {
    return this.flashSalesService.getFlashSaleProducts(flashSaleId, dto);
  }

  @Get(':id/bundles')
  async getFlashSaleBundles(@Param('id') flashSaleId: string) {
    return this.flashSalesService.getFlashSaleBundles(flashSaleId);
  }

  // ============================================
  // FLASH SALE MANAGEMENT
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createFlashSale(@Body() dto: CreateFlashSaleDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.createFlashSale(dto, userId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateFlashSale(@Param('id') id: string, @Body() dto: UpdateFlashSaleDto) {
    return this.flashSalesService.updateFlashSale(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteFlashSale(@Param('id') id: string) {
    return this.flashSalesService.deleteFlashSale(id);
  }

  // ============================================
  // STATUS MANAGEMENT
  // ============================================

  @Post(':id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async activateFlashSale(@Param('id') id: string) {
    return this.flashSalesService.activateFlashSale(id);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async pauseFlashSale(@Param('id') id: string) {
    return this.flashSalesService.pauseFlashSale(id);
  }

  @Post(':id/resume')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async resumeFlashSale(@Param('id') id: string) {
    return this.flashSalesService.resumeFlashSale(id);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async endFlashSale(@Param('id') id: string) {
    return this.flashSalesService.endFlashSale(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async cancelFlashSale(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.flashSalesService.cancelFlashSale(id, reason);
  }

  // ============================================
  // PRODUCT MANAGEMENT
  // ============================================

  @Post(':id/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async addProductsToFlashSale(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<AddProductsToFlashSaleDto, 'flashSaleId'>,
  ) {
    return this.flashSalesService.addProductsToFlashSale({ ...dto, flashSaleId });
  }

  @Put(':id/products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateFlashSaleProduct(
    @Param('id') flashSaleId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateFlashSaleProductDto,
  ) {
    return this.flashSalesService.updateFlashSaleProduct(flashSaleId, productId, dto);
  }

  @Post(':id/products/remove')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async removeProductsFromFlashSale(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<RemoveProductsFromFlashSaleDto, 'flashSaleId'>,
  ) {
    return this.flashSalesService.removeProductsFromFlashSale({ ...dto, flashSaleId });
  }

  @Post(':id/products/bulk-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async bulkUpdateProducts(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<BulkUpdateProductsDto, 'flashSaleId'>,
  ) {
    return this.flashSalesService.bulkUpdateProducts({ ...dto, flashSaleId });
  }

  // ============================================
  // SUBSCRIPTION & WAITLIST
  // ============================================

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  async subscribeToFlashSale(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<SubscribeToFlashSaleDto, 'flashSaleId'>,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.subscribeToFlashSale({ ...dto, flashSaleId }, userId);
  }

  @Delete(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  async unsubscribeFromFlashSale(@Param('id') flashSaleId: string, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.unsubscribeFromFlashSale(flashSaleId, userId);
  }

  @Post(':id/waitlist')
  @UseGuards(JwtAuthGuard)
  async joinWaitlist(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<JoinWaitlistDto, 'flashSaleId'>,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.joinWaitlist({ ...dto, flashSaleId }, userId);
  }

  @Delete(':id/waitlist/:productId')
  @UseGuards(JwtAuthGuard)
  async leaveWaitlist(
    @Param('id') flashSaleId: string,
    @Param('productId') productId: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.leaveWaitlist(flashSaleId, productId, userId);
  }

  // ============================================
  // PURCHASE VALIDATION & RESERVATION
  // ============================================

  @Post(':id/validate')
  @UseGuards(JwtAuthGuard)
  async validatePurchase(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<ValidateFlashSalePurchaseDto, 'flashSaleId'>,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.validatePurchase({ ...dto, flashSaleId }, userId);
  }

  @Post(':id/reserve')
  @UseGuards(JwtAuthGuard)
  async reserveItems(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<ReserveFlashSaleItemsDto, 'flashSaleId'>,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.reserveItems({ ...dto, flashSaleId }, userId);
  }

  @Post('reservations/:reservationId/release')
  @UseGuards(JwtAuthGuard)
  async releaseReservation(@Param('reservationId') reservationId: string) {
    return this.flashSalesService.releaseReservation({ reservationId });
  }

  // ============================================
  // SCHEDULING
  // ============================================

  @Post(':id/schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async scheduleFlashSale(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<ScheduleFlashSaleDto, 'flashSaleId'>,
  ) {
    return this.flashSalesService.scheduleFlashSale({ ...dto, flashSaleId });
  }

  @Post(':id/extend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async extendFlashSale(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<ExtendFlashSaleDto, 'flashSaleId'>,
  ) {
    return this.flashSalesService.extendFlashSale({ ...dto, flashSaleId });
  }

  @Post(':id/clone')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async cloneFlashSale(
    @Param('id') sourceFlashSaleId: string,
    @Body() dto: Omit<CloneFlashSaleDto, 'sourceFlashSaleId'>,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.flashSalesService.cloneFlashSale({ ...dto, sourceFlashSaleId }, userId);
  }

  // ============================================
  // BUNDLES
  // ============================================

  @Post(':id/bundles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createBundle(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<CreateFlashSaleBundleDto, 'flashSaleId'>,
  ) {
    return this.flashSalesService.createBundle({ ...dto, flashSaleId });
  }

  @Put('bundles/:bundleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateBundle(
    @Param('bundleId') bundleId: string,
    @Body() dto: UpdateFlashSaleBundleDto,
  ) {
    return this.flashSalesService.updateBundle(bundleId, dto);
  }

  @Delete('bundles/:bundleId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteBundle(@Param('bundleId') bundleId: string) {
    return this.flashSalesService.deleteBundle(bundleId);
  }

  // ============================================
  // EARLY ACCESS
  // ============================================

  @Post(':id/early-access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async grantEarlyAccess(
    @Param('id') flashSaleId: string,
    @Body() dto: Omit<GrantEarlyAccessDto, 'flashSaleId'>,
  ) {
    return this.flashSalesService.grantEarlyAccess({ ...dto, flashSaleId });
  }

  @Delete(':id/early-access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async revokeEarlyAccess(
    @Param('id') flashSaleId: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.flashSalesService.revokeEarlyAccess(flashSaleId, userIds);
  }

  // ============================================
  // ANALYTICS
  // ============================================

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getFlashSaleAnalytics(
    @Param('id') flashSaleId: string,
    @Query('granularity') granularity?: 'minute' | 'hour' | 'day',
  ) {
    return this.flashSalesService.getFlashSaleAnalytics({ flashSaleId, granularity });
  }

  @Post('compare')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async compareFlashSales(@Body() dto: FlashSaleComparisonDto) {
    return this.flashSalesService.compareFlashSales(dto);
  }
}
