import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@ApiTags('campaigns')
@Controller('campaigns')
@ApiHeader({
  name: 'x-shop-id',
  description: 'Shop ID for vendor context (required for vendor operations)',
  required: false,
})
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new campaign (admin/shop owner, uses x-shop-id header)' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @Req() req: any,
  ) {
    const shopId = req.headers['x-shop-id'];

    // Shop ID is required for creating campaigns
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    // Add shopId to DTO if not already present
    const campaignData = { ...createCampaignDto, shopId };
    return this.campaignsService.createCampaign(campaignData, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'List all campaigns with filters' })
  @ApiResponse({ status: 200, description: 'List of campaigns' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by campaign type' })
  @ApiQuery({ name: 'shopId', required: false, description: 'Filter by shop ID (legacy - prefer using shop endpoint with x-shop-id header)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async getCampaigns(@Query() query: any) {
    return this.campaignsService.getCampaigns(query);
  }

  @Get('shop')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get campaigns by shop (uses x-shop-id header)' })
  @ApiResponse({ status: 200, description: 'Shop campaigns returned successfully' })
  @ApiResponse({ status: 400, description: 'Shop ID missing from header' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by campaign type' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'offset', required: false, type: Number, example: 0 })
  async getCampaignsByShop(
    @Query() query: any,
    @Req() req: any,
  ) {
    const shopId = req.headers['x-shop-id'];
    if (!shopId) {
      throw new Error('Shop ID is required. Please provide x-shop-id header.');
    }

    // Add shopId to query for filtering
    return this.campaignsService.getCampaigns({ ...query, shopId });
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active campaigns only' })
  @ApiResponse({ status: 200, description: 'List of active campaigns' })
  async getActiveCampaigns() {
    return this.campaignsService.getActiveCampaigns();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get campaign by slug' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaignBySlug(@Param('slug') slug: string) {
    return this.campaignsService.getCampaignBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign details' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaign(@Param('id') id: string) {
    return this.campaignsService.getCampaign(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update campaign' })
  @ApiResponse({ status: 200, description: 'Campaign updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
    @Req() req: any,
  ) {
    return this.campaignsService.updateCampaign(id, updateCampaignDto, req.user);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change campaign status' })
  @ApiResponse({ status: 200, description: 'Campaign status updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async changeCampaignStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Req() req: any,
  ) {
    return this.campaignsService.changeCampaignStatus(id, status, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete campaign' })
  @ApiResponse({ status: 200, description: 'Campaign deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async deleteCampaign(@Param('id') id: string, @Req() req: any) {
    return this.campaignsService.deleteCampaign(id, req.user);
  }

  @Post(':id/track-view')
  @ApiOperation({ summary: 'Track campaign impression' })
  @ApiResponse({ status: 200, description: 'Impression tracked' })
  async trackView(@Param('id') id: string) {
    return this.campaignsService.trackImpression(id);
  }

  @Post(':id/track-click')
  @ApiOperation({ summary: 'Track campaign click' })
  @ApiResponse({ status: 200, description: 'Click tracked' })
  async trackClick(@Param('id') id: string) {
    return this.campaignsService.trackClick(id);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get campaign analytics' })
  @ApiResponse({ status: 200, description: 'Campaign analytics data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Campaign not found' })
  async getCampaignAnalytics(@Param('id') id: string, @Req() req: any) {
    return this.campaignsService.getCampaignAnalytics(id, req.user);
  }
}
