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
  NotFoundException,
} from '@nestjs/common';
import { CmsService, CreatePageDto, UpdatePageDto } from './cms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  // ============================================
  // PUBLIC ENDPOINTS
  // ============================================

  /**
   * Get published page by slug (public)
   */
  @Get('pages/public/:slug')
  async getPublicPage(@Param('slug') slug: string) {
    const page = await this.cmsService.findPageBySlug(slug);

    if (!page) {
      throw new NotFoundException(`Page "${slug}" not found`);
    }

    return { data: page };
  }

  /**
   * Get public site settings
   */
  @Get('settings/public')
  async getPublicSettings() {
    return this.cmsService.findPublicSettings();
  }

  // ============================================
  // ADMIN ENDPOINTS - PAGES
  // ============================================

  /**
   * Get all pages (admin)
   */
  @Get('pages')
  @UseGuards(JwtAuthGuard)
  async getAllPages(@Query('includeArchived') includeArchived?: string) {
    return this.cmsService.findAllPages(includeArchived === 'true');
  }

  /**
   * Get page by ID (admin)
   */
  @Get('pages/:id')
  @UseGuards(JwtAuthGuard)
  async getPageById(@Param('id') id: string) {
    const page = await this.cmsService.findPageById(id);
    return { data: page };
  }

  /**
   * Create a new page (admin)
   */
  @Post('pages')
  @UseGuards(JwtAuthGuard)
  async createPage(@Body() dto: CreatePageDto, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    const page = await this.cmsService.createPage(dto, userId);
    return { data: page, message: 'Page created successfully' };
  }

  /**
   * Update a page (admin)
   */
  @Put('pages/:id')
  @UseGuards(JwtAuthGuard)
  async updatePage(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const page = await this.cmsService.updatePage(id, dto, userId);
    return { data: page, message: 'Page updated successfully' };
  }

  /**
   * Delete a page (admin)
   */
  @Delete('pages/:id')
  @UseGuards(JwtAuthGuard)
  async deletePage(@Param('id') id: string) {
    await this.cmsService.deletePage(id);
    return { message: 'Page deleted successfully' };
  }

  /**
   * Publish a page (admin)
   */
  @Post('pages/:id/publish')
  @UseGuards(JwtAuthGuard)
  async publishPage(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    const page = await this.cmsService.updatePage(id, { status: 'published' }, userId);
    return { data: page, message: 'Page published successfully' };
  }

  /**
   * Unpublish a page (admin)
   */
  @Post('pages/:id/unpublish')
  @UseGuards(JwtAuthGuard)
  async unpublishPage(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.sub || req.user?.userId;
    const page = await this.cmsService.updatePage(id, { status: 'draft' }, userId);
    return { data: page, message: 'Page unpublished successfully' };
  }

  // ============================================
  // ADMIN ENDPOINTS - SETTINGS
  // ============================================

  /**
   * Get all settings (admin)
   */
  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getAllSettings() {
    return this.cmsService.findAllSettings();
  }

  /**
   * Get setting by key (admin)
   */
  @Get('settings/:key')
  @UseGuards(JwtAuthGuard)
  async getSettingByKey(@Param('key') key: string) {
    const setting = await this.cmsService.findSettingByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return { data: setting };
  }

  /**
   * Update or create a setting (admin)
   */
  @Put('settings/:key')
  @UseGuards(JwtAuthGuard)
  async upsertSetting(
    @Param('key') key: string,
    @Body() body: {
      value: any;
      group?: string;
      valueType?: string;
      label?: string;
      description?: string;
      isPublic?: boolean;
    },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const setting = await this.cmsService.upsertSetting(
      key,
      body.value,
      {
        group: body.group,
        valueType: body.valueType,
        label: body.label,
        description: body.description,
        isPublic: body.isPublic,
      },
      userId,
    );
    return { data: setting, message: 'Setting updated successfully' };
  }

  /**
   * Delete a setting (admin)
   */
  @Delete('settings/:key')
  @UseGuards(JwtAuthGuard)
  async deleteSetting(@Param('key') key: string) {
    await this.cmsService.deleteSetting(key);
    return { message: 'Setting deleted successfully' };
  }

  /**
   * Bulk update settings (admin)
   */
  @Put('settings')
  @UseGuards(JwtAuthGuard)
  async bulkUpdateSettings(
    @Body() body: { settings: Array<{ key: string; value: any; group?: string; isPublic?: boolean }> },
    @Req() req: any,
  ) {
    const userId = req.user?.sub || req.user?.userId;
    const results = [];

    for (const setting of body.settings) {
      const result = await this.cmsService.upsertSetting(
        setting.key,
        setting.value,
        { group: setting.group, isPublic: setting.isPublic },
        userId,
      );
      results.push(result);
    }

    return { data: results, message: 'Settings updated successfully' };
  }
}
