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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ScheduleService } from './schedule.service';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  UpdateDayScheduleDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  CreateTemporaryClosureDto,
  CheckAvailabilityDto,
  GetAvailableSlotsDto,
  ScheduleResponseDto,
  HolidayResponseDto,
  AvailabilityResponseDto,
  TimeSlotResponseDto,
} from './dto/schedule.dto';

@ApiTags('Store Schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('shop/:shopId')
  @ApiOperation({ summary: 'Get shop schedule' })
  @ApiResponse({ status: 200, description: 'Shop schedule', type: ScheduleResponseDto })
  async getSchedule(@Param('shopId') shopId: string) {
    return this.scheduleService.getSchedule(shopId);
  }

  @Post('check-availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if shop is open' })
  @ApiResponse({ status: 200, description: 'Availability status', type: AvailabilityResponseDto })
  async checkAvailability(@Body() dto: CheckAvailabilityDto) {
    return this.scheduleService.checkAvailability(dto);
  }

  @Post('available-slots')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get available time slots for a date' })
  @ApiResponse({ status: 200, description: 'Available slots', type: [TimeSlotResponseDto] })
  async getAvailableSlots(@Body() dto: GetAvailableSlotsDto) {
    return this.scheduleService.getAvailableSlots(dto);
  }

  @Get('shop/:shopId/holidays')
  @ApiOperation({ summary: 'Get shop holidays' })
  @ApiResponse({ status: 200, description: 'Holiday list', type: [HolidayResponseDto] })
  async getHolidays(
    @Param('shopId') shopId: string,
    @Query('year') year?: string,
  ) {
    return this.scheduleService.getHolidays(shopId, year ? parseInt(year) : undefined);
  }

  @Get('shop/:shopId/holidays/upcoming')
  @ApiOperation({ summary: 'Get upcoming holidays' })
  @ApiResponse({ status: 200, description: 'Upcoming holidays', type: [HolidayResponseDto] })
  async getUpcomingHolidays(
    @Param('shopId') shopId: string,
    @Query('days') days?: string,
  ) {
    return this.scheduleService.getUpcomingHolidays(shopId, days ? parseInt(days) : 30);
  }

  // ============================================
  // VENDOR - SCHEDULE MANAGEMENT
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update shop schedule (Vendor)' })
  @ApiResponse({ status: 200, description: 'Schedule saved', type: ScheduleResponseDto })
  async setSchedule(@Body() dto: CreateScheduleDto) {
    return this.scheduleService.setSchedule(dto);
  }

  @Put('shop/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update schedule settings (Vendor)' })
  @ApiResponse({ status: 200, description: 'Schedule updated', type: ScheduleResponseDto })
  async updateSchedule(@Param('shopId') shopId: string, @Body() dto: UpdateScheduleDto) {
    return this.scheduleService.updateSchedule(shopId, dto);
  }

  @Put('shop/:shopId/day')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update single day schedule (Vendor)' })
  @ApiResponse({ status: 200, description: 'Day updated', type: ScheduleResponseDto })
  async updateDaySchedule(@Param('shopId') shopId: string, @Body() dto: UpdateDayScheduleDto) {
    return this.scheduleService.updateDaySchedule(shopId, dto);
  }

  // ============================================
  // VENDOR - HOLIDAY MANAGEMENT
  // ============================================

  @Post('holidays')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create holiday (Vendor)' })
  @ApiResponse({ status: 201, description: 'Holiday created', type: HolidayResponseDto })
  async createHoliday(@Body() dto: CreateHolidayDto) {
    return this.scheduleService.createHoliday(dto);
  }

  @Put('holidays/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update holiday (Vendor)' })
  @ApiResponse({ status: 200, description: 'Holiday updated', type: HolidayResponseDto })
  async updateHoliday(@Param('id') id: string, @Body() dto: UpdateHolidayDto) {
    return this.scheduleService.updateHoliday(id, dto);
  }

  @Delete('holidays/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete holiday (Vendor)' })
  @ApiResponse({ status: 204, description: 'Holiday deleted' })
  async deleteHoliday(@Param('id') id: string) {
    await this.scheduleService.deleteHoliday(id);
  }

  // ============================================
  // VENDOR - TEMPORARY CLOSURES
  // ============================================

  @Get('shop/:shopId/closures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get temporary closures (Vendor)' })
  @ApiResponse({ status: 200, description: 'Active closures' })
  async getTemporaryClosures(@Param('shopId') shopId: string) {
    return this.scheduleService.getTemporaryClosures(shopId);
  }

  @Post('closures')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create temporary closure (Vendor)' })
  @ApiResponse({ status: 201, description: 'Closure created' })
  async createTemporaryClosure(@Body() dto: CreateTemporaryClosureDto) {
    return this.scheduleService.createTemporaryClosure(dto);
  }

  @Delete('closures/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel temporary closure (Vendor)' })
  @ApiResponse({ status: 204, description: 'Closure cancelled' })
  async cancelTemporaryClosure(@Param('id') id: string) {
    await this.scheduleService.cancelTemporaryClosure(id);
  }
}
