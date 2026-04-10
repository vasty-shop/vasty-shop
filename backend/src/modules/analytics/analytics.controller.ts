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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';
import {
  ReportPeriod,
  DashboardOverviewDto,
  TransactionReportDto,
  OrderReportDto,
  ItemReportDto,
  StoreReportDto,
  CustomerReportDto,
  DeliveryReportDto,
  ExpenseReportDto,
  TaxReportDto,
  RevenueReportDto,
  PerformanceReportDto,
  ExportReportDto,
  CreateScheduledReportDto,
  UpdateScheduledReportDto,
  CreateGoalDto,
  UpdateGoalDto,
  CreateAlertDto,
  UpdateAlertDto,
  ComparePeriodsDto,
  CompareShopsDto,
  CohortAnalysisDto,
  FunnelAnalysisDto,
  SaveDashboardLayoutDto,
} from './dto/analytics.dto';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================

  @Get('dashboard')
  @Roles(UserRole.ADMIN)
  async getDashboardOverview(@Query() dto: DashboardOverviewDto, @Req() req: any) {
    return this.analyticsService.getDashboardOverview(dto, req.user.sub || req.user.userId);
  }

  @Get('dashboard/vendor')
  @Roles(UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async getVendorDashboard(@Query('shopId') shopId: string, @Query() dto: DashboardOverviewDto) {
    return this.analyticsService.getVendorDashboard(shopId, dto);
  }

  @Get('dashboard/layout')
  async getDashboardLayout(@Query('name') layoutName: string, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.analyticsService.getDashboardLayout(userId, layoutName);
  }

  @Post('dashboard/layout')
  async saveDashboardLayout(@Body() dto: SaveDashboardLayoutDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.analyticsService.saveDashboardLayout(dto, userId);
  }

  // ============================================
  // TRANSACTION REPORTS
  // ============================================

  @Get('reports/transactions')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getTransactionReport(@Query() dto: TransactionReportDto) {
    return this.analyticsService.getTransactionReport(dto);
  }

  // ============================================
  // ORDER REPORTS
  // ============================================

  @Get('reports/orders')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async getOrderReport(@Query() dto: OrderReportDto) {
    return this.analyticsService.getOrderReport(dto);
  }

  // ============================================
  // ITEM/PRODUCT REPORTS
  // ============================================

  @Get('reports/items')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async getItemReport(@Query() dto: ItemReportDto) {
    return this.analyticsService.getItemReport(dto);
  }

  @Get('reports/low-stock')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async getLowStockReport(
    @Query('shopId') shopId?: string,
    @Query('threshold') threshold?: string,
  ) {
    return this.analyticsService.getLowStockReport(shopId, threshold ? parseInt(threshold) : 10);
  }

  // ============================================
  // STORE REPORTS
  // ============================================

  @Get('reports/stores')
  @Roles(UserRole.ADMIN)
  async getStoreReport(@Query() dto: StoreReportDto) {
    return this.analyticsService.getStoreReport(dto);
  }

  // ============================================
  // CUSTOMER REPORTS
  // ============================================

  @Get('reports/customers')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getCustomerReport(@Query() dto: CustomerReportDto) {
    return this.analyticsService.getCustomerReport(dto);
  }

  // ============================================
  // DELIVERY REPORTS
  // ============================================

  @Get('reports/delivery')
  @Roles(UserRole.ADMIN)
  async getDeliveryReport(@Query() dto: DeliveryReportDto) {
    return this.analyticsService.getDeliveryReport(dto);
  }

  // ============================================
  // EXPENSE REPORTS
  // ============================================

  @Get('reports/expenses')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getExpenseReport(@Query() dto: ExpenseReportDto) {
    return this.analyticsService.getExpenseReport(dto);
  }

  // ============================================
  // TAX REPORTS
  // ============================================

  @Get('reports/tax')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getTaxReport(@Query() dto: TaxReportDto) {
    return this.analyticsService.getTaxReport(dto);
  }

  // ============================================
  // REVENUE REPORTS
  // ============================================

  @Get('reports/revenue')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getRevenueReport(@Query() dto: RevenueReportDto) {
    return this.analyticsService.getRevenueReport(dto);
  }

  // ============================================
  // PERFORMANCE REPORTS
  // ============================================

  @Get('reports/performance')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getPerformanceReport(@Query() dto: PerformanceReportDto) {
    return this.analyticsService.getPerformanceReport(dto);
  }

  // ============================================
  // EXPORT
  // ============================================

  @Post('export')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async exportReport(@Body() dto: ExportReportDto, @Res() res: Response) {
    const result = await this.analyticsService.exportReport(dto);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`);

    if (result.contentType === 'application/json') {
      res.json(result.data);
    } else if (result.contentType === 'text/csv') {
      res.send(result.data);
    } else {
      // For Excel/PDF, return data for client-side processing or indicate needs server-side processing
      res.json(result);
    }
  }

  // ============================================
  // SCHEDULED REPORTS
  // ============================================

  @Post('scheduled-reports')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createScheduledReport(@Body() dto: CreateScheduledReportDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.analyticsService.createScheduledReport(dto, userId);
  }

  @Get('scheduled-reports')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getScheduledReports(@Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.analyticsService.getScheduledReports(userId);
  }

  @Put('scheduled-reports/:id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateScheduledReport(@Param('id') id: string, @Body() dto: UpdateScheduledReportDto) {
    return this.analyticsService.updateScheduledReport(id, dto);
  }

  @Delete('scheduled-reports/:id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteScheduledReport(@Param('id') id: string) {
    return this.analyticsService.deleteScheduledReport(id);
  }

  // ============================================
  // GOALS/KPIs
  // ============================================

  @Post('goals')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createGoal(@Body() dto: CreateGoalDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.analyticsService.createGoal(dto, userId);
  }

  @Get('goals')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getGoals(@Query('shopId') shopId?: string, @Req() req?: any) {
    const userId = req?.user?.sub || req?.user?.userId;
    return this.analyticsService.getGoals(shopId, userId);
  }

  @Put('goals/:id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateGoal(@Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.analyticsService.updateGoal(id, dto);
  }

  @Delete('goals/:id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteGoal(@Param('id') id: string) {
    return this.analyticsService.deleteGoal(id);
  }

  // ============================================
  // ALERTS
  // ============================================

  @Post('alerts')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createAlert(@Body() dto: CreateAlertDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.analyticsService.createAlert(dto, userId);
  }

  @Get('alerts')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getAlerts(@Query('shopId') shopId?: string, @Req() req?: any) {
    const userId = req?.user?.sub || req?.user?.userId;
    return this.analyticsService.getAlerts(shopId, userId);
  }

  @Put('alerts/:id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateAlert(@Param('id') id: string, @Body() dto: UpdateAlertDto) {
    return this.analyticsService.updateAlert(id, dto);
  }

  @Delete('alerts/:id')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteAlert(@Param('id') id: string) {
    return this.analyticsService.deleteAlert(id);
  }

  // ============================================
  // COMPARISON REPORTS
  // ============================================

  @Post('compare/periods')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async comparePeriods(@Body() dto: ComparePeriodsDto) {
    return this.analyticsService.comparePeriods(dto);
  }

  @Post('compare/shops')
  @Roles(UserRole.ADMIN)
  async compareShops(@Body() dto: CompareShopsDto) {
    return this.analyticsService.compareShops(dto);
  }

  // ============================================
  // ADVANCED ANALYSIS
  // ============================================

  @Post('cohort')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getCohortAnalysis(@Body() dto: CohortAnalysisDto) {
    return this.analyticsService.getCohortAnalysis(dto);
  }

  @Post('funnel')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getFunnelAnalysis(@Body() dto: FunnelAnalysisDto) {
    return this.analyticsService.getFunnelAnalysis(dto);
  }

  // ============================================
  // REAL-TIME STATS (Lightweight)
  // ============================================

  @Get('realtime/orders')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getRealtimeOrders(@Query('shopId') shopId?: string) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return this.analyticsService.getOrderReport({
      period: ReportPeriod.TODAY,
      shopId,
      limit: 20,
    });
  }

  @Get('realtime/revenue')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getRealtimeRevenue(@Query('shopId') shopId?: string) {
    return this.analyticsService.getRevenueReport({
      period: ReportPeriod.TODAY,
      shopId,
      groupBy: 'hour',
    });
  }

  // ============================================
  // QUICK STATS
  // ============================================

  @Get('quick-stats')
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async getQuickStats(
    @Query('shopId') shopId?: string,
    @Query('period') period: ReportPeriod = ReportPeriod.TODAY,
  ) {
    return this.analyticsService.getDashboardOverview({ period, shopId });
  }
}
