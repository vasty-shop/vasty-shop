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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { SurgePricingService } from './surge-pricing.service';
import {
  CreateSurgeRuleDto,
  UpdateSurgeRuleDto,
  ConfigureDemandSurgeDto,
  CalculateSurgeDto,
  GetSurgeRulesDto,
} from './dto/surge-pricing.dto';

@ApiTags('Surge Pricing')
@Controller('surge-pricing')
export class SurgePricingController {
  constructor(private readonly surgePricingService: SurgePricingService) {}

  // ============================================
  // SURGE RULES
  // ============================================

  @Post('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create surge pricing rule' })
  createRule(@Body() dto: CreateSurgeRuleDto) {
    return this.surgePricingService.createSurgeRule(dto);
  }

  @Get('rules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SHOP_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get surge pricing rules' })
  getRules(@Query() query: GetSurgeRulesDto) {
    return this.surgePricingService.getSurgeRules(query);
  }

  @Get('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SHOP_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get surge rule by ID' })
  getRule(@Param('id') id: string) {
    return this.surgePricingService.getSurgeRule(id);
  }

  @Put('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update surge pricing rule' })
  updateRule(@Param('id') id: string, @Body() dto: UpdateSurgeRuleDto) {
    return this.surgePricingService.updateSurgeRule(id, dto);
  }

  @Delete('rules/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete surge pricing rule' })
  deleteRule(@Param('id') id: string) {
    return this.surgePricingService.deleteSurgeRule(id);
  }

  @Patch('rules/:id/toggle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle surge rule active status' })
  toggleRule(@Param('id') id: string) {
    return this.surgePricingService.toggleSurgeRule(id);
  }

  // ============================================
  // DEMAND CONFIGURATION
  // ============================================

  @Post('demand/configure')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Configure demand-based surge pricing' })
  configureDemandSurge(@Body() dto: ConfigureDemandSurgeDto) {
    return this.surgePricingService.configureDemandSurge(dto);
  }

  @Get('demand/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SHOP_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get demand surge configuration' })
  @ApiQuery({ name: 'shopId', required: false })
  @ApiQuery({ name: 'zoneId', required: false })
  getDemandConfig(
    @Query('shopId') shopId?: string,
    @Query('zoneId') zoneId?: string,
  ) {
    return this.surgePricingService.getDemandSurgeConfig(shopId, zoneId);
  }

  @Get('demand/level')
  @ApiOperation({ summary: 'Get current demand level' })
  @ApiQuery({ name: 'shopId', required: false })
  @ApiQuery({ name: 'zoneId', required: false })
  getCurrentDemandLevel(
    @Query('shopId') shopId?: string,
    @Query('zoneId') zoneId?: string,
  ) {
    return this.surgePricingService.getCurrentDemandLevel(shopId, zoneId);
  }

  // ============================================
  // CALCULATION
  // ============================================

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate surge pricing for amount' })
  calculateSurge(@Body() dto: CalculateSurgeDto) {
    return this.surgePricingService.calculateSurge(dto);
  }

  // ============================================
  // STATISTICS
  // ============================================

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SHOP_OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get surge pricing statistics' })
  @ApiQuery({ name: 'shopId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  getSurgeStats(
    @Query('shopId') shopId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.surgePricingService.getSurgeStats(shopId, startDate, endDate);
  }
}
