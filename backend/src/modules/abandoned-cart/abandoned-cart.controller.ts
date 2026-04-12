import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AbandonedCartService } from './abandoned-cart.service';

@ApiTags('Abandoned Cart Recovery')
@Controller('admin/analytics/abandoned-carts')
export class AbandonedCartController {
  constructor(private readonly abandonedCartService: AbandonedCartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get abandoned cart analytics',
    description:
      'Returns stats on total abandoned carts, recovery rate, revenue recovered, and recent abandoned carts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Abandoned cart analytics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAnalytics() {
    return this.abandonedCartService.getAnalytics();
  }

  @Get('verify-recovery-link')
  @ApiOperation({
    summary: 'Verify a cart recovery link signature',
    description: 'Validates the HMAC signature and expiry of a recovery link.',
  })
  @ApiQuery({ name: 'cartId', required: true })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'expires', required: true })
  @ApiQuery({ name: 'sig', required: true })
  @ApiResponse({ status: 200, description: 'Link validity result' })
  async verifyRecoveryLink(
    @Query('cartId') cartId: string,
    @Query('userId') userId: string,
    @Query('expires') expires: string,
    @Query('sig') sig: string,
  ) {
    if (!cartId || !userId || !expires || !sig) {
      throw new BadRequestException('Missing required query parameters');
    }

    const expiresNum = parseInt(expires, 10);
    if (isNaN(expiresNum)) {
      throw new BadRequestException('Invalid expires parameter');
    }

    const valid = this.abandonedCartService.verifyRecoveryLink(
      cartId,
      userId,
      expiresNum,
      sig,
    );

    return { valid, cartId, userId };
  }

  @Post('trigger-scan')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Manually trigger an abandoned cart scan',
    description: 'Runs the abandoned cart detection and email sequence processing immediately.',
  })
  @ApiResponse({ status: 200, description: 'Scan triggered' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async triggerScan() {
    await this.abandonedCartService.scanForAbandonedCarts();
    return { message: 'Abandoned cart scan completed' };
  }
}
