import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RejectShopDto, SuspendShopDto } from './dto/reject-shop.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================
  // PUBLIC PLATFORM SETTINGS (No Auth Required)
  // ============================================

  @Get('platform-settings')
  @ApiOperation({ summary: 'Get public platform settings (no auth required)' })
  @ApiResponse({ status: 200, description: 'Public platform settings' })
  async getPublicPlatformSettings() {
    const settings = await this.adminService.getSettings();
    // Return only public-safe settings
    return {
      platformName: settings.general?.platformName || 'Vasty Shop',
      platformLogo: settings.general?.platformLogo || '',
      supportEmail: settings.general?.supportEmail || '',
      defaultCurrency: settings.general?.defaultCurrency || 'USD',
      defaultLanguage: settings.general?.defaultLanguage || 'en',
      maintenanceMode: settings.maintenance?.maintenanceMode || false,
      maintenanceMessage: settings.maintenance?.maintenanceMessage || '',
    };
  }

  // ============================================
  // SHOP MANAGEMENT (Auth Required)
  // ============================================

  @Get('shops')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all shops for admin (with filters)' })
  @ApiQuery({ name: 'status', required: false, example: 'pending' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'List of shops' })
  async getShops(@Query() query: any) {
    return this.adminService.getShops({
      status: query.status,
      search: query.search,
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
    });
  }

  @Get('shops/:id')
  @ApiOperation({ summary: 'Get shop details for admin' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop details' })
  async getShopDetails(@Param('id') id: string) {
    return this.adminService.getShopDetails(id);
  }

  @Patch('shops/:id/approve')
  @ApiOperation({ summary: 'Approve a pending shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop approved successfully' })
  async approveShop(@Param('id') id: string) {
    return this.adminService.approveShop(id);
  }

  @Patch('shops/:id/reject')
  @ApiOperation({ summary: 'Reject a pending shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiBody({ type: RejectShopDto })
  @ApiResponse({ status: 200, description: 'Shop rejected' })
  async rejectShop(@Param('id') id: string, @Body() body: RejectShopDto) {
    return this.adminService.rejectShop(id, body.reason);
  }

  @Patch('shops/:id/suspend')
  @ApiOperation({ summary: 'Suspend an active shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiBody({ type: SuspendShopDto })
  @ApiResponse({ status: 200, description: 'Shop suspended' })
  async suspendShop(@Param('id') id: string, @Body() body: SuspendShopDto) {
    return this.adminService.suspendShop(id, body.reason || '');
  }

  @Patch('shops/:id/activate')
  @ApiOperation({ summary: 'Reactivate a suspended shop' })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({ status: 200, description: 'Shop activated' })
  async activateShop(@Param('id') id: string) {
    return this.adminService.activateShop(id);
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  @Get('users')
  @ApiOperation({ summary: 'Get all users for admin (with filters)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false, example: 'customer' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 15 })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  @ApiResponse({ status: 200, description: 'List of users' })
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers({
      search: query.search,
      role: query.role,
      status: query.status,
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 15,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
    });
  }

  @Get('users/export')
  @ApiOperation({ summary: 'Export users as CSV' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'CSV file' })
  async exportUsers(@Query() query: any) {
    return this.adminService.exportUsers({
      role: query.role,
      status: query.status,
      search: query.search,
    });
  }

  @Get('users/:id/orders')
  @ApiOperation({ summary: 'Get user orders' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User orders' })
  async getUserOrders(@Param('id') id: string) {
    return this.adminService.getUserOrders(id);
  }

  @Get('users/:id/shops')
  @ApiOperation({ summary: 'Get user shops' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User shops' })
  async getUserShops(@Param('id') id: string) {
    return this.adminService.getUserShops(id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ schema: { properties: { role: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'User role updated' })
  async updateUserRole(@Param('id') id: string, @Body() body: { role: string }) {
    return this.adminService.updateUserRole(id, body.role);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (suspend/activate)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ schema: { properties: { status: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'User status updated' })
  async updateUserStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.adminService.updateUserStatus(id, body.status);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/bulk-action')
  @ApiOperation({ summary: 'Bulk action on users' })
  @ApiBody({ schema: { properties: { userIds: { type: 'array' }, action: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Bulk action completed' })
  async bulkAction(@Body() body: { userIds: string[]; action: string }) {
    return this.adminService.bulkAction(body.userIds, body.action);
  }

  // ============================================
  // DASHBOARD STATS
  // ============================================

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get admin dashboard stats (detailed)' })
  @ApiResponse({ status: 200, description: 'Detailed dashboard statistics' })
  async getDashboardStatsDetailed() {
    return this.adminService.getDashboardStatsDetailed();
  }

  @Get('dashboard/activity')
  @ApiOperation({ summary: 'Get admin recent activity' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Recent activity' })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(parseInt(limit) || 10);
  }

  // ============================================
  // ANALYTICS
  // ============================================

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get overview statistics' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiResponse({ status: 200, description: 'Overview statistics' })
  async getAnalyticsOverview(@Query('dateRange') dateRange?: string) {
    return this.adminService.getAnalyticsOverview(dateRange);
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Get revenue data for charts' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'timeframe', required: false })
  @ApiResponse({ status: 200, description: 'Revenue data' })
  async getRevenueData(@Query() query: any) {
    return this.adminService.getRevenueData(query.dateRange, query.timeframe);
  }

  @Get('analytics/orders')
  @ApiOperation({ summary: 'Get orders data for charts' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'timeframe', required: false })
  @ApiResponse({ status: 200, description: 'Orders data' })
  async getOrdersData(@Query() query: any) {
    return this.adminService.getOrdersData(query.dateRange, query.timeframe);
  }

  @Get('analytics/users')
  @ApiOperation({ summary: 'Get users data for charts' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'timeframe', required: false })
  @ApiResponse({ status: 200, description: 'Users data' })
  async getUsersData(@Query() query: any) {
    return this.adminService.getUsersData(query.dateRange, query.timeframe);
  }

  @Get('analytics/categories')
  @ApiOperation({ summary: 'Get categories data' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiResponse({ status: 200, description: 'Categories data' })
  async getCategoriesData(@Query('dateRange') dateRange?: string) {
    return this.adminService.getCategoriesData(dateRange);
  }

  @Get('analytics/top-shops')
  @ApiOperation({ summary: 'Get top performing shops' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Top shops' })
  async getTopShops(@Query() query: any) {
    return this.adminService.getTopShops(query.dateRange, parseInt(query.limit) || 10);
  }

  @Get('analytics/top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Top products' })
  async getTopProducts(@Query() query: any) {
    return this.adminService.getTopProducts(query.dateRange, parseInt(query.limit) || 10);
  }

  @Get('analytics/top-customers')
  @ApiOperation({ summary: 'Get top spending customers' })
  @ApiQuery({ name: 'dateRange', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Top customers' })
  async getTopCustomers(@Query() query: any) {
    return this.adminService.getTopCustomers(query.dateRange, parseInt(query.limit) || 10);
  }

  // ============================================
  // SETTINGS
  // ============================================

  @Get('settings')
  @ApiOperation({ summary: 'Get global platform settings' })
  @ApiResponse({ status: 200, description: 'Platform settings' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update global platform settings' })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(@Body() settings: any) {
    return this.adminService.updateSettings(settings);
  }

  @Post('settings/logo')
  @ApiOperation({ summary: 'Upload platform logo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadLogo(file);
  }

  @Post('settings/favicon')
  @ApiOperation({ summary: 'Upload platform favicon' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Favicon uploaded successfully' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFavicon(@UploadedFile() file: Express.Multer.File) {
    return this.adminService.uploadFavicon(file);
  }

  // ============================================
  // REPORTS
  // ============================================

  @Get('reports/sales')
  @ApiOperation({ summary: 'Generate sales report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Sales report data' })
  async getSalesReport(@Query() query: any) {
    return this.adminService.generateSalesReport({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get('reports/users')
  @ApiOperation({ summary: 'Generate users report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Users report data' })
  async getUsersReport(@Query() query: any) {
    return this.adminService.generateUsersReport({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get('reports/shops')
  @ApiOperation({ summary: 'Generate shops report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Shops report data' })
  async getShopsReport(@Query() query: any) {
    return this.adminService.generateShopsReport({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get('reports/products')
  @ApiOperation({ summary: 'Generate products report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Products report data' })
  async getProductsReport(@Query() query: any) {
    return this.adminService.generateProductsReport({
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  // Debug endpoint - remove in production
  @Get('test')
  @ApiOperation({ summary: 'Test admin endpoint' })
  async testEndpoint() {
    return { message: 'Admin module is working', timestamp: new Date().toISOString() };
  }
}
