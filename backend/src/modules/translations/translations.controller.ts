import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
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
import { TranslationsService } from './translations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetTranslationDto, AutoTranslateDto } from './dto/translations.dto';

@ApiTags('translations')
@Controller('translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  // ============================================
  // SET TRANSLATION (vendor auth)
  // ============================================

  @Post(':entityType/:entityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Set translation for an entity' })
  @ApiResponse({ status: 201, description: 'Translation saved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'entityType', description: 'Entity type (product or category)', enum: ['product', 'category'] })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  async setTranslation(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() dto: SetTranslationDto,
  ) {
    return this.translationsService.setTranslation(
      entityType,
      entityId,
      dto.locale,
      dto.fields,
    );
  }

  // ============================================
  // GET ALL TRANSLATIONS (public)
  // ============================================

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get all translations for an entity' })
  @ApiResponse({ status: 200, description: 'Translations returned successfully' })
  @ApiParam({ name: 'entityType', description: 'Entity type (product or category)', enum: ['product', 'category'] })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  async getTranslations(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.translationsService.getTranslations(entityType, entityId);
  }

  // ============================================
  // GET SPECIFIC LOCALE TRANSLATION (public)
  // ============================================

  @Get(':entityType/:entityId/:locale')
  @ApiOperation({ summary: 'Get translation for a specific locale' })
  @ApiResponse({ status: 200, description: 'Translation returned successfully' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  @ApiParam({ name: 'entityType', description: 'Entity type (product or category)', enum: ['product', 'category'] })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiParam({ name: 'locale', description: 'Locale code (e.g. ja, fr, de)' })
  async getTranslation(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('locale') locale: string,
  ) {
    return this.translationsService.getTranslation(entityType, entityId, locale);
  }

  // ============================================
  // DELETE TRANSLATION (vendor auth)
  // ============================================

  @Delete(':entityType/:entityId/:locale')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete translation for a specific locale' })
  @ApiResponse({ status: 200, description: 'Translation deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Translation not found' })
  @ApiParam({ name: 'entityType', description: 'Entity type (product or category)', enum: ['product', 'category'] })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiParam({ name: 'locale', description: 'Locale code (e.g. ja, fr, de)' })
  async deleteTranslation(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Param('locale') locale: string,
  ) {
    return this.translationsService.deleteTranslation(entityType, entityId, locale);
  }

  // ============================================
  // AUTO-TRANSLATE (vendor auth)
  // ============================================

  @Post(':entityType/:entityId/auto-translate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Auto-translate entity content using AI' })
  @ApiResponse({ status: 201, description: 'Auto-translation completed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  @ApiParam({ name: 'entityType', description: 'Entity type (product or category)', enum: ['product', 'category'] })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  async autoTranslate(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body() dto: AutoTranslateDto,
  ) {
    return this.translationsService.autoTranslate(
      entityType,
      entityId,
      dto.targetLocale,
      dto.sourceLocale,
    );
  }
}
