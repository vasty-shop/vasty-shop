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
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/decorators/roles.decorator';
import { BarcodeService } from './barcode.service';
import {
  GenerateBarcodeDto,
  GenerateQRCodeDto,
  GenerateProductBarcodeDto,
  GenerateOrderQRDto,
  BulkGenerateBarcodeDto,
  ScanBarcodeDto,
  ScanQRCodeDto,
  BatchScanDto,
  AssignBarcodeDto,
  UpdateProductBarcodeDto,
  SearchByBarcodeDto,
  PrintLabelDto,
  BulkPrintLabelsDto,
  CreateLabelTemplateDto,
  UpdateLabelTemplateDto,
  StartInventorySessionDto,
  InventoryScanEntryDto,
  CompleteInventorySessionDto,
  VerifyBarcodeDto,
  ValidateBarcodeFormatDto,
  ScanHistoryFilterDto,
} from './dto/barcode.dto';

@Controller('barcode')
export class BarcodeController {
  constructor(private readonly barcodeService: BarcodeService) {}

  // ============================================
  // BARCODE GENERATION
  // ============================================

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateBarcode(@Body() dto: GenerateBarcodeDto) {
    return this.barcodeService.generateBarcode(dto);
  }

  @Post('generate/qr')
  @UseGuards(JwtAuthGuard)
  async generateQRCode(@Body() dto: GenerateQRCodeDto) {
    return this.barcodeService.generateQRCode(dto);
  }

  @Post('generate/product')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async generateProductBarcode(@Body() dto: GenerateProductBarcodeDto) {
    return this.barcodeService.generateProductBarcode(dto);
  }

  @Post('generate/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async generateOrderQR(@Body() dto: GenerateOrderQRDto) {
    return this.barcodeService.generateOrderQR(dto);
  }

  @Post('generate/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async bulkGenerateBarcodes(@Body() dto: BulkGenerateBarcodeDto) {
    return this.barcodeService.bulkGenerateBarcodes(dto);
  }

  // ============================================
  // BARCODE SCANNING
  // ============================================

  @Post('scan')
  @UseGuards(JwtAuthGuard)
  async scanBarcode(@Body() dto: ScanBarcodeDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.scanBarcode(dto, userId);
  }

  @Post('scan/qr')
  @UseGuards(JwtAuthGuard)
  async scanQRCode(@Body() dto: ScanQRCodeDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.scanQRCode(dto, userId);
  }

  @Post('scan/batch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_STAFF)
  async batchScan(@Body() dto: BatchScanDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.batchScan(dto, userId);
  }

  // ============================================
  // PRODUCT BARCODE MANAGEMENT
  // ============================================

  @Post('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async assignBarcode(@Body() dto: AssignBarcodeDto) {
    return this.barcodeService.assignBarcode(dto);
  }

  @Put('products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async updateProductBarcode(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductBarcodeDto,
  ) {
    return this.barcodeService.updateProductBarcode(productId, dto);
  }

  @Delete('products/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async removeProductBarcode(
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.barcodeService.removeProductBarcode(productId, variantId);
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  async searchByBarcode(@Body() dto: SearchByBarcodeDto) {
    return this.barcodeService.searchByBarcode(dto);
  }

  @Get('products/:productId/barcodes')
  @UseGuards(JwtAuthGuard)
  async getProductBarcodes(@Param('productId') productId: string) {
    return this.barcodeService.getProductBarcodes(productId);
  }

  // ============================================
  // LABEL PRINTING
  // ============================================

  @Post('labels/print')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_STAFF)
  async printLabel(@Body() dto: PrintLabelDto) {
    return this.barcodeService.printLabel(dto);
  }

  @Post('labels/print/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_STAFF)
  async bulkPrintLabels(@Body() dto: BulkPrintLabelsDto) {
    return this.barcodeService.bulkPrintLabels(dto);
  }

  @Post('labels/templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async createLabelTemplate(@Body() dto: CreateLabelTemplateDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.createLabelTemplate(dto, userId);
  }

  @Get('labels/templates')
  @UseGuards(JwtAuthGuard)
  async getLabelTemplates(@Query('shopId') shopId: string) {
    return this.barcodeService.getLabelTemplates(shopId);
  }

  @Put('labels/templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async updateLabelTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateLabelTemplateDto,
  ) {
    return this.barcodeService.updateLabelTemplate(id, dto);
  }

  @Delete('labels/templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async deleteLabelTemplate(@Param('id') id: string) {
    return this.barcodeService.deleteLabelTemplate(id);
  }

  // ============================================
  // INVENTORY SCANNING
  // ============================================

  @Post('inventory/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async startInventorySession(@Body() dto: StartInventorySessionDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.startInventorySession(dto, userId);
  }

  @Get('inventory/sessions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER, UserRole.SHOP_STAFF)
  async getInventorySession(@Param('id') id: string) {
    return this.barcodeService.getInventorySession(id);
  }

  @Post('inventory/sessions/:id/scan')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER, UserRole.SHOP_STAFF)
  async addInventoryScanEntry(
    @Param('id') sessionId: string,
    @Body() dto: Omit<InventoryScanEntryDto, 'sessionId'>,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.addInventoryScanEntry({ ...dto, sessionId }, userId);
  }

  @Post('inventory/sessions/:id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async completeInventorySession(
    @Param('id') sessionId: string,
    @Body() dto: Omit<CompleteInventorySessionDto, 'sessionId'>,
    @Req() req: any,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.completeInventorySession({ ...dto, sessionId }, userId);
  }

  @Post('inventory/sessions/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  async cancelInventorySession(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.barcodeService.cancelInventorySession(id, userId);
  }

  // ============================================
  // VERIFICATION
  // ============================================

  @Post('verify')
  async verifyBarcode(@Body() dto: VerifyBarcodeDto) {
    return this.barcodeService.verifyBarcode(dto);
  }

  @Post('validate')
  async validateBarcodeFormat(@Body() dto: ValidateBarcodeFormatDto) {
    return this.barcodeService.validateBarcodeFormat(dto);
  }

  // ============================================
  // SCAN HISTORY
  // ============================================

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async getScanHistory(@Query() dto: ScanHistoryFilterDto) {
    return this.barcodeService.getScanHistory(dto);
  }
}
