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
import { EmailTemplateService } from './email-template.service';
import {
  EmailTemplateType,
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  SendEmailDto,
  SendBulkEmailDto,
  PreviewEmailDto,
  GetEmailLogsDto,
  EmailTemplateResponseDto,
  EmailLogResponseDto,
  EmailStatsResponseDto,
} from './dto/email-template.dto';

@ApiTags('Email Templates')
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  // ============================================
  // TEMPLATE MANAGEMENT (Admin)
  // ============================================

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all email templates' })
  @ApiResponse({ status: 200, description: 'List of templates', type: [EmailTemplateResponseDto] })
  async getTemplates(@Query('includeInactive') includeInactive?: string) {
    // TODO: Add admin role check
    return this.emailTemplateService.getTemplates(includeInactive === 'true');
  }

  @Get('types')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available template types' })
  @ApiResponse({ status: 200, description: 'List of template types' })
  async getTemplateTypes() {
    return Object.values(EmailTemplateType).map((type) => ({
      value: type,
      label: type
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
    }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiResponse({ status: 200, description: 'Template details', type: EmailTemplateResponseDto })
  async getTemplate(@Param('id') id: string) {
    return this.emailTemplateService.getTemplate(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create email template' })
  @ApiResponse({ status: 201, description: 'Template created', type: EmailTemplateResponseDto })
  async createTemplate(@Body() dto: CreateEmailTemplateDto) {
    // TODO: Add admin role check
    return this.emailTemplateService.createTemplate(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update email template' })
  @ApiResponse({ status: 200, description: 'Template updated', type: EmailTemplateResponseDto })
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    // TODO: Add admin role check
    return this.emailTemplateService.updateTemplate(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete email template' })
  @ApiResponse({ status: 204, description: 'Template deleted' })
  async deleteTemplate(@Param('id') id: string) {
    // TODO: Add admin role check
    await this.emailTemplateService.deleteTemplate(id);
  }

  // ============================================
  // EMAIL SENDING
  // ============================================

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send email using template' })
  @ApiResponse({ status: 200, description: 'Email sent' })
  async sendEmail(@Body() dto: SendEmailDto) {
    // TODO: Add admin role check
    return this.emailTemplateService.sendEmail(dto);
  }

  @Post('send-bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send bulk emails' })
  @ApiResponse({ status: 200, description: 'Bulk email results' })
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    // TODO: Add admin role check
    return this.emailTemplateService.sendBulkEmail(dto);
  }

  @Post('preview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Preview email without sending' })
  @ApiResponse({ status: 200, description: 'Email preview' })
  async previewEmail(@Body() dto: PreviewEmailDto) {
    return this.emailTemplateService.previewEmail(dto.templateType, dto.variables);
  }

  // ============================================
  // EMAIL LOGS & STATS
  // ============================================

  @Get('logs/list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email logs' })
  @ApiResponse({ status: 200, description: 'Email logs', type: [EmailLogResponseDto] })
  async getEmailLogs(@Query() dto: GetEmailLogsDto) {
    // TODO: Add admin role check
    return this.emailTemplateService.getEmailLogs(dto);
  }

  @Get('logs/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get email statistics' })
  @ApiResponse({ status: 200, description: 'Email stats', type: EmailStatsResponseDto })
  async getEmailStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // TODO: Add admin role check
    return this.emailTemplateService.getEmailStats(startDate, endDate);
  }

  // ============================================
  // WEBHOOK HANDLERS (Internal)
  // ============================================

  @Post('webhook/open/:emailId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track email open (webhook)' })
  async trackOpen(@Param('emailId') emailId: string) {
    await this.emailTemplateService.trackEmailOpen(emailId);
    return { success: true };
  }

  @Post('webhook/click/:emailId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track email click (webhook)' })
  async trackClick(@Param('emailId') emailId: string) {
    await this.emailTemplateService.trackEmailClick(emailId);
    return { success: true };
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  @Post('initialize-defaults')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize default email templates' })
  @ApiResponse({ status: 200, description: 'Templates initialized' })
  async initializeDefaults() {
    // TODO: Add admin role check
    await this.emailTemplateService.initializeDefaultTemplates();
    return { success: true, message: 'Default templates initialized' };
  }
}
