import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';
import {
  DirectCardPaymentDto,
  ConfigurePaymentMethodsDto,
} from './dto/configure-payment-methods.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create Stripe payment intent for order' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createPaymentIntent(
    @Request() req,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    return this.paymentService.createPaymentIntent(
      req.user.userId,
      createPaymentIntentDto,
    );
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm payment after client-side completion' })
  @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto) {
    return this.paymentService.confirmPayment(confirmPaymentDto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler for payment events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentService.handleWebhook(req.rawBody, signature);
  }

  @Post('refund/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process refund for a transaction' })
  @ApiResponse({ status: 200, description: 'Refund processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async processRefund(
    @Param('transactionId') transactionId: string,
    @Body() processRefundDto: ProcessRefundDto,
  ) {
    return this.paymentService.processRefund(
      transactionId,
      processRefundDto.amount,
      processRefundDto.reason,
    );
  }

  @Get('transactions/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all payment transactions for an order' })
  @ApiResponse({ status: 200, description: 'Payment transactions retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No transactions found' })
  async getOrderTransactions(@Param('orderId') orderId: string) {
    return this.paymentService.getOrderTransactions(orderId);
  }

  @Post('direct-card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Process direct card payment' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async processDirectCardPayment(
    @Request() req,
    @Body() directCardPaymentDto: DirectCardPaymentDto,
  ) {
    return this.paymentService.processDirectCardPayment(
      req.user.userId,
      directCardPaymentDto,
    );
  }

  @Put('configure/:shopId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Configure payment methods for a shop' })
  @ApiResponse({ status: 200, description: 'Payment methods configured successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async configurePaymentMethods(
    @Param('shopId') shopId: string,
    @Body() config: ConfigurePaymentMethodsDto,
  ) {
    return this.paymentService.configurePaymentMethods(shopId, config);
  }

  @Get('config/:shopId')
  @ApiOperation({ summary: 'Get configured payment methods for a shop' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved' })
  @ApiResponse({ status: 404, description: 'Shop not found' })
  async getShopPaymentMethods(@Param('shopId') shopId: string) {
    return this.paymentService.getShopPaymentMethods(shopId);
  }

  @Get('methods')
  @ApiOperation({ summary: 'Get available payment methods for shop (uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Payment methods retrieved' })
  async getAvailablePaymentMethods(@Request() req) {
    const shopId = req.headers['x-shop-id'];
    if (shopId) {
      return this.paymentService.getShopPaymentMethods(shopId);
    }
    // Default payment methods if no shop context
    return {
      card: { enabled: true },
      paypal: { enabled: true },
      applepay: { enabled: true },
      googlepay: { enabled: true },
    };
  }

  @Get('transaction/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('id') id: string) {
    return this.paymentService.getTransaction(id);
  }
}
