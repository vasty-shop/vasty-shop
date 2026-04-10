import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateAttributeDto,
  UpdateAttributeDto,
  AttributeOptionDto,
  CreateAttributeGroupDto,
  UpdateAttributeGroupDto,
  AddAttributesToGroupDto,
  ReorderAttributesInGroupDto,
  CreateAttributeSetDto,
  UpdateAttributeSetDto,
  SetProductAttributeDto,
  SetProductAttributesDto,
  BulkSetProductAttributesDto,
  CreateVariantAttributesDto,
  GenerateVariantsDto,
  CreateProductVariantDto,
  UpdateProductVariantDto,
  AttributeFilterDto,
  ProductAttributeFilterDto,
  ImportAttributesDto,
  ExportAttributesDto,
  AddAttributeOptionsDto,
  UpdateAttributeOptionDto,
  ReorderAttributeOptionsDto,
  AssignAttributesToCategoryDto,
  GetCategoryAttributesDto,
  AttributeType,
  AttributeScope,
} from './dto/attributes.dto';

@Injectable()
export class AttributesService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // ATTRIBUTE CRUD
  // ============================================

  async createAttribute(dto: CreateAttributeDto, userId: string) {
    // Check if code already exists
    const existing = await this.db.query_builder()
      .from('attributes')
      .select('id')
      .where('code', dto.code)
      .get();

    if (existing.length > 0) {
      throw new ConflictException(`Attribute with code "${dto.code}" already exists`);
    }

    const attribute = await this.db.query_builder()
      .from('attributes')
      .insert({
        name: dto.name,
        code: dto.code,
        description: dto.description,
        type: dto.type,
        scope: dto.scope || AttributeScope.GLOBAL,
        category_ids: JSON.stringify(dto.categoryIds || []),
        shop_id: dto.shopId,
        is_required: dto.isRequired || false,
        is_filterable: dto.isFilterable || false,
        is_searchable: dto.isSearchable || false,
        is_comparable: dto.isComparable || false,
        is_variant: dto.isVariant || false,
        show_on_product_page: dto.showOnProductPage !== false,
        show_on_product_card: dto.showOnProductCard || false,
        display_locations: JSON.stringify(dto.displayLocations || ['product_page']),
        sort_order: dto.sortOrder || 0,
        validation: JSON.stringify(dto.validation || {}),
        options: JSON.stringify(dto.options || []),
        default_value: dto.defaultValue,
        unit: dto.unit,
        icon: dto.icon,
        is_active: true,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatAttribute(attribute[0]);
  }

  async getAttributes(dto: AttributeFilterDto) {
    let query = this.db.query_builder()
      .from('attributes')
      .select('*');

    if (dto.search) {
      query = query.where('name', 'LIKE', `%${dto.search}%`);
    }
    if (dto.type) {
      query = query.where('type', dto.type);
    }
    if (dto.scope) {
      query = query.where('scope', dto.scope);
    }
    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.isFilterable !== undefined) {
      query = query.where('is_filterable', dto.isFilterable);
    }
    if (dto.isVariant !== undefined) {
      query = query.where('is_variant', dto.isVariant);
    }
    if (dto.isActive !== undefined) {
      query = query.where('is_active', dto.isActive);
    }

    query = query.orderBy('sort_order', 'ASC');

    if (dto.limit) {
      const page = dto.page || 1;
      const offset = (page - 1) * dto.limit;
      query = query.limit(dto.limit).offset(offset);
    }

    const attributes = await query.get();

    // Filter by category if specified (need to check JSON array)
    let filtered = attributes;
    if (dto.categoryId) {
      filtered = attributes.filter((a: any) => {
        const categoryIds = JSON.parse(a.category_ids || '[]');
        return categoryIds.length === 0 || categoryIds.includes(dto.categoryId);
      });
    }

    return filtered.map(this.formatAttribute);
  }

  async getAttribute(id: string) {
    const attributes = await this.db.query_builder()
      .from('attributes')
      .select('*')
      .where('id', id)
      .get();

    if (attributes.length === 0) {
      throw new NotFoundException('Attribute not found');
    }

    return this.formatAttribute(attributes[0]);
  }

  async getAttributeByCode(code: string) {
    const attributes = await this.db.query_builder()
      .from('attributes')
      .select('*')
      .where('code', code)
      .get();

    if (attributes.length === 0) {
      throw new NotFoundException('Attribute not found');
    }

    return this.formatAttribute(attributes[0]);
  }

  async updateAttribute(id: string, dto: UpdateAttributeDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.isRequired !== undefined) updateData.is_required = dto.isRequired;
    if (dto.isFilterable !== undefined) updateData.is_filterable = dto.isFilterable;
    if (dto.isSearchable !== undefined) updateData.is_searchable = dto.isSearchable;
    if (dto.isComparable !== undefined) updateData.is_comparable = dto.isComparable;
    if (dto.isVariant !== undefined) updateData.is_variant = dto.isVariant;
    if (dto.displayLocations) updateData.display_locations = JSON.stringify(dto.displayLocations);
    if (dto.sortOrder !== undefined) updateData.sort_order = dto.sortOrder;
    if (dto.validation) updateData.validation = JSON.stringify(dto.validation);
    if (dto.defaultValue !== undefined) updateData.default_value = dto.defaultValue;
    if (dto.unit !== undefined) updateData.unit = dto.unit;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await this.db.query_builder()
      .from('attributes')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatAttribute(result[0]);
  }

  async deleteAttribute(id: string) {
    // Check if used by products
    const values = await this.db.query_builder()
      .from('product_attribute_values')
      .select('id')
      .where('attribute_id', id)
      .limit(1)
      .get();

    if (values.length > 0) {
      throw new ConflictException('Cannot delete attribute that is used by products');
    }

    await this.db.query_builder()
      .from('attributes')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // ATTRIBUTE OPTIONS
  // ============================================

  async addAttributeOptions(dto: AddAttributeOptionsDto) {
    const attribute = await this.getAttribute(dto.attributeId);
    const existingOptions = attribute.options || [];

    // Merge options
    const newOptions = [...existingOptions, ...dto.options];

    await this.db.query_builder()
      .from('attributes')
      .where('id', dto.attributeId)
      .update({
        options: JSON.stringify(newOptions),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return this.getAttribute(dto.attributeId);
  }

  async updateAttributeOption(attributeId: string, optionValue: string, dto: UpdateAttributeOptionDto) {
    const attribute = await this.getAttribute(attributeId);
    const options = attribute.options || [];

    const optionIndex = options.findIndex((o: any) => o.value === optionValue);
    if (optionIndex === -1) {
      throw new NotFoundException('Option not found');
    }

    // Update option
    if (dto.value !== undefined) options[optionIndex].value = dto.value;
    if (dto.label !== undefined) options[optionIndex].label = dto.label;
    if (dto.colorCode !== undefined) options[optionIndex].colorCode = dto.colorCode;
    if (dto.imageUrl !== undefined) options[optionIndex].imageUrl = dto.imageUrl;
    if (dto.sortOrder !== undefined) options[optionIndex].sortOrder = dto.sortOrder;

    await this.db.query_builder()
      .from('attributes')
      .where('id', attributeId)
      .update({
        options: JSON.stringify(options),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return this.getAttribute(attributeId);
  }

  async deleteAttributeOption(attributeId: string, optionValue: string) {
    const attribute = await this.getAttribute(attributeId);
    const options = (attribute.options || []).filter((o: any) => o.value !== optionValue);

    await this.db.query_builder()
      .from('attributes')
      .where('id', attributeId)
      .update({
        options: JSON.stringify(options),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  async reorderAttributeOptions(dto: ReorderAttributeOptionsDto) {
    const attribute = await this.getAttribute(dto.attributeId);
    const options = attribute.options || [];

    // Update sort orders
    const orderMap = new Map(dto.optionOrders.map(o => [o.optionId, o.sortOrder]));
    options.forEach((option: any) => {
      if (orderMap.has(option.value)) {
        option.sortOrder = orderMap.get(option.value);
      }
    });

    // Sort
    options.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

    await this.db.query_builder()
      .from('attributes')
      .where('id', dto.attributeId)
      .update({
        options: JSON.stringify(options),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return this.getAttribute(dto.attributeId);
  }

  // ============================================
  // ATTRIBUTE GROUPS
  // ============================================

  async createAttributeGroup(dto: CreateAttributeGroupDto, userId: string) {
    const group = await this.db.query_builder()
      .from('attribute_groups')
      .insert({
        name: dto.name,
        code: dto.code,
        description: dto.description,
        attribute_ids: JSON.stringify(dto.attributeIds || []),
        category_ids: JSON.stringify(dto.categoryIds || []),
        sort_order: dto.sortOrder || 0,
        is_collapsible: dto.isCollapsible || false,
        is_collapsed_by_default: dto.isCollapsedByDefault || false,
        is_active: true,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatAttributeGroup(group[0]);
  }

  async getAttributeGroups(categoryId?: string) {
    let query = this.db.query_builder()
      .from('attribute_groups')
      .select('*')
      .where('is_active', true)
      .orderBy('sort_order', 'ASC');

    const groups = await query.get();

    // Filter by category if specified
    let filtered = groups;
    if (categoryId) {
      filtered = groups.filter((g: any) => {
        const categoryIds = JSON.parse(g.category_ids || '[]');
        return categoryIds.length === 0 || categoryIds.includes(categoryId);
      });
    }

    return filtered.map(this.formatAttributeGroup);
  }

  async getAttributeGroup(id: string) {
    const groups = await this.db.query_builder()
      .from('attribute_groups')
      .select('*')
      .where('id', id)
      .get();

    if (groups.length === 0) {
      throw new NotFoundException('Attribute group not found');
    }

    const group = this.formatAttributeGroup(groups[0]);

    // Load attributes in the group
    if (group.attributeIds.length > 0) {
      const attributes = await this.db.query_builder()
        .from('attributes')
        .select('*')
        .whereIn('id', group.attributeIds)
        .get();

      group.attributes = attributes.map(this.formatAttribute);
    }

    return group;
  }

  async updateAttributeGroup(id: string, dto: UpdateAttributeGroupDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.sortOrder !== undefined) updateData.sort_order = dto.sortOrder;
    if (dto.isCollapsible !== undefined) updateData.is_collapsible = dto.isCollapsible;
    if (dto.isCollapsedByDefault !== undefined) updateData.is_collapsed_by_default = dto.isCollapsedByDefault;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await this.db.query_builder()
      .from('attribute_groups')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatAttributeGroup(result[0]);
  }

  async addAttributesToGroup(id: string, dto: AddAttributesToGroupDto) {
    const group = await this.getAttributeGroup(id);
    const existingIds = group.attributeIds || [];
    const newIds = [...new Set([...existingIds, ...dto.attributeIds])];

    await this.db.query_builder()
      .from('attribute_groups')
      .where('id', id)
      .update({
        attribute_ids: JSON.stringify(newIds),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return this.getAttributeGroup(id);
  }

  async removeAttributeFromGroup(groupId: string, attributeId: string) {
    const group = await this.getAttributeGroup(groupId);
    const newIds = (group.attributeIds || []).filter((id: string) => id !== attributeId);

    await this.db.query_builder()
      .from('attribute_groups')
      .where('id', groupId)
      .update({
        attribute_ids: JSON.stringify(newIds),
        updated_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  async deleteAttributeGroup(id: string) {
    await this.db.query_builder()
      .from('attribute_groups')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // ATTRIBUTE SETS
  // ============================================

  async createAttributeSet(dto: CreateAttributeSetDto, userId: string) {
    const set = await this.db.query_builder()
      .from('attribute_sets')
      .insert({
        name: dto.name,
        description: dto.description,
        category_ids: JSON.stringify(dto.categoryIds || []),
        groups: JSON.stringify(dto.groups),
        is_default: dto.isDefault || false,
        is_active: true,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatAttributeSet(set[0]);
  }

  async getAttributeSets(categoryId?: string) {
    let query = this.db.query_builder()
      .from('attribute_sets')
      .select('*')
      .where('is_active', true);

    const sets = await query.get();

    // Filter by category if specified
    let filtered = sets;
    if (categoryId) {
      filtered = sets.filter((s: any) => {
        const categoryIds = JSON.parse(s.category_ids || '[]');
        return categoryIds.length === 0 || categoryIds.includes(categoryId);
      });
    }

    return filtered.map(this.formatAttributeSet);
  }

  async getAttributeSet(id: string) {
    const sets = await this.db.query_builder()
      .from('attribute_sets')
      .select('*')
      .where('id', id)
      .get();

    if (sets.length === 0) {
      throw new NotFoundException('Attribute set not found');
    }

    return this.formatAttributeSet(sets[0]);
  }

  async updateAttributeSet(id: string, dto: UpdateAttributeSetDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.categoryIds) updateData.category_ids = JSON.stringify(dto.categoryIds);
    if (dto.groups) updateData.groups = JSON.stringify(dto.groups);
    if (dto.isDefault !== undefined) updateData.is_default = dto.isDefault;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await this.db.query_builder()
      .from('attribute_sets')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatAttributeSet(result[0]);
  }

  async deleteAttributeSet(id: string) {
    await this.db.query_builder()
      .from('attribute_sets')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // PRODUCT ATTRIBUTE VALUES
  // ============================================

  async setProductAttribute(dto: SetProductAttributeDto) {
    // Check if attribute exists
    const attribute = await this.getAttribute(dto.attributeId);

    // Validate value
    this.validateAttributeValue(attribute, dto.value);

    // Check if value already exists
    let query = this.db.query_builder()
      .from('product_attribute_values')
      .select('id')
      .where('product_id', dto.productId)
      .where('attribute_id', dto.attributeId);

    if (dto.variantId) {
      query = query.where('variant_id', dto.variantId);
    } else {
      query = query.whereNull('variant_id');
    }

    const existing = await query.get();

    if (existing.length > 0) {
      // Update
      const result = await this.db.query_builder()
        .from('product_attribute_values')
        .where('id', existing[0].id)
        .update({
          value: JSON.stringify(dto.value),
          updated_at: new Date().toISOString(),
        })
        .returning('*')
        .execute();

      return result[0];
    } else {
      // Insert
      const result = await this.db.query_builder()
        .from('product_attribute_values')
        .insert({
          product_id: dto.productId,
          attribute_id: dto.attributeId,
          variant_id: dto.variantId,
          value: JSON.stringify(dto.value),
          created_at: new Date().toISOString(),
        })
        .returning('*')
        .execute();

      return result[0];
    }
  }

  async setProductAttributes(dto: SetProductAttributesDto) {
    const results = await Promise.all(
      dto.attributes.map(attr =>
        this.setProductAttribute({
          productId: dto.productId,
          attributeId: attr.attributeId,
          value: attr.value,
          variantId: attr.variantId,
        })
      )
    );

    return results;
  }

  async bulkSetProductAttributes(dto: BulkSetProductAttributesDto) {
    const results = await Promise.all(
      dto.products.map(product => this.setProductAttributes(product))
    );

    return {
      processed: results.length,
      results,
    };
  }

  async getProductAttributes(productId: string, variantId?: string) {
    let query = this.db.query_builder()
      .from('product_attribute_values')
      .select('*')
      .where('product_id', productId);

    if (variantId) {
      query = query.where('variant_id', variantId);
    }

    const values = await query.get();

    // Get attribute details
    const attributeIds = [...new Set(values.map((v: any) => v.attribute_id))];
    if (attributeIds.length === 0) return [];

    const attributes = await this.db.query_builder()
      .from('attributes')
      .select('*')
      .whereIn('id', attributeIds)
      .get();

    const attributeMap = new Map(attributes.map((a: any) => [a.id, this.formatAttribute(a)]));

    return values.map((v: any) => ({
      id: v.id,
      attributeId: v.attribute_id,
      attribute: attributeMap.get(v.attribute_id),
      value: JSON.parse(v.value),
      variantId: v.variant_id,
    }));
  }

  async removeProductAttribute(productId: string, attributeId: string, variantId?: string) {
    let query = this.db.query_builder()
      .from('product_attribute_values')
      .where('product_id', productId)
      .where('attribute_id', attributeId);

    if (variantId) {
      query = query.where('variant_id', variantId);
    }

    await query.delete().execute();

    return { success: true };
  }

  // ============================================
  // PRODUCT VARIANTS
  // ============================================

  async createProductVariant(dto: CreateProductVariantDto) {
    // Generate SKU if not provided
    const sku = dto.sku || await this.generateVariantSKU(dto.productId, dto.attributeValues);

    const variant = await this.db.query_builder()
      .from('product_variants')
      .insert({
        product_id: dto.productId,
        sku,
        price: dto.price,
        stock: dto.stock || 0,
        barcode: dto.barcode,
        images: JSON.stringify(dto.images || []),
        weight: dto.weight,
        dimensions: JSON.stringify(dto.dimensions || {}),
        is_active: dto.isActive !== false,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    const variantId = variant[0].id;

    // Set attribute values for variant
    await Promise.all(
      dto.attributeValues.map(av =>
        this.setProductAttribute({
          productId: dto.productId,
          attributeId: av.attributeId,
          value: av.value,
          variantId,
        })
      )
    );

    return this.getProductVariant(variantId);
  }

  async getProductVariants(productId: string) {
    const variants = await this.db.query_builder()
      .from('product_variants')
      .select('*')
      .where('product_id', productId)
      .where('is_active', true)
      .get();

    // Get attribute values for each variant
    const variantsWithAttributes = await Promise.all(
      variants.map(async (v: any) => {
        const attributes = await this.getProductAttributes(productId, v.id);
        return {
          ...this.formatVariant(v),
          attributes,
        };
      })
    );

    return variantsWithAttributes;
  }

  async getProductVariant(variantId: string) {
    const variants = await this.db.query_builder()
      .from('product_variants')
      .select('*')
      .where('id', variantId)
      .get();

    if (variants.length === 0) {
      throw new NotFoundException('Variant not found');
    }

    const variant = this.formatVariant(variants[0]);
    variant.attributes = await this.getProductAttributes(variant.productId, variantId);

    return variant;
  }

  async updateProductVariant(variantId: string, dto: UpdateProductVariantDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.sku) updateData.sku = dto.sku;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.stock !== undefined) updateData.stock = dto.stock;
    if (dto.barcode !== undefined) updateData.barcode = dto.barcode;
    if (dto.images) updateData.images = JSON.stringify(dto.images);
    if (dto.weight !== undefined) updateData.weight = dto.weight;
    if (dto.dimensions) updateData.dimensions = JSON.stringify(dto.dimensions);
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    const result = await this.db.query_builder()
      .from('product_variants')
      .where('id', variantId)
      .update(updateData)
      .returning('*')
      .execute();

    return this.getProductVariant(variantId);
  }

  async deleteProductVariant(variantId: string) {
    // Get variant first
    const variant = await this.getProductVariant(variantId);

    // Delete attribute values
    await this.db.query_builder()
      .from('product_attribute_values')
      .where('variant_id', variantId)
      .delete()
      .execute();

    // Delete variant
    await this.db.query_builder()
      .from('product_variants')
      .where('id', variantId)
      .delete()
      .execute();

    return { success: true };
  }

  async generateVariants(dto: GenerateVariantsDto) {
    // Get all combinations
    const combinations = this.generateCombinations(dto.attributeCombinations);

    const variants = await Promise.all(
      combinations.map(async (combo) => {
        return this.createProductVariant({
          productId: dto.productId,
          attributeValues: combo,
        });
      })
    );

    return {
      generated: variants.length,
      variants,
    };
  }

  private generateCombinations(attributeCombinations: { attributeId: string; values: string[] }[]): { attributeId: string; value: string }[][] {
    if (attributeCombinations.length === 0) return [];
    if (attributeCombinations.length === 1) {
      return attributeCombinations[0].values.map(v => [{ attributeId: attributeCombinations[0].attributeId, value: v }]);
    }

    const [first, ...rest] = attributeCombinations;
    const restCombinations = this.generateCombinations(rest);

    const result: { attributeId: string; value: string }[][] = [];
    for (const value of first.values) {
      for (const combo of restCombinations) {
        result.push([{ attributeId: first.attributeId, value }, ...combo]);
      }
    }

    return result;
  }

  private async generateVariantSKU(productId: string, attributeValues: { attributeId: string; value: string }[]): Promise<string> {
    // Get product SKU
    const products = await this.db.query_builder()
      .from('products')
      .select('sku')
      .where('id', productId)
      .get();

    const baseSku = products[0]?.sku || productId.substring(0, 8);
    const valuePart = attributeValues.map(av => av.value.substring(0, 3).toUpperCase()).join('-');

    return `${baseSku}-${valuePart}`;
  }

  // ============================================
  // CATEGORY-ATTRIBUTE MAPPING
  // ============================================

  async assignAttributesToCategory(dto: AssignAttributesToCategoryDto) {
    // Get existing mapping
    const existing = await this.db.query_builder()
      .from('category_attributes')
      .select('*')
      .where('category_id', dto.categoryId)
      .get();

    const existingIds = existing.map((e: any) => e.attribute_id);

    // Add new mappings
    const newIds = dto.attributeIds.filter(id => !existingIds.includes(id));
    if (newIds.length > 0) {
      const mappings = newIds.map(attributeId => ({
        category_id: dto.categoryId,
        attribute_id: attributeId,
        created_at: new Date().toISOString(),
      }));

      await this.db.query_builder()
        .from('category_attributes')
        .insert(mappings)
        .execute();
    }

    // Apply to subcategories if inherit is true
    if (dto.inherit) {
      const subcategories = await this.db.query_builder()
        .from('categories')
        .select('id')
        .where('parent_id', dto.categoryId)
        .get();

      await Promise.all(
        subcategories.map((sub: any) =>
          this.assignAttributesToCategory({
            categoryId: sub.id,
            attributeIds: dto.attributeIds,
            inherit: true,
          })
        )
      );
    }

    return { success: true, added: newIds.length };
  }

  async getCategoryAttributes(dto: GetCategoryAttributesDto) {
    // Get direct mappings
    let query = this.db.query_builder()
      .from('category_attributes')
      .select('attribute_id')
      .where('category_id', dto.categoryId);

    const mappings = await query.get();
    let attributeIds = mappings.map((m: any) => m.attribute_id);

    // Include inherited if requested
    if (dto.includeInherited) {
      const category = await this.db.query_builder()
        .from('categories')
        .select('parent_id')
        .where('id', dto.categoryId)
        .get();

      if (category[0]?.parent_id) {
        const parentAttrs = await this.getCategoryAttributes({
          categoryId: category[0].parent_id,
          includeInherited: true,
        });
        attributeIds = [...new Set([...attributeIds, ...parentAttrs.map((a: any) => a.id)])];
      }
    }

    if (attributeIds.length === 0) return [];

    // Get attributes
    let attrQuery = this.db.query_builder()
      .from('attributes')
      .select('*')
      .whereIn('id', attributeIds)
      .where('is_active', true);

    if (dto.filterableOnly) {
      attrQuery = attrQuery.where('is_filterable', true);
    }
    if (dto.variantOnly) {
      attrQuery = attrQuery.where('is_variant', true);
    }

    const attributes = await attrQuery.orderBy('sort_order', 'ASC').get();

    return attributes.map(this.formatAttribute);
  }

  async removeCategoryAttribute(categoryId: string, attributeId: string) {
    await this.db.query_builder()
      .from('category_attributes')
      .where('category_id', categoryId)
      .where('attribute_id', attributeId)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // FILTERABLE ATTRIBUTES
  // ============================================

  async getFilterableAttributes(categoryId?: string, shopId?: string) {
    let query = this.db.query_builder()
      .from('attributes')
      .select('*')
      .where('is_filterable', true)
      .where('is_active', true);

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    const attributes = await query.orderBy('sort_order', 'ASC').get();

    // Filter by category if specified
    let filtered = attributes;
    if (categoryId) {
      filtered = attributes.filter((a: any) => {
        const categoryIds = JSON.parse(a.category_ids || '[]');
        return categoryIds.length === 0 || categoryIds.includes(categoryId) || a.scope === AttributeScope.GLOBAL;
      });
    }

    return filtered.map(this.formatAttribute);
  }

  async getAttributeFilterValues(attributeId: string, categoryId?: string, shopId?: string) {
    const attribute = await this.getAttribute(attributeId);

    if (attribute.type === AttributeType.SELECT || attribute.type === AttributeType.MULTISELECT) {
      // Return predefined options with counts
      const options = attribute.options || [];

      // Get counts for each option
      const counts = await this.getOptionCounts(attributeId, categoryId, shopId);

      return options.map((opt: any) => ({
        ...opt,
        count: counts[opt.value] || 0,
      }));
    } else if (attribute.type === AttributeType.NUMBER || attribute.type === AttributeType.DECIMAL) {
      // Return min/max range
      const values = await this.db.query_builder()
        .from('product_attribute_values')
        .select('value')
        .where('attribute_id', attributeId)
        .get();

      const numericValues = values.map((v: any) => parseFloat(JSON.parse(v.value))).filter((v: number) => !isNaN(v));

      return {
        min: numericValues.length > 0 ? Math.min(...numericValues) : 0,
        max: numericValues.length > 0 ? Math.max(...numericValues) : 0,
        unit: attribute.unit,
      };
    } else if (attribute.type === AttributeType.COLOR) {
      // Return unique colors
      const values = await this.db.query_builder()
        .from('product_attribute_values')
        .select('value')
        .where('attribute_id', attributeId)
        .get();

      const uniqueColors = [...new Set(values.map((v: any) => JSON.parse(v.value)))];
      return uniqueColors.map(color => ({ value: color, label: color }));
    }

    return [];
  }

  private async getOptionCounts(attributeId: string, categoryId?: string, shopId?: string): Promise<Record<string, number>> {
    const values = await this.db.query_builder()
      .from('product_attribute_values')
      .select('value')
      .where('attribute_id', attributeId)
      .get();

    const counts: Record<string, number> = {};
    values.forEach((v: any) => {
      const val = JSON.parse(v.value);
      counts[val] = (counts[val] || 0) + 1;
    });

    return counts;
  }

  // ============================================
  // IMPORT/EXPORT
  // ============================================

  async importAttributes(dto: ImportAttributesDto, userId: string) {
    const results = {
      created: 0,
      updated: 0,
      errors: [] as any[],
    };

    for (const attr of dto.attributes) {
      try {
        const existing = await this.db.query_builder()
          .from('attributes')
          .select('id')
          .where('code', attr.code)
          .get();

        if (existing.length > 0) {
          if (dto.updateExisting) {
            await this.updateAttribute(existing[0].id, attr as any);
            results.updated++;
          }
        } else {
          await this.createAttribute(attr, userId);
          results.created++;
        }
      } catch (error: any) {
        results.errors.push({ code: attr.code, error: error.message });
      }
    }

    return results;
  }

  async exportAttributes(dto: ExportAttributesDto) {
    let query = this.db.query_builder()
      .from('attributes')
      .select('*');

    if (dto.attributeIds && dto.attributeIds.length > 0) {
      query = query.whereIn('id', dto.attributeIds);
    }
    if (dto.categoryId) {
      // Would need to filter after fetch due to JSON column
    }

    const attributes = await query.get();

    const formatted = attributes.map(this.formatAttribute);

    if (dto.format === 'csv') {
      return this.convertToCSV(formatted);
    }

    return formatted;
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(item => {
      const values = headers.map(h => {
        const val = item[h];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val).includes(',') ? `"${val}"` : val;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  // ============================================
  // HELPERS
  // ============================================

  private validateAttributeValue(attribute: any, value: any): boolean {
    const validation = attribute.validation || {};

    switch (attribute.type) {
      case AttributeType.TEXT:
      case AttributeType.TEXTAREA:
        if (validation.minLength && String(value).length < validation.minLength) {
          throw new BadRequestException(`Value must be at least ${validation.minLength} characters`);
        }
        if (validation.maxLength && String(value).length > validation.maxLength) {
          throw new BadRequestException(`Value must be at most ${validation.maxLength} characters`);
        }
        if (validation.pattern && !new RegExp(validation.pattern).test(String(value))) {
          throw new BadRequestException('Value does not match required pattern');
        }
        break;

      case AttributeType.NUMBER:
      case AttributeType.DECIMAL:
        const numVal = Number(value);
        if (isNaN(numVal)) {
          throw new BadRequestException('Value must be a number');
        }
        if (validation.min !== undefined && numVal < validation.min) {
          throw new BadRequestException(`Value must be at least ${validation.min}`);
        }
        if (validation.max !== undefined && numVal > validation.max) {
          throw new BadRequestException(`Value must be at most ${validation.max}`);
        }
        break;

      case AttributeType.SELECT:
        const options = attribute.options || [];
        const validValues = options.map((o: any) => o.value);
        if (!validValues.includes(value)) {
          throw new BadRequestException('Invalid option selected');
        }
        break;

      case AttributeType.MULTISELECT:
        const msOptions = attribute.options || [];
        const msValidValues = msOptions.map((o: any) => o.value);
        if (!Array.isArray(value)) {
          throw new BadRequestException('Value must be an array');
        }
        for (const v of value) {
          if (!msValidValues.includes(v)) {
            throw new BadRequestException(`Invalid option: ${v}`);
          }
        }
        break;
    }

    return true;
  }

  private formatAttribute(attr: any): any {
    if (!attr) return null;
    return {
      id: attr.id,
      name: attr.name,
      code: attr.code,
      description: attr.description,
      type: attr.type,
      scope: attr.scope,
      categoryIds: JSON.parse(attr.category_ids || '[]'),
      shopId: attr.shop_id,
      isRequired: attr.is_required,
      isFilterable: attr.is_filterable,
      isSearchable: attr.is_searchable,
      isComparable: attr.is_comparable,
      isVariant: attr.is_variant,
      showOnProductPage: attr.show_on_product_page,
      showOnProductCard: attr.show_on_product_card,
      displayLocations: JSON.parse(attr.display_locations || '[]'),
      sortOrder: attr.sort_order,
      validation: JSON.parse(attr.validation || '{}'),
      options: JSON.parse(attr.options || '[]'),
      defaultValue: attr.default_value,
      unit: attr.unit,
      icon: attr.icon,
      isActive: attr.is_active,
      createdAt: attr.created_at,
    };
  }

  private formatAttributeGroup(group: any): any {
    if (!group) return null;
    return {
      id: group.id,
      name: group.name,
      code: group.code,
      description: group.description,
      attributeIds: JSON.parse(group.attribute_ids || '[]'),
      categoryIds: JSON.parse(group.category_ids || '[]'),
      sortOrder: group.sort_order,
      isCollapsible: group.is_collapsible,
      isCollapsedByDefault: group.is_collapsed_by_default,
      isActive: group.is_active,
      createdAt: group.created_at,
    };
  }

  private formatAttributeSet(set: any): any {
    if (!set) return null;
    return {
      id: set.id,
      name: set.name,
      description: set.description,
      categoryIds: JSON.parse(set.category_ids || '[]'),
      groups: JSON.parse(set.groups || '[]'),
      isDefault: set.is_default,
      isActive: set.is_active,
      createdAt: set.created_at,
    };
  }

  private formatVariant(variant: any): any {
    if (!variant) return null;
    return {
      id: variant.id,
      productId: variant.product_id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      barcode: variant.barcode,
      images: JSON.parse(variant.images || '[]'),
      weight: variant.weight,
      dimensions: JSON.parse(variant.dimensions || '{}'),
      isActive: variant.is_active,
      createdAt: variant.created_at,
    };
  }
}
