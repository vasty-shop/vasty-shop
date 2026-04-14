import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
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
import { ReturnsService } from './returns.service';
import {
  CreateReturnRequestDto,
  RejectReturnDto,
  ReceiveReturnDto,
  GetReturnsDto,
  ReturnResponseDto,
} from './dto/returns.dto';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  // ============================================
  // BUYER ENDPOINTS
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a return' })
  @ApiResponse({ status: 201, description: 'Return request created', type: ReturnResponseDto })
  async requestReturn(@Req() req: any, @Body() dto: CreateReturnRequestDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.returnsService.requestReturn(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my returns' })
  @ApiResponse({ status: 200, description: 'List of return requests', type: [ReturnResponseDto] })
  async getMyReturns(@Req() req: any, @Query() dto: GetReturnsDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.returnsService.getReturnsByUser(userId, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get return details' })
  @ApiResponse({ status: 200, description: 'Return request details', type: ReturnResponseDto })
  async getReturnById(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.sub || req.user?.userId;
    return this.returnsService.getReturnById(id, userId);
  }

  // ============================================
  // VENDOR ENDPOINTS
  // ============================================

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a return request (vendor)' })
  @ApiResponse({ status: 200, description: 'Return approved' })
  async approveReturn(@Req() req: any, @Param('id') id: string) {
    const vendorId = req.user?.sub || req.user?.userId;
    return this.returnsService.approveReturn(vendorId, id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a return request (vendor)' })
  @ApiResponse({ status: 200, description: 'Return rejected' })
  async rejectReturn(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RejectReturnDto,
  ) {
    const vendorId = req.user?.sub || req.user?.userId;
    return this.returnsService.rejectReturn(vendorId, id, dto);
  }

  @Patch(':id/receive')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark return as received + assess condition (vendor)' })
  @ApiResponse({ status: 200, description: 'Return received' })
  async receiveReturn(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: ReceiveReturnDto,
  ) {
    const vendorId = req.user?.sub || req.user?.userId;
    return this.returnsService.receiveReturn(vendorId, id, dto);
  }

  @Patch(':id/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process refund for a received return (vendor)' })
  @ApiResponse({ status: 200, description: 'Refund processed' })
  async processRefund(@Req() req: any, @Param('id') id: string) {
    const vendorId = req.user?.sub || req.user?.userId;
    return this.returnsService.processRefund(vendorId, id);
  }
}

@ApiTags('Vendor Returns')
@Controller('vendor/returns')
export class VendorReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List vendor's return requests" })
  @ApiResponse({ status: 200, description: 'List of return requests', type: [ReturnResponseDto] })
  async getVendorReturns(@Req() req: any, @Query() dto: GetReturnsDto) {
    const vendorId = req.user?.sub || req.user?.userId;
    return this.returnsService.getReturnsByVendor(vendorId, dto);
  }
}
