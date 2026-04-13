import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegisterWebhookDto } from './dto/webhooks.dto';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Register a new webhook endpoint' })
  @ApiResponse({ status: 201, description: 'Webhook registered successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async register(@Body() dto: RegisterWebhookDto, @Request() req: any) {
    const vendorId = req.user?.userId || req.user?.id;
    return this.webhooksService.registerWebhook(vendorId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List my webhooks' })
  @ApiResponse({ status: 200, description: 'Webhooks returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async list(@Request() req: any) {
    const vendorId = req.user?.userId || req.user?.id;
    return this.webhooksService.listWebhooks(vendorId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiResponse({ status: 200, description: 'Webhook deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const vendorId = req.user?.userId || req.user?.id;
    await this.webhooksService.deleteWebhook(vendorId, id);
    return { success: true, message: 'Webhook deleted' };
  }

  @Get(':id/deliveries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'Webhook ID' })
  @ApiOperation({ summary: 'Get delivery log for a webhook' })
  @ApiResponse({ status: 200, description: 'Delivery logs returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async deliveries(@Param('id') id: string, @Request() req: any) {
    const vendorId = req.user?.userId || req.user?.id;
    return this.webhooksService.getDeliveries(vendorId, id);
  }
}
