import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { AIService } from './ai.service';
import {
  AutoFillFromImageDto,
  AutoFillFromTextDto,
  AutoFillFromBarcodeDto,
  GenerateDescriptionDto,
  ImproveDescriptionDto,
  GenerateSeoDto,
  GenerateTagsDto,
  SuggestCategoryDto,
  SuggestPricingDto,
  AnalyzeImageDto,
  TranslateProductDto,
  BulkAutoFillDto,
  ConfigureAIDto,
} from './dto/ai.dto';

@ApiTags('AI Product Auto-Fill')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // ============================================
  // AUTO-FILL
  // ============================================

  @Post('auto-fill/image/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Auto-fill product details from image' })
  autoFillFromImage(
    @Param('shopId') shopId: string,
    @Body() dto: AutoFillFromImageDto,
  ) {
    return this.aiService.autoFillFromImage(shopId, dto);
  }

  @Post('auto-fill/text/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Auto-fill product details from text/name' })
  autoFillFromText(
    @Param('shopId') shopId: string,
    @Body() dto: AutoFillFromTextDto,
  ) {
    return this.aiService.autoFillFromText(shopId, dto);
  }

  @Post('auto-fill/barcode/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Auto-fill product details from barcode/UPC' })
  autoFillFromBarcode(
    @Param('shopId') shopId: string,
    @Body() dto: AutoFillFromBarcodeDto,
  ) {
    return this.aiService.autoFillFromBarcode(shopId, dto);
  }

  // ============================================
  // DESCRIPTION GENERATION
  // ============================================

  @Post('description/generate/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Generate product description' })
  generateDescription(
    @Param('shopId') shopId: string,
    @Body() dto: GenerateDescriptionDto,
  ) {
    return this.aiService.generateDescription(shopId, dto);
  }

  @Post('description/improve/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Improve existing product description' })
  improveDescription(
    @Param('shopId') shopId: string,
    @Body() dto: ImproveDescriptionDto,
  ) {
    return this.aiService.improveDescription(shopId, dto);
  }

  // ============================================
  // SEO
  // ============================================

  @Post('seo/generate/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Generate SEO metadata' })
  generateSeo(
    @Param('shopId') shopId: string,
    @Body() dto: GenerateSeoDto,
  ) {
    return this.aiService.generateSeo(shopId, dto);
  }

  @Post('tags/generate/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Generate product tags' })
  generateTags(
    @Param('shopId') shopId: string,
    @Body() dto: GenerateTagsDto,
  ) {
    return this.aiService.generateTags(shopId, dto);
  }

  // ============================================
  // CATEGORY & PRICING
  // ============================================

  @Post('category/suggest/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Suggest product category' })
  suggestCategory(
    @Param('shopId') shopId: string,
    @Body() dto: SuggestCategoryDto,
  ) {
    return this.aiService.suggestCategory(shopId, dto);
  }

  @Post('pricing/suggest/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Suggest product pricing' })
  suggestPricing(
    @Param('shopId') shopId: string,
    @Body() dto: SuggestPricingDto,
  ) {
    return this.aiService.suggestPricing(shopId, dto);
  }

  // ============================================
  // IMAGE ANALYSIS
  // ============================================

  @Post('image/analyze/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Analyze product image' })
  analyzeImage(
    @Param('shopId') shopId: string,
    @Body() dto: AnalyzeImageDto,
  ) {
    return this.aiService.analyzeImage(shopId, dto);
  }

  // ============================================
  // TRANSLATION
  // ============================================

  @Post('translate/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN, UserRole.SHOP_MANAGER)
  @ApiOperation({ summary: 'Translate product content' })
  translateProduct(
    @Param('shopId') shopId: string,
    @Body() dto: TranslateProductDto,
  ) {
    return this.aiService.translateProduct(shopId, dto);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  @Post('bulk/auto-fill/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Bulk auto-fill multiple products' })
  bulkAutoFill(
    @Req() req: any,
    @Param('shopId') shopId: string,
    @Body() dto: BulkAutoFillDto,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.aiService.bulkAutoFill(shopId, userId, dto);
  }

  // ============================================
  // CONFIGURATION
  // ============================================

  @Post('config/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER)
  @ApiOperation({ summary: 'Configure AI settings' })
  configureAI(
    @Param('shopId') shopId: string,
    @Body() dto: ConfigureAIDto,
  ) {
    return this.aiService.configureAI(shopId, dto);
  }

  @Get('config/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Get AI configuration' })
  getAIConfig(@Param('shopId') shopId: string) {
    return this.aiService.getAIConfig(shopId);
  }

  // ============================================
  // USAGE STATS
  // ============================================

  @Get('usage/:shopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  @ApiOperation({ summary: 'Get AI usage statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getUsageStats(
    @Param('shopId') shopId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.aiService.getUsageStats(shopId, startDate, endDate);
  }
}
