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
import { AttributesService } from './attributes.service';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  AddAttributeOptionsDto,
  UpdateAttributeOptionDto,
  ReorderAttributeOptionsDto,
  CreateAttributeGroupDto,
  UpdateAttributeGroupDto,
  AddAttributesToGroupDto,
  CreateAttributeSetDto,
  UpdateAttributeSetDto,
  SetProductAttributeDto,
  SetProductAttributesDto,
  BulkSetProductAttributesDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  GenerateVariantsDto,
  AttributeFilterDto,
  ImportAttributesDto,
  ExportAttributesDto,
  AssignAttributesToCategoryDto,
  GetCategoryAttributesDto,
} from './dto/attributes.dto';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  // ============================================
  // ATTRIBUTE CRUD
  // ============================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createAttribute(@Body() dto: CreateAttributeDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.attributesService.createAttribute(dto, userId);
  }

  @Get()
  async getAttributes(@Query() dto: AttributeFilterDto) {
    return this.attributesService.getAttributes(dto);
  }

  @Get('filterable')
  async getFilterableAttributes(
    @Query('categoryId') categoryId?: string,
    @Query('shopId') shopId?: string,
  ) {
    return this.attributesService.getFilterableAttributes(categoryId, shopId);
  }

  @Get(':id')
  async getAttribute(@Param('id') id: string) {
    return this.attributesService.getAttribute(id);
  }

  @Get('code/:code')
  async getAttributeByCode(@Param('code') code: string) {
    return this.attributesService.getAttributeByCode(code);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateAttribute(@Param('id') id: string, @Body() dto: UpdateAttributeDto) {
    return this.attributesService.updateAttribute(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteAttribute(@Param('id') id: string) {
    return this.attributesService.deleteAttribute(id);
  }

  // ============================================
  // ATTRIBUTE OPTIONS
  // ============================================

  @Post(':id/options')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async addAttributeOptions(
    @Param('id') attributeId: string,
    @Body() dto: Omit<AddAttributeOptionsDto, 'attributeId'>,
  ) {
    return this.attributesService.addAttributeOptions({ ...dto, attributeId });
  }

  @Put(':id/options/:optionValue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateAttributeOption(
    @Param('id') attributeId: string,
    @Param('optionValue') optionValue: string,
    @Body() dto: UpdateAttributeOptionDto,
  ) {
    return this.attributesService.updateAttributeOption(attributeId, optionValue, dto);
  }

  @Delete(':id/options/:optionValue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteAttributeOption(
    @Param('id') attributeId: string,
    @Param('optionValue') optionValue: string,
  ) {
    return this.attributesService.deleteAttributeOption(attributeId, optionValue);
  }

  @Put(':id/options/reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async reorderAttributeOptions(
    @Param('id') attributeId: string,
    @Body() dto: Omit<ReorderAttributeOptionsDto, 'attributeId'>,
  ) {
    return this.attributesService.reorderAttributeOptions({ ...dto, attributeId });
  }

  @Get(':id/filter-values')
  async getAttributeFilterValues(
    @Param('id') attributeId: string,
    @Query('categoryId') categoryId?: string,
    @Query('shopId') shopId?: string,
  ) {
    return this.attributesService.getAttributeFilterValues(attributeId, categoryId, shopId);
  }

  // ============================================
  // ATTRIBUTE GROUPS
  // ============================================

  @Post('groups')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createAttributeGroup(@Body() dto: CreateAttributeGroupDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.attributesService.createAttributeGroup(dto, userId);
  }

  @Get('groups')
  async getAttributeGroups(@Query('categoryId') categoryId?: string) {
    return this.attributesService.getAttributeGroups(categoryId);
  }

  @Get('groups/:id')
  async getAttributeGroup(@Param('id') id: string) {
    return this.attributesService.getAttributeGroup(id);
  }

  @Put('groups/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateAttributeGroup(@Param('id') id: string, @Body() dto: UpdateAttributeGroupDto) {
    return this.attributesService.updateAttributeGroup(id, dto);
  }

  @Post('groups/:id/attributes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async addAttributesToGroup(@Param('id') id: string, @Body() dto: AddAttributesToGroupDto) {
    return this.attributesService.addAttributesToGroup(id, dto);
  }

  @Delete('groups/:groupId/attributes/:attributeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async removeAttributeFromGroup(
    @Param('groupId') groupId: string,
    @Param('attributeId') attributeId: string,
  ) {
    return this.attributesService.removeAttributeFromGroup(groupId, attributeId);
  }

  @Delete('groups/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteAttributeGroup(@Param('id') id: string) {
    return this.attributesService.deleteAttributeGroup(id);
  }

  // ============================================
  // ATTRIBUTE SETS
  // ============================================

  @Post('sets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async createAttributeSet(@Body() dto: CreateAttributeSetDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.attributesService.createAttributeSet(dto, userId);
  }

  @Get('sets')
  async getAttributeSets(@Query('categoryId') categoryId?: string) {
    return this.attributesService.getAttributeSets(categoryId);
  }

  @Get('sets/:id')
  async getAttributeSet(@Param('id') id: string) {
    return this.attributesService.getAttributeSet(id);
  }

  @Put('sets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async updateAttributeSet(@Param('id') id: string, @Body() dto: UpdateAttributeSetDto) {
    return this.attributesService.updateAttributeSet(id, dto);
  }

  @Delete('sets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async deleteAttributeSet(@Param('id') id: string) {
    return this.attributesService.deleteAttributeSet(id);
  }

  // ============================================
  // PRODUCT ATTRIBUTES
  // ============================================

  @Post('products/set')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async setProductAttribute(@Body() dto: SetProductAttributeDto) {
    return this.attributesService.setProductAttribute(dto);
  }

  @Post('products/set-multiple')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async setProductAttributes(@Body() dto: SetProductAttributesDto) {
    return this.attributesService.setProductAttributes(dto);
  }

  @Post('products/set-bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async bulkSetProductAttributes(@Body() dto: BulkSetProductAttributesDto) {
    return this.attributesService.bulkSetProductAttributes(dto);
  }

  @Get('products/:productId')
  async getProductAttributes(
    @Param('productId') productId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.attributesService.getProductAttributes(productId, variantId);
  }

  @Delete('products/:productId/:attributeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async removeProductAttribute(
    @Param('productId') productId: string,
    @Param('attributeId') attributeId: string,
    @Query('variantId') variantId?: string,
  ) {
    return this.attributesService.removeProductAttribute(productId, attributeId, variantId);
  }

  // ============================================
  // PRODUCT VARIANTS
  // ============================================

  @Post('variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async createProductVariant(@Body() dto: CreateProductVariantDto) {
    return this.attributesService.createProductVariant(dto);
  }

  @Get('variants/product/:productId')
  async getProductVariants(@Param('productId') productId: string) {
    return this.attributesService.getProductVariants(productId);
  }

  @Get('variants/:variantId')
  async getProductVariant(@Param('variantId') variantId: string) {
    return this.attributesService.getProductVariant(variantId);
  }

  @Put('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async updateProductVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.attributesService.updateProductVariant(variantId, dto);
  }

  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async deleteProductVariant(@Param('variantId') variantId: string) {
    return this.attributesService.deleteProductVariant(variantId);
  }

  @Post('variants/generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER, UserRole.SHOP_ADMIN)
  async generateVariants(@Body() dto: GenerateVariantsDto) {
    return this.attributesService.generateVariants(dto);
  }

  // ============================================
  // CATEGORY-ATTRIBUTE MAPPING
  // ============================================

  @Post('categories/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignAttributesToCategory(@Body() dto: AssignAttributesToCategoryDto) {
    return this.attributesService.assignAttributesToCategory(dto);
  }

  @Get('categories/:categoryId')
  async getCategoryAttributes(
    @Param('categoryId') categoryId: string,
    @Query('includeInherited') includeInherited?: string,
    @Query('filterableOnly') filterableOnly?: string,
    @Query('variantOnly') variantOnly?: string,
  ) {
    return this.attributesService.getCategoryAttributes({
      categoryId,
      includeInherited: includeInherited === 'true',
      filterableOnly: filterableOnly === 'true',
      variantOnly: variantOnly === 'true',
    });
  }

  @Delete('categories/:categoryId/:attributeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeCategoryAttribute(
    @Param('categoryId') categoryId: string,
    @Param('attributeId') attributeId: string,
  ) {
    return this.attributesService.removeCategoryAttribute(categoryId, attributeId);
  }

  // ============================================
  // IMPORT/EXPORT
  // ============================================

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async importAttributes(@Body() dto: ImportAttributesDto, @Req() req: any) {
    const userId = req.user.sub || req.user.userId;
    return this.attributesService.importAttributes(dto, userId);
  }

  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.VENDOR, UserRole.SHOP_OWNER)
  async exportAttributes(@Body() dto: ExportAttributesDto) {
    return this.attributesService.exportAttributes(dto);
  }
}
