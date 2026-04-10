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
import { I18nService } from './i18n.service';
import {
  CreateLanguageDto,
  UpdateLanguageDto,
  CreateTranslationDto,
  BulkTranslationDto,
  ImportTranslationsDto,
  TranslateContentDto,
  LanguageResponseDto,
  TranslationExportDto,
} from './dto/i18n.dto';

@ApiTags('Internationalization')
@Controller('i18n')
export class I18nController {
  constructor(private readonly i18nService: I18nService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  @Get('languages')
  @ApiOperation({ summary: 'Get all active languages' })
  @ApiResponse({ status: 200, description: 'List of languages', type: [LanguageResponseDto] })
  async getLanguages(@Query('includeInactive') includeInactive?: string) {
    return this.i18nService.getLanguages(includeInactive === 'true');
  }

  @Get('languages/default')
  @ApiOperation({ summary: 'Get default language' })
  @ApiResponse({ status: 200, description: 'Default language', type: LanguageResponseDto })
  async getDefaultLanguage() {
    return this.i18nService.getDefaultLanguage();
  }

  @Get('languages/:code')
  @ApiOperation({ summary: 'Get language by code' })
  @ApiResponse({ status: 200, description: 'Language details', type: LanguageResponseDto })
  async getLanguage(@Param('code') code: string) {
    return this.i18nService.getLanguage(code);
  }

  @Get('translations/:languageCode')
  @ApiOperation({ summary: 'Get translations for a language' })
  @ApiResponse({ status: 200, description: 'Translations object' })
  async getTranslations(
    @Param('languageCode') languageCode: string,
    @Query('namespace') namespace?: string,
  ) {
    return this.i18nService.getTranslations(languageCode, namespace);
  }

  @Get('namespaces')
  @ApiOperation({ summary: 'Get all translation namespaces' })
  @ApiResponse({ status: 200, description: 'List of namespaces' })
  async getNamespaces() {
    return this.i18nService.getNamespaces();
  }

  // ============================================
  // CONTENT TRANSLATION (Public read)
  // ============================================

  @Get('content/:entityType/:entityId')
  @ApiOperation({ summary: 'Get content translation' })
  @ApiResponse({ status: 200, description: 'Content translation' })
  async getContentTranslation(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    return this.i18nService.getContentTranslation(entityType, entityId, languageCode);
  }

  // ============================================
  // ADMIN - LANGUAGE MANAGEMENT
  // ============================================

  @Post('languages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create language (Admin)' })
  @ApiResponse({ status: 201, description: 'Language created', type: LanguageResponseDto })
  async createLanguage(@Body() dto: CreateLanguageDto) {
    // TODO: Add admin role check
    return this.i18nService.createLanguage(dto);
  }

  @Put('languages/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update language (Admin)' })
  @ApiResponse({ status: 200, description: 'Language updated', type: LanguageResponseDto })
  async updateLanguage(@Param('code') code: string, @Body() dto: UpdateLanguageDto) {
    // TODO: Add admin role check
    return this.i18nService.updateLanguage(code, dto);
  }

  @Delete('languages/:code')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete language (Admin)' })
  @ApiResponse({ status: 204, description: 'Language deleted' })
  async deleteLanguage(@Param('code') code: string) {
    // TODO: Add admin role check
    await this.i18nService.deleteLanguage(code);
  }

  // ============================================
  // ADMIN - TRANSLATION MANAGEMENT
  // ============================================

  @Post('translations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update translation (Admin)' })
  @ApiResponse({ status: 200, description: 'Translation set' })
  async setTranslation(@Body() dto: CreateTranslationDto) {
    // TODO: Add admin role check
    return this.i18nService.setTranslation(dto);
  }

  @Post('translations/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk update translations (Admin)' })
  @ApiResponse({ status: 200, description: 'Bulk update result' })
  async bulkSetTranslations(@Body() dto: BulkTranslationDto) {
    // TODO: Add admin role check
    return this.i18nService.bulkSetTranslations(dto);
  }

  @Post('translations/import')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Import translations from JSON (Admin)' })
  @ApiResponse({ status: 200, description: 'Import result' })
  async importTranslations(@Body() dto: ImportTranslationsDto) {
    // TODO: Add admin role check
    return this.i18nService.importTranslations(dto);
  }

  @Get('translations/:languageCode/export')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export translations (Admin)' })
  @ApiResponse({ status: 200, description: 'Translations export', type: TranslationExportDto })
  async exportTranslations(@Param('languageCode') languageCode: string) {
    // TODO: Add admin role check
    return this.i18nService.exportTranslations(languageCode);
  }

  @Delete('translations/:languageCode/:namespace/:key')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete translation (Admin)' })
  @ApiResponse({ status: 204, description: 'Translation deleted' })
  async deleteTranslation(
    @Param('languageCode') languageCode: string,
    @Param('namespace') namespace: string,
    @Param('key') key: string,
  ) {
    // TODO: Add admin role check
    await this.i18nService.deleteTranslation(languageCode, namespace, key);
  }

  @Get('translations/:languageCode/missing')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get missing translations (Admin)' })
  @ApiResponse({ status: 200, description: 'Missing translations' })
  async getMissingTranslations(@Param('languageCode') languageCode: string) {
    // TODO: Add admin role check
    return this.i18nService.getMissingTranslations(languageCode);
  }

  // ============================================
  // ADMIN - CONTENT TRANSLATION
  // ============================================

  @Post('content')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set content translation (Admin/Vendor)' })
  @ApiResponse({ status: 200, description: 'Content translation set' })
  async setContentTranslation(@Body() dto: TranslateContentDto) {
    return this.i18nService.setContentTranslation(dto);
  }

  @Delete('content/:entityType/:entityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete content translation (Admin)' })
  @ApiResponse({ status: 204, description: 'Content translation deleted' })
  async deleteContentTranslation(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Query('languageCode') languageCode?: string,
  ) {
    // TODO: Add admin role check
    await this.i18nService.deleteContentTranslation(entityType, entityId, languageCode);
  }
}
