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
import { SmsService } from './sms.service';
import {
  ConfigureSmsDto,
  UpdateSmsSettingsDto,
  CreateSmsTemplateDto,
  UpdateSmsTemplateDto,
  SendSmsDto,
  SendBulkSmsDto,
  SendOtpDto,
  VerifyOtpDto,
  GetSmsLogsDto,
  SmsConfigResponseDto,
  SmsTemplateResponseDto,
  SmsLogResponseDto,
  SmsStatsResponseDto,
  SmsStatus,
} from './dto/sms.dto';

@ApiTags('SMS')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  // ============================================
  // CONFIG ENDPOINTS (Admin)
  // ============================================

  @Get('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SMS configuration' })
  @ApiResponse({ status: 200, description: 'SMS config', type: SmsConfigResponseDto })
  async getConfig() {
    // TODO: Add admin role check
    return this.smsService.getConfig();
  }

  @Post('config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Configure SMS provider (Admin)' })
  @ApiResponse({ status: 200, description: 'Provider configured', type: SmsConfigResponseDto })
  async configureProvider(@Body() dto: ConfigureSmsDto) {
    // TODO: Add admin role check
    return this.smsService.configureProvider(dto);
  }

  @Put('config/settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update SMS settings (Admin)' })
  @ApiResponse({ status: 200, description: 'Settings updated', type: SmsConfigResponseDto })
  async updateSettings(@Body() dto: UpdateSmsSettingsDto) {
    // TODO: Add admin role check
    return this.smsService.updateSettings(dto);
  }

  // ============================================
  // TEMPLATE ENDPOINTS (Admin)
  // ============================================

  @Get('templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all SMS templates' })
  @ApiResponse({ status: 200, description: 'Templates list', type: [SmsTemplateResponseDto] })
  async getTemplates(@Query('includeInactive') includeInactive?: string) {
    return this.smsService.getTemplates(includeInactive === 'true');
  }

  @Post('templates')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create SMS template (Admin)' })
  @ApiResponse({ status: 201, description: 'Template created', type: SmsTemplateResponseDto })
  async createTemplate(@Body() dto: CreateSmsTemplateDto) {
    // TODO: Add admin role check
    return this.smsService.createTemplate(dto);
  }

  @Put('templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update SMS template (Admin)' })
  @ApiResponse({ status: 200, description: 'Template updated', type: SmsTemplateResponseDto })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateSmsTemplateDto) {
    // TODO: Add admin role check
    return this.smsService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete SMS template (Admin)' })
  @ApiResponse({ status: 204, description: 'Template deleted' })
  async deleteTemplate(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.smsService.deleteTemplate(id);
  }

  // ============================================
  // SEND ENDPOINTS
  // ============================================

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send SMS using template' })
  @ApiResponse({ status: 200, description: 'SMS sent' })
  async sendSms(@Body() dto: SendSmsDto) {
    return this.smsService.sendSms(dto);
  }

  @Post('send-bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send bulk SMS (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk send results' })
  async sendBulkSms(@Body() dto: SendBulkSmsDto) {
    // TODO: Add admin role check
    return this.smsService.sendBulkSms(dto);
  }

  // ============================================
  // OTP ENDPOINTS
  // ============================================

  @Post('otp/send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send OTP to phone number' })
  @ApiResponse({ status: 200, description: 'OTP sent' })
  async sendOtp(@Body() dto: SendOtpDto) {
    return this.smsService.sendOtp(dto.phoneNumber, dto.purpose);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP' })
  @ApiResponse({ status: 200, description: 'OTP verification result' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.smsService.verifyOtp(dto.phoneNumber, dto.otp);
  }

  // ============================================
  // LOGS & STATS (Admin)
  // ============================================

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SMS logs (Admin)' })
  @ApiResponse({ status: 200, description: 'SMS logs', type: [SmsLogResponseDto] })
  async getLogs(@Query() dto: GetSmsLogsDto) {
    // TODO: Add admin role check
    return this.smsService.getLogs(dto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SMS statistics (Admin)' })
  @ApiResponse({ status: 200, description: 'SMS stats', type: SmsStatsResponseDto })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Add admin role check
    return this.smsService.getStats(startDate, endDate);
  }

  // ============================================
  // WEBHOOK (Provider callbacks)
  // ============================================

  @Post('webhook/delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'SMS delivery status webhook' })
  async deliveryWebhook(
    @Body() body: { messageId: string; status: string },
  ) {
    const status = body.status === 'delivered' ? SmsStatus.DELIVERED :
                   body.status === 'failed' ? SmsStatus.FAILED : SmsStatus.SENT;
    await this.smsService.updateDeliveryStatus(body.messageId, status);
    return { success: true };
  }
}
