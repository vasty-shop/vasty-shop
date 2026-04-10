import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiHeader,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { ShopInvitationService } from './shop-invitation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserId } from '../../common/decorators/user.decorator';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import {
  InviteTeamMemberDto,
  UpdateTeamMemberRoleDto,
  UpdateShopStatusDto,
  QueryShopsDto,
} from './dto/invite-team-member.dto';

@ApiTags('shops')
@Controller('shops')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations on current shop)',
  required: false,
})
export class ShopsController {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly invitationService: ShopInvitationService,
  ) {}

  // ==========================================
  // SHOP MANAGEMENT
  // ==========================================

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new shop',
    description: 'Create a new shop. The authenticated user becomes the shop owner.',
  })
  @ApiResponse({
    status: 201,
    description: 'Shop created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Shop with this name already exists',
  })
  async create(@UserId() userId: string, @Body() createShopDto: CreateShopDto) {
    return this.shopsService.create(userId, createShopDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all active shops',
    description: 'Get a paginated list of all active shops with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'List of shops retrieved successfully',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'active', 'suspended', 'closed'] })
  @ApiQuery({ name: 'is_verified', required: false, type: Boolean })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'sort_by', required: false, enum: ['created_at', 'name', 'total_sales', 'rating'] })
  @ApiQuery({ name: 'sort_order', required: false, enum: ['asc', 'desc'] })
  async findAll(@Query() query: QueryShopsDto) {
    return this.shopsService.findAll(query);
  }

  @Get('my-shops')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user\'s shops',
    description: 'Get all shops owned by or where the user is a team member',
  })
  @ApiResponse({
    status: 200,
    description: 'User shops retrieved successfully',
  })
  async findMyShops(@UserId() userId: string) {
    return this.shopsService.findMyShops(userId);
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current shop details (vendor)',
    description: 'Retrieve detailed information about the current shop using x-shop-id header',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop details retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async findCurrent(@Request() req: any) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.findOne(shopId);
  }

  @Put('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update current shop (vendor)',
    description: 'Update shop information using x-shop-id header. Only owner or admin can update.',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async updateCurrent(
    @Request() req: any,
    @UserId() userId: string,
    @Body() updateShopDto: UpdateShopDto,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.update(shopId, userId, updateShopDto);
  }

  @Delete('current')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete current shop (vendor)',
    description: 'Soft delete current shop using x-shop-id header. Only the shop owner can delete.',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owner can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async removeCurrent(@Request() req: any, @UserId() userId: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.remove(shopId, userId);
  }

  // ==========================================
  // MOBILE APP CONFIGURATION ENDPOINTS (Must be BEFORE :id route!)
  // ==========================================

  @Post('upload-app-icon')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload app icon/logo to storage' })
  @ApiResponse({ status: 200, description: 'App icon uploaded successfully', schema: { properties: { url: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header or no file provided' })
  async uploadAppIcon(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    console.log('Upload app icon request received');
    console.log('File:', file ? `${file.originalname} (${file.size} bytes)` : 'No file');
    console.log('Headers:', req.headers['x-shop-id']);

    const shopId = req.headers['x-shop-id'];

    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }

    if (!file) {
      console.error('No file in request. Body keys:', Object.keys(req.body || {}));
      throw new Error('No file provided. Please ensure the file field is named "file".');
    }

    return this.shopsService.uploadAppIcon(file, shopId);
  }

  @Post('current/upload-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: ['logo', 'banner'],
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload shop logo or banner image' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully', schema: { properties: { url: { type: 'string' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header or no file provided' })
  async uploadShopImage(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const shopId = req.headers['x-shop-id'];
    const type = req.body?.type || 'logo';

    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }

    if (!file) {
      throw new Error('No file provided. Please ensure the file field is named "file".');
    }

    if (type !== 'logo' && type !== 'banner') {
      throw new Error('Invalid type. Must be "logo" or "banner".');
    }

    return this.shopsService.uploadShopImage(file, shopId, type);
  }

  @Get('mobile-config')
  @ApiOperation({
    summary: 'Get mobile app configuration',
    description: 'Retrieve the mobile app configuration. Works with and without authentication. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile app configuration retrieved successfully',
  })
  async getMobileAppConfig(@Request() req: any) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }

    // Check if authenticated
    const userId = req.user?.sub || req.user?.userId;
    if (userId) {
      // Authenticated user - return full config
      return this.shopsService.getMobileAppConfig(shopId, userId);
    } else {
      // Public access - return published config only
      return this.shopsService.getPublicMobileConfig(shopId);
    }
  }

  @Post('mobile-config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create mobile app configuration',
    description: 'Create the mobile app configuration for the shop. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile app configuration created successfully',
  })
  async createMobileAppConfig(
    @Request() req: any,
    @UserId() userId: string,
    @Body() config: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.saveMobileAppConfig(shopId, userId, config);
  }

  @Put('mobile-config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update mobile app configuration',
    description: 'Update the mobile app configuration for the shop. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile app configuration updated successfully',
  })
  async updateMobileAppConfig(
    @Request() req: any,
    @UserId() userId: string,
    @Body() config: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.saveMobileAppConfig(shopId, userId, config);
  }

  @Post('mobile-config/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Publish mobile app',
    description: 'Publish the mobile app configuration. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile app published successfully',
  })
  async publishMobileApp(
    @Request() req: any,
    @UserId() userId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.publishMobileApp(shopId, userId);
  }

  @Delete('mobile-config/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unpublish mobile app',
    description: 'Unpublish the mobile app configuration. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile app unpublished successfully',
  })
  async unpublishMobileApp(
    @Request() req: any,
    @UserId() userId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.unpublishMobileApp(shopId, userId);
  }

  @Get('mobile-config/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Download mobile app with shop ID configured',
    description: 'Download the pre-built mobile app as a ZIP file with shop ID and app config injected into .env files. Uses x-shop-id header.',
  })
  @ApiQuery({ name: 'appName', required: false, type: String, description: 'App name for APP_NAME in .env' })
  @ApiQuery({ name: 'packageName', required: false, type: String, description: 'Package name for PACKAGE_NAME in .env' })
  @ApiQuery({ name: 'versionCode', required: false, type: String, description: 'Version code for VERSION_CODE in .env' })
  @ApiQuery({ name: 'versionName', required: false, type: String, description: 'Version name for VERSION_NAME in .env' })
  @ApiResponse({
    status: 200,
    description: 'Mobile app downloaded successfully',
  })
  async downloadMobileApp(
    @Request() req: any,
    @UserId() userId: string,
    @Query() query: any,
    @Res() res: Response,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }

    // Extract app config from query params
    const appConfig = {
      appName: query.appName,
      packageName: query.packageName,
      versionCode: query.versionCode,
      versionName: query.versionName,
    };

    // Prepare the mobile app with shop ID and app config injected
    const result = await this.shopsService.downloadMobileApp(shopId, userId, appConfig);

    // Set response headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="mobile-app-${shopId}.zip"`,
    );

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add the mobile folder to the archive
    const mobileFolder = path.join(result.tempPath, 'mobile');
    archive.directory(mobileFolder, 'mobile');

    // Finalize the archive
    await archive.finalize();

    // Clean up temp directory after a delay
    setTimeout(() => {
      if (fs.existsSync(result.tempPath)) {
        fs.rmSync(result.tempPath, { recursive: true, force: true });
      }
    }, 5000); // 5 seconds delay to ensure download completes
  }

  // ==========================================
  // SHOP DETAILS BY ID (Generic :id route must be AFTER specific routes!)
  // ==========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get shop details by ID',
    description: 'Retrieve detailed information about a specific shop',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async findOne(@Param('id') id: string) {
    return this.shopsService.findOne(id);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get shop by slug',
    description: 'Retrieve shop information using SEO-friendly slug',
  })
  @ApiParam({ name: 'slug', description: 'Shop slug' })
  @ApiResponse({
    status: 200,
    description: 'Shop retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async findBySlug(@Param('slug') slug: string) {
    return this.shopsService.findBySlug(slug);
  }

  @Get('subdomain/:subdomain')
  @ApiOperation({
    summary: 'Get shop by subdomain',
    description: 'Retrieve shop information using subdomain (for storefront routing)',
  })
  @ApiParam({ name: 'subdomain', description: 'Shop subdomain' })
  @ApiResponse({
    status: 200,
    description: 'Shop retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async findBySubdomain(@Param('subdomain') subdomain: string) {
    return this.shopsService.findBySubdomain(subdomain);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update shop',
    description: 'Update shop information. Only owner or admin can update.',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async update(
    @Param('id') id: string,
    @UserId() userId: string,
    @Body() updateShopDto: UpdateShopDto,
  ) {
    return this.shopsService.update(id, userId, updateShopDto);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change shop status',
    description: 'Update shop status (pending, active, suspended, closed). Admin only.',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateShopStatusDto,
  ) {
    return this.shopsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete shop',
    description: 'Soft delete a shop. Only the shop owner can delete.',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owner can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async remove(@Param('id') id: string, @UserId() userId: string) {
    return this.shopsService.remove(id, userId);
  }

  // ==========================================
  // SHOP STATISTICS
  // ==========================================

  @Get('current/statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current shop statistics (vendor)',
    description: 'Retrieve current shop performance metrics using x-shop-id header',
  })
  @ApiResponse({
    status: 200,
    description: 'Shop statistics retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async getCurrentStatistics(@Request() req: any) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getStatistics(shopId);
  }

  @Get('current/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current shop analytics (vendor)',
    description: 'Retrieve detailed analytics for current shop using x-shop-id header',
  })
  @ApiQuery({ name: 'timeRange', required: false, example: '6m', description: 'Time range (e.g., 1m, 3m, 6m, 1y)' })
  @ApiResponse({
    status: 200,
    description: 'Shop analytics retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  async getCurrentAnalytics(@Request() req: any, @Query('timeRange') timeRange: string = '6m') {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getStatistics(shopId, timeRange);
  }

  @Get(':id/statistics')
  @ApiOperation({
    summary: 'Get shop statistics',
    description: 'Retrieve shop performance metrics including sales, orders, products, and ratings',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Shop statistics retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async getStatistics(@Param('id') id: string) {
    return this.shopsService.getStatistics(id);
  }

  // ==========================================
  // TEAM MANAGEMENT
  // ==========================================

  @Get('current/team')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current shop team members (vendor)',
    description: 'Retrieve all team members for current shop using x-shop-id header',
  })
  @ApiResponse({
    status: 200,
    description: 'Team members retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async getCurrentTeam(@Request() req: any, @UserId() userId: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getTeam(shopId, userId);
  }

  @Get('current/team/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get pending invitations for current shop (vendor)',
    description: 'Retrieve all pending invitations for current shop using x-shop-id header',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitations retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  async getCurrentInvitations(@Request() req: any, @UserId() userId: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.invitationService.listPendingInvitations(shopId, userId);
  }

  @Get('current/team/roles')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get available team roles (vendor)',
    description: 'Retrieve available roles for team members',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles retrieved successfully',
  })
  async getAvailableRoles() {
    return this.invitationService.getAvailableRoles();
  }

  @Post('current/team/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Invite team member to current shop (vendor)',
    description: 'Send invitation to a user to join current shop team using x-shop-id header. Owner or admin only.',
  })
  @ApiResponse({
    status: 201,
    description: 'Team member invitation sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User already a member or invitation already sent',
  })
  async inviteCurrentTeamMember(
    @Request() req: any,
    @UserId() userId: string,
    @Body() inviteDto: InviteTeamMemberDto,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.invitationService.inviteToShop(shopId, inviteDto, userId);
  }

  @Post('current/team/invitations/:invitationId/resend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Resend team invitation (vendor)',
    description: 'Resend an invitation email with a new token',
  })
  @ApiParam({ name: 'invitationId', description: 'Invitation ID' })
  @ApiResponse({
    status: 200,
    description: 'Invitation resent successfully',
  })
  async resendCurrentInvitation(
    @Request() req: any,
    @UserId() userId: string,
    @Param('invitationId') invitationId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.invitationService.resendInvitation(shopId, invitationId, userId);
  }

  @Delete('current/team/invitations/:invitationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel team invitation (vendor)',
    description: 'Cancel a pending invitation',
  })
  @ApiParam({ name: 'invitationId', description: 'Invitation ID' })
  @ApiResponse({
    status: 200,
    description: 'Invitation cancelled successfully',
  })
  async cancelCurrentInvitation(
    @Request() req: any,
    @UserId() userId: string,
    @Param('invitationId') invitationId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.invitationService.cancelInvitation(shopId, invitationId, userId);
  }

  @Patch('current/team/:memberId/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update team member role in current shop (vendor)',
    description: 'Change team member role and permissions using x-shop-id header. Owner or admin only.',
  })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({
    status: 200,
    description: 'Team member role updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions or cannot change owner role',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop or team member not found',
  })
  async updateCurrentTeamMemberRole(
    @Request() req: any,
    @Param('memberId') memberId: string,
    @UserId() userId: string,
    @Body() updateRoleDto: UpdateTeamMemberRoleDto,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.updateTeamMemberRole(shopId, memberId, userId, updateRoleDto);
  }

  @Delete('current/team/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove team member from current shop (vendor)',
    description: 'Remove a team member from current shop using x-shop-id header. Owner or admin only. Cannot remove owner.',
  })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({
    status: 200,
    description: 'Team member removed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions or cannot remove owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop or team member not found',
  })
  async removeCurrentTeamMember(
    @Request() req: any,
    @Param('memberId') memberId: string,
    @UserId() userId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.removeTeamMember(shopId, memberId, userId);
  }

  @Get(':id/team')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get shop team members',
    description: 'Retrieve all team members for a shop',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({
    status: 200,
    description: 'Team members retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async getTeam(@Param('id') id: string, @UserId() userId: string) {
    return this.shopsService.getTeam(id, userId);
  }

  @Post(':id/team/invite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Invite team member',
    description: 'Send invitation to a user to join the shop team. Owner or admin only.',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiResponse({
    status: 201,
    description: 'Team member invitation sent successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async inviteTeamMember(
    @Param('id') id: string,
    @UserId() userId: string,
    @Body() inviteDto: InviteTeamMemberDto,
  ) {
    return this.invitationService.inviteToShop(id, inviteDto, userId);
  }

  @Patch(':id/team/:memberId/role')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update team member role',
    description: 'Change team member role and permissions. Owner or admin only.',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({
    status: 200,
    description: 'Team member role updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions or cannot change owner role',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop or team member not found',
  })
  async updateTeamMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @UserId() userId: string,
    @Body() updateRoleDto: UpdateTeamMemberRoleDto,
  ) {
    return this.shopsService.updateTeamMemberRole(id, memberId, userId, updateRoleDto);
  }

  @Delete(':id/team/:memberId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove team member',
    description: 'Remove a team member from the shop. Owner or admin only. Cannot remove owner.',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiParam({ name: 'memberId', description: 'Team member ID' })
  @ApiResponse({
    status: 200,
    description: 'Team member removed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions or cannot remove owner',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop or team member not found',
  })
  async removeTeamMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @UserId() userId: string,
  ) {
    return this.shopsService.removeTeamMember(id, memberId, userId);
  }

  // ==========================================
  // CUSTOMER MANAGEMENT
  // ==========================================

  @Get('current/customers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current shop customers (vendor)',
    description: 'Retrieve customers who have purchased from current shop using x-shop-id header',
  })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'vip'], description: 'Filter by customer status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'totalOrders', 'totalSpent', 'lastOrderDate'], description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Customer list retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async getCurrentCustomers(
    @Request() req: any,
    @UserId() userId: string,
    @Query() query: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getCustomers(shopId, userId, {
      search: query.search,
      status: query.status,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id/customers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get shop customers',
    description: 'Retrieve customers who have purchased from this shop, aggregated from orders',
  })
  @ApiParam({ name: 'id', description: 'Shop ID' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'inactive', 'vip'], description: 'Filter by customer status' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'totalOrders', 'totalSpent', 'lastOrderDate'], description: 'Sort field' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Customer list retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Shop not found',
  })
  async getCustomers(
    @Param('id') id: string,
    @UserId() userId: string,
    @Query() query: any,
  ) {
    return this.shopsService.getCustomers(id, userId, {
      search: query.search,
      status: query.status,
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 10,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  // ==========================================
  // STRIPE CONNECT (Vendor Payouts)
  // ==========================================

  @Post('current/stripe-connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create Stripe Connect account (vendor)',
    description: 'Create a Stripe Connect account for the current shop to enable payouts. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 201,
    description: 'Stripe Connect account created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing or account already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async createStripeConnectAccount(
    @Request() req: any,
    @UserId() userId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.createStripeConnectAccount(shopId, userId);
  }

  @Get('current/stripe-connect/onboarding')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Stripe Connect onboarding link (vendor)',
    description: 'Get the onboarding link to complete Stripe Connect setup. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding link retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing or no Connect account',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getStripeConnectOnboardingLink(
    @Request() req: any,
    @UserId() userId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getStripeConnectOnboardingLink(shopId, userId);
  }

  @Get('current/stripe-connect/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Stripe Connect account status (vendor)',
    description: 'Get the current status of the Stripe Connect account. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account status retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getStripeConnectStatus(
    @Request() req: any,
    @UserId() userId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getStripeConnectStatus(shopId, userId);
  }

  @Get('current/stripe-connect/dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Stripe Connect dashboard link (vendor)',
    description: 'Get a link to the Stripe Express dashboard for managing payouts. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard link retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing or no Connect account',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async getStripeConnectDashboardLink(
    @Request() req: any,
    @UserId() userId: string,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getStripeConnectDashboardLink(shopId, userId);
  }

  // ==========================================
  // STOREFRONT BUILDER
  // ==========================================

  @Get('current/storefront')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get storefront configuration (vendor)',
    description: 'Retrieve the storefront configuration for the current shop. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Storefront configuration retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  async getStorefrontConfig(@Request() req: any, @UserId() userId: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getStorefrontConfig(shopId, userId);
  }

  @Put('current/storefront')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Save storefront configuration (vendor)',
    description: 'Save the storefront configuration for the current shop. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Storefront configuration saved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async saveStorefrontConfig(
    @Request() req: any,
    @UserId() userId: string,
    @Body() config: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.saveStorefrontConfig(shopId, userId, config);
  }

  @Post('current/storefront/publish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Publish storefront (vendor)',
    description: 'Publish the storefront for the current shop, making it live. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Storefront published successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async publishStorefront(@Request() req: any, @UserId() userId: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.publishStorefront(shopId, userId);
  }

  @Delete('current/storefront/unpublish')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unpublish storefront (vendor)',
    description: 'Unpublish the storefront for the current shop. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Storefront unpublished successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Shop ID missing from header',
  })
  async unpublishStorefront(@Request() req: any, @UserId() userId: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.unpublishStorefront(shopId, userId);
  }

  // ==========================================
  // MOBILE APP BUILDER
  // ==========================================

  @Get('current/mobile-app')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all mobile app configurations (vendor)',
    description: 'Retrieve both customer and delivery app configurations for the current shop. Uses x-shop-id header.',
  })
  @ApiResponse({
    status: 200,
    description: 'Mobile app configurations retrieved successfully',
  })
  async getAllMobileAppConfigs(@Request() req: any, @UserId() userId: string) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new BadRequestException('Shop ID is required. Please provide x-shop-id header.');
    }
    return this.shopsService.getAllMobileAppConfigs(shopId, userId);
  }

  // ==========================================
  // PUBLIC INVITATION ENDPOINTS
  // ==========================================

  @Get('invitations/:token')
  @ApiOperation({
    summary: 'Get invitation details by token (public)',
    description: 'Retrieve invitation details using the invitation token. Does not require authentication.',
  })
  @ApiParam({ name: 'token', description: 'Invitation token from email' })
  @ApiResponse({
    status: 200,
    description: 'Invitation details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid invitation token',
  })
  async getInvitationByToken(@Param('token') token: string) {
    return this.invitationService.getInvitationByToken(token);
  }

  @Post('invitations/:token/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Accept shop invitation',
    description: 'Accept an invitation to join a shop team. Requires authentication.',
  })
  @ApiParam({ name: 'token', description: 'Invitation token from email' })
  @ApiResponse({
    status: 200,
    description: 'Invitation accepted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invitation expired or invalid',
  })
  @ApiResponse({
    status: 409,
    description: 'Already a member or invitation already processed',
  })
  async acceptInvitation(
    @Param('token') token: string,
    @UserId() userId: string,
  ) {
    return this.invitationService.acceptInvitation(token, userId);
  }

  @Post('invitations/:token/decline')
  @ApiOperation({
    summary: 'Decline shop invitation (public)',
    description: 'Decline an invitation to join a shop team. Does not require authentication.',
  })
  @ApiParam({ name: 'token', description: 'Invitation token from email' })
  @ApiResponse({
    status: 200,
    description: 'Invitation declined successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Invalid invitation token',
  })
  async declineInvitation(@Param('token') token: string) {
    return this.invitationService.declineInvitation(token);
  }
}
