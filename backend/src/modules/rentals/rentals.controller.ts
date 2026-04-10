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
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';
import { RentalsService } from './rentals.service';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleFilterDto,
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  ExtendBookingDto,
  BookingFilterDto,
  StartTripDto,
  EndTripDto,
  UpdateTripLocationDto,
  CreateAddonDto,
  UpdateAddonDto,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CalculateRentalPriceDto,
  SetDynamicPricingDto,
  CreateRentalReviewDto,
  ProviderDashboardDto,
  ProviderEarningsDto,
  SetAvailabilityDto,
  CheckAvailabilityDto,
  RentalStatus,
} from './dto/rentals.dto';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('vehicles')
  async getVehicles(@Query() dto: VehicleFilterDto) {
    return this.rentalsService.getVehicles(dto);
  }

  @Get('vehicles/:id')
  async getVehicle(@Param('id') id: string) {
    return this.rentalsService.getVehicle(id);
  }

  @Get('vehicles/:id/reviews')
  async getVehicleReviews(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rentalsService.getVehicleReviews(
      id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20
    );
  }

  @Get('vehicles/:id/calendar')
  async getVehicleCalendar(
    @Param('id') id: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.rentalsService.getVehicleCalendar(
      id,
      parseInt(month),
      parseInt(year)
    );
  }

  @Post('calculate-price')
  async calculatePrice(@Body() dto: CalculateRentalPriceDto) {
    return this.rentalsService.calculateRentalPrice(dto);
  }

  @Post('check-availability')
  async checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.rentalsService.checkAvailability(dto);
  }

  @Get('addons')
  async getAddons(@Query('shopId') shopId?: string) {
    return this.rentalsService.getAddons(shopId);
  }

  // ============================================
  // VEHICLE MANAGEMENT (Provider/Admin)
  // ============================================

  @Post('vehicles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createVehicle(@Body() dto: CreateVehicleDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.createVehicle(dto, userId);
  }

  @Put('vehicles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateVehicle(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.rentalsService.updateVehicle(id, dto);
  }

  @Delete('vehicles/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteVehicle(@Param('id') id: string) {
    return this.rentalsService.deleteVehicle(id);
  }

  @Patch('vehicles/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateVehicleStatus(
    @Param('id') id: string,
    @Body('status') status: RentalStatus,
  ) {
    return this.rentalsService.updateVehicleStatus(id, status);
  }

  // ============================================
  // BOOKING ENDPOINTS
  // ============================================

  @Post('bookings')
  @UseGuards(JwtAuthGuard)
  async createBooking(@Body() dto: CreateBookingDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.createBooking(dto, userId);
  }

  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  async getBookings(@Query() dto: BookingFilterDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.rentalsService.getBookings(dto, userId, isAdmin);
  }

  @Get('bookings/my')
  @UseGuards(JwtAuthGuard)
  async getMyBookings(@Query() dto: BookingFilterDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.getBookings(dto, userId, false);
  }

  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  async getBooking(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.rentalsService.getBooking(id, isAdmin ? undefined : userId);
  }

  @Put('bookings/:id')
  @UseGuards(JwtAuthGuard)
  async updateBooking(
    @Param('id') id: string,
    @Body() dto: UpdateBookingDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.rentalsService.updateBooking(id, dto, isAdmin ? undefined : userId);
  }

  @Patch('bookings/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateBookingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.rentalsService.updateBookingStatus(id, dto);
  }

  @Post('bookings/:id/extend')
  @UseGuards(JwtAuthGuard)
  async extendBooking(
    @Param('id') id: string,
    @Body() dto: ExtendBookingDto,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.extendBooking(id, dto, userId);
  }

  @Post('bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    const isAdmin = req.user.role === 'admin';
    return this.rentalsService.cancelBooking(id, reason, isAdmin ? undefined : userId);
  }

  // ============================================
  // TRIP ENDPOINTS
  // ============================================

  @Post('trips/start')
  @UseGuards(JwtAuthGuard)
  async startTrip(@Body() dto: StartTripDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.startTrip(dto, userId);
  }

  @Post('trips/end')
  @UseGuards(JwtAuthGuard)
  async endTrip(@Body() dto: EndTripDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.endTrip(dto, userId);
  }

  @Post('trips/location')
  @UseGuards(JwtAuthGuard)
  async updateTripLocation(@Body() dto: UpdateTripLocationDto) {
    return this.rentalsService.updateTripLocation(dto);
  }

  @Get('trips/:id/locations')
  @UseGuards(JwtAuthGuard)
  async getTripLocations(@Param('id') id: string) {
    return this.rentalsService.getTripLocations(id);
  }

  // ============================================
  // ADDON ENDPOINTS
  // ============================================

  @Post('addons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createAddon(@Body() dto: CreateAddonDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.createAddon(dto, userId);
  }

  @Put('addons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateAddon(@Param('id') id: string, @Body() dto: UpdateAddonDto) {
    return this.rentalsService.updateAddon(id, dto);
  }

  @Delete('addons/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteAddon(@Param('id') id: string) {
    return this.rentalsService.deleteAddon(id);
  }

  // ============================================
  // MAINTENANCE ENDPOINTS
  // ============================================

  @Post('maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createMaintenance(@Body() dto: CreateMaintenanceDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.createMaintenance(dto, userId);
  }

  @Get('vehicles/:id/maintenance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getMaintenanceRecords(@Param('id') vehicleId: string) {
    return this.rentalsService.getMaintenanceRecords(vehicleId);
  }

  @Put('maintenance/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateMaintenance(
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.rentalsService.updateMaintenance(id, dto);
  }

  // ============================================
  // PRICING ENDPOINTS
  // ============================================

  @Post('vehicles/:id/dynamic-pricing')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async setDynamicPricing(
    @Param('id') vehicleId: string,
    @Body() dto: SetDynamicPricingDto,
  ) {
    return this.rentalsService.setDynamicPricing({ ...dto, vehicleId });
  }

  // ============================================
  // AVAILABILITY ENDPOINTS
  // ============================================

  @Post('vehicles/:id/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async setAvailability(
    @Param('id') vehicleId: string,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.rentalsService.setAvailability({ ...dto, vehicleId });
  }

  // ============================================
  // REVIEW ENDPOINTS
  // ============================================

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  async createReview(@Body() dto: CreateRentalReviewDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.rentalsService.createReview(dto, userId);
  }

  // ============================================
  // PROVIDER DASHBOARD
  // ============================================

  @Get('provider/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getProviderDashboard(
    @Query('shopId') shopId: string,
    @Query() dto: ProviderDashboardDto,
  ) {
    return this.rentalsService.getProviderDashboard(shopId, dto);
  }

  @Get('provider/earnings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async getProviderEarnings(
    @Query('shopId') shopId: string,
    @Query() dto: ProviderEarningsDto,
  ) {
    return this.rentalsService.getProviderEarnings(shopId, dto);
  }

  // ============================================
  // ADMIN ENDPOINTS
  // ============================================

  @Get('admin/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllBookings(@Query() dto: BookingFilterDto) {
    return this.rentalsService.getBookings(dto, undefined, true);
  }

  @Get('admin/vehicles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllVehicles(@Query() dto: VehicleFilterDto) {
    return this.rentalsService.getVehicles(dto);
  }
}
