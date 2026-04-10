import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DeliveryManService } from './delivery-man.service';
import { StripeConnectService } from '../payment/stripe-connect.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import {
  RegisterDeliveryManDto,
  UpdateDeliveryManDto,
  UpdateDeliveryManStatusDto,
  UpdateAvailabilityDto,
  UpdateLocationDto,
  AssignOrderDto,
  AcceptOrderDto,
  RejectOrderDto,
  CompleteDeliveryDto,
  ConfigureDeliveryManSettingsDto,
  DeliveryManReviewDto,
  WithdrawEarningsDto,
  QueryDeliveryMenDto,
} from './dto/delivery-man.dto';

@ApiTags('delivery-man')
@Controller('delivery-man')
export class DeliveryManController {
  constructor(
    private readonly deliveryManService: DeliveryManService,
    @Optional() private readonly stripeConnectService?: StripeConnectService,
  ) {}

  // ============================================
  // REGISTRATION & MANAGEMENT
  // ============================================

  @Post('register')
  @ApiOperation({ summary: 'Register as a delivery man' })
  @ApiResponse({ status: 201, description: 'Registration submitted' })
  async register(@Body() dto: RegisterDeliveryManDto) {
    return this.deliveryManService.register(dto);
  }

  @Post('register/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register delivery man (admin)' })
  @ApiResponse({ status: 201, description: 'Delivery man created' })
  async registerByAdmin(@Body() dto: RegisterDeliveryManDto) {
    return this.deliveryManService.register(dto);
  }

  @Post('sync-from-auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync delivery men from vasty auth users with delivery_man role' })
  @ApiResponse({ status: 200, description: 'Delivery men synced' })
  async syncFromAuth() {
    return this.deliveryManService.syncDeliveryMenFromAuth();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all delivery men' })
  @ApiResponse({ status: 200, description: 'List of delivery men' })
  async findAll(@Query() query: QueryDeliveryMenDto) {
    return this.deliveryManService.findAll(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get my delivery man profile' })
  @ApiResponse({ status: 200, description: 'Delivery man profile' })
  async getMyProfile(@Request() req) {
    // Find delivery man by user ID
    const userId = req.user.sub || req.user.userId;
    const user = req.user;
    // Get the actual user data (may be nested in user.user from database auth)
    const userData = user.user || user;
    const userEmail = userData.email || user.email;

    console.log('[DeliveryMan] getMyProfile called for userId:', userId, 'email:', userEmail);

    // Try to find existing profile by user_id first
    let profile = await this.deliveryManService.findByUserId(userId);
    console.log('[DeliveryMan] Found profile by userId:', profile ? 'yes' : 'no');

    // If not found by userId, try finding by email (fallback for vendor-created accounts)
    if (!profile && userEmail) {
      profile = await this.deliveryManService.findByEmail(userEmail);
      console.log('[DeliveryMan] Found profile by email:', profile ? 'yes' : 'no');

      // If found by email, update the user_id to link the accounts
      if (profile && !profile.userId) {
        console.log('[DeliveryMan] Linking delivery man to user:', userId);
        await this.deliveryManService.linkToUser(profile.id, userId);
        profile.userId = userId;
      }
    }

    if (profile) {
      return { data: profile };
    }

    // If user has delivery_man role but no profile, auto-create one
    // Role is stored directly in user.role
    const userRole = userData.role || user.role;
    console.log('[DeliveryMan] User role:', userRole);

    if (userRole === 'delivery_man') {
      console.log('[DeliveryMan] Auto-creating profile for delivery_man role');
      const newProfile = await this.deliveryManService.register({
        name: userData.fullName || userData.name || userEmail?.split('@')[0] || 'Delivery Partner',
        email: userEmail,
        phone: userData.phone || '',
      }, userId);
      return newProfile;
    }

    console.log('[DeliveryMan] Not a delivery_man, returning null');
    return { data: null, message: 'Not registered as delivery man' };
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby delivery men' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  @ApiQuery({ name: 'radius', required: false })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiResponse({ status: 200, description: 'Nearby delivery men' })
  async findNearby(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius?: number,
    @Query('zoneId') zoneId?: string,
  ) {
    return this.deliveryManService.findNearby(
      Number(lat),
      Number(lng),
      radius ? Number(radius) : 5,
      zoneId,
    );
  }

  @Get('dispatch-overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get dispatch overview (admin)' })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiResponse({ status: 200, description: 'Dispatch overview' })
  async getDispatchOverview(@Query('zoneId') zoneId?: string) {
    return this.deliveryManService.getDispatchOverview(zoneId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get delivery man by ID' })
  @ApiResponse({ status: 200, description: 'Delivery man details' })
  async findById(@Param('id') id: string) {
    return this.deliveryManService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update delivery man profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryManDto,
    @Request() req,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.deliveryManService.update(id, dto, userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update delivery man status (admin)' })
  @ApiResponse({ status: 200, description: 'Status updated' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateDeliveryManStatusDto,
  ) {
    return this.deliveryManService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete delivery man (admin)' })
  @ApiResponse({ status: 200, description: 'Deleted successfully' })
  async delete(@Param('id') id: string) {
    return this.deliveryManService.delete(id);
  }

  // ============================================
  // AVAILABILITY & LOCATION
  // ============================================

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update availability status' })
  @ApiResponse({ status: 200, description: 'Availability updated' })
  async updateAvailability(
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.deliveryManService.updateAvailability(id, dto);
  }

  @Patch(':id/location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current location' })
  @ApiResponse({ status: 200, description: 'Location updated' })
  async updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.deliveryManService.updateLocation(id, dto);
  }

  // ============================================
  // ORDER MANAGEMENT
  // ============================================

  @Post('assign-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Assign order to delivery man' })
  @ApiResponse({ status: 200, description: 'Order assigned' })
  async assignOrder(@Body() dto: AssignOrderDto) {
    // Any authenticated user can assign if they own the shop (verified in service)
    return this.deliveryManService.assignOrder(dto);
  }

  @Post(':id/accept-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Accept order assignment' })
  @ApiResponse({ status: 200, description: 'Order accepted' })
  async acceptOrder(@Param('id') id: string, @Body() dto: AcceptOrderDto) {
    return this.deliveryManService.acceptOrder(id, dto);
  }

  @Post(':id/reject-order')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject order assignment' })
  @ApiResponse({ status: 200, description: 'Order rejected' })
  async rejectOrder(@Param('id') id: string, @Body() dto: RejectOrderDto) {
    return this.deliveryManService.rejectOrder(id, dto);
  }

  @Patch(':id/order/:orderId/picked-up')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark order as picked up' })
  @ApiResponse({ status: 200, description: 'Order marked as picked up' })
  async markPickedUp(@Param('id') id: string, @Param('orderId') orderId: string) {
    return this.deliveryManService.markPickedUp(id, orderId);
  }

  @Patch(':id/order/:orderId/on-the-way')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Mark order as on the way' })
  @ApiResponse({ status: 200, description: 'Order marked as on the way' })
  async markOnTheWay(@Param('id') id: string, @Param('orderId') orderId: string) {
    return this.deliveryManService.markOnTheWay(id, orderId);
  }

  @Post(':id/complete-delivery')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Complete delivery' })
  @ApiResponse({ status: 200, description: 'Delivery completed' })
  async completeDelivery(@Param('id') id: string, @Body() dto: CompleteDeliveryDto) {
    return this.deliveryManService.completeDelivery(id, dto);
  }

  @Get(':id/orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get assigned orders' })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'Assigned orders' })
  async getMyOrders(@Param('id') id: string, @Query('status') status?: string) {
    return this.deliveryManService.getMyOrders(id, status);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get delivery history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Delivery history' })
  async getDeliveryHistory(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deliveryManService.getDeliveryHistory(
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  // ============================================
  // EARNINGS & WITHDRAWALS
  // ============================================

  @Get(':id/earnings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get earnings summary' })
  @ApiQuery({ name: 'period', required: false, enum: ['today', 'week', 'month', 'all'] })
  @ApiResponse({ status: 200, description: 'Earnings summary' })
  async getEarnings(@Param('id') id: string, @Query('period') period?: string) {
    return this.deliveryManService.getEarnings(id, period);
  }

  @Post(':id/sync-earnings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sync/recalculate earnings from completed deliveries' })
  @ApiResponse({ status: 200, description: 'Earnings synced' })
  async syncEarnings(@Param('id') id: string) {
    return this.deliveryManService.syncEarnings(id);
  }

  @Post(':id/withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Request withdrawal' })
  @ApiResponse({ status: 200, description: 'Withdrawal requested' })
  async requestWithdrawal(@Param('id') id: string, @Body() dto: WithdrawEarningsDto) {
    return this.deliveryManService.requestWithdrawal(id, dto);
  }

  // ============================================
  // REVIEWS
  // ============================================

  @Post('review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add review for delivery man' })
  @ApiResponse({ status: 201, description: 'Review submitted' })
  async addReview(@Body() dto: DeliveryManReviewDto, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.deliveryManService.addReview(dto, userId);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews for delivery man' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Reviews' })
  async getReviews(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deliveryManService.getReviews(
      id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  // ============================================
  // SETTINGS
  // ============================================

  @Get('settings/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get delivery man settings' })
  @ApiResponse({ status: 200, description: 'Settings' })
  async getSettings() {
    const settings = await this.deliveryManService.getSettings();
    return { data: settings };
  }

  @Put('settings/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update delivery man settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  async updateSettings(@Body() dto: ConfigureDeliveryManSettingsDto) {
    return this.deliveryManService.updateSettings(dto);
  }

  // ============================================
  // PREFERRED ZONES
  // ============================================

  @Get(':id/zones')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get preferred zones for delivery man' })
  @ApiResponse({ status: 200, description: 'Preferred zones' })
  async getPreferredZones(@Param('id') id: string) {
    return this.deliveryManService.getPreferredZones(id);
  }

  @Patch(':id/zones')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update preferred zones for delivery man' })
  @ApiResponse({ status: 200, description: 'Preferred zones updated' })
  async updatePreferredZones(
    @Param('id') id: string,
    @Body() body: { zoneIds: string[] },
  ) {
    return this.deliveryManService.updatePreferredZones(id, body.zoneIds || []);
  }

  // ============================================
  // STRIPE CONNECT - WITHDRAWAL VIA STRIPE
  // ============================================

  @Post(':id/stripe-connect/account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Stripe Connect account for delivery man' })
  @ApiResponse({ status: 201, description: 'Stripe Connect account created' })
  async createStripeConnectAccount(
    @Param('id') id: string,
    @Body() body: { country: string; businessName?: string; email?: string },
    @Headers('x-return-url') returnUrl?: string,
  ) {
    if (!this.stripeConnectService) {
      return { error: 'Stripe Connect is not configured' };
    }
    const baseUrl = returnUrl || 'http://localhost:5186';
    const result = await this.stripeConnectService.createDeliveryManConnectAccount(
      id,
      { country: body.country, businessName: body.businessName, email: body.email },
      `${baseUrl}/delivery/${id}/earnings`,
    );
    return { data: result };
  }

  @Get(':id/stripe-connect/onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Stripe onboarding link for delivery man' })
  @ApiResponse({ status: 200, description: 'Onboarding URL' })
  async getStripeOnboardingLink(
    @Param('id') id: string,
    @Headers('x-return-url') returnUrl?: string,
  ) {
    if (!this.stripeConnectService) {
      return { error: 'Stripe Connect is not configured' };
    }
    const baseUrl = returnUrl || 'http://localhost:5186';
    const result = await this.stripeConnectService.getDeliveryManOnboardingLink(
      id,
      `${baseUrl}/delivery/${id}/earnings`,
    );
    return { data: result };
  }

  @Get(':id/stripe-connect/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Stripe Connect account status for delivery man' })
  @ApiResponse({ status: 200, description: 'Account status' })
  async getStripeAccountStatus(@Param('id') id: string) {
    if (!this.stripeConnectService) {
      return {
        data: {
          accountId: null,
          onboardingComplete: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          requirements: null,
          currentDeadline: null,
        },
      };
    }
    const result = await this.stripeConnectService.getDeliveryManAccountStatus(id);
    return { data: result };
  }

  @Get(':id/stripe-connect/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Stripe Express Dashboard link for delivery man' })
  @ApiResponse({ status: 200, description: 'Dashboard URL' })
  async getStripeDashboardLink(@Param('id') id: string) {
    if (!this.stripeConnectService) {
      return { error: 'Stripe Connect is not configured' };
    }
    const result = await this.stripeConnectService.getDeliveryManDashboardLink(id);
    return { data: result };
  }

  @Delete(':id/stripe-connect/account')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Disconnect Stripe account from delivery man' })
  @ApiResponse({ status: 200, description: 'Account disconnected' })
  async disconnectStripeAccount(@Param('id') id: string) {
    if (!this.stripeConnectService) {
      return { error: 'Stripe Connect is not configured' };
    }
    const result = await this.stripeConnectService.disconnectDeliveryManAccount(id);
    return { data: result };
  }

  @Get(':id/stripe-connect/balance')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Stripe balance for delivery man' })
  @ApiResponse({ status: 200, description: 'Balance details' })
  async getStripeBalance(@Param('id') id: string) {
    if (!this.stripeConnectService) {
      return { data: { available: 0, pending: 0, currency: 'USD' } };
    }
    try {
      const result = await this.stripeConnectService.getDeliveryManBalance(id);
      return { data: result };
    } catch {
      return { data: { available: 0, pending: 0, currency: 'USD' } };
    }
  }

  @Get(':id/stripe-connect/transfers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get Stripe transfers for delivery man' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Transfer history' })
  async getStripeTransfers(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    if (!this.stripeConnectService) {
      return { data: [] };
    }
    const result = await this.stripeConnectService.getDeliveryManTransfers(
      id,
      limit ? Number(limit) : 20,
    );
    return { data: result };
  }

  @Post(':id/stripe-connect/payout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Initiate payout to delivery man Stripe account' })
  @ApiResponse({ status: 200, description: 'Payout initiated' })
  async initiateStripePayout(
    @Param('id') id: string,
    @Body() body: { amount: number; currency?: string; description?: string },
  ) {
    if (!this.stripeConnectService) {
      return { error: 'Stripe Connect is not configured' };
    }
    const result = await this.stripeConnectService.initiateDeliveryManPayout(
      id,
      body.amount,
      body.currency || 'USD',
      body.description,
    );
    return { data: result };
  }

  @Get('stripe-connect/supported-countries')
  @ApiOperation({ summary: 'Get supported countries for Stripe Connect' })
  @ApiResponse({ status: 200, description: 'List of supported countries' })
  getSupportedCountries() {
    if (!this.stripeConnectService) {
      return { data: [] };
    }
    return { data: this.stripeConnectService.getSupportedCountries() };
  }
}
