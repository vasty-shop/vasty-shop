import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, Min, Max } from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum AttributeType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DECIMAL = 'decimal',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  BOOLEAN = 'boolean',
  DATE = 'date',
  DATETIME = 'datetime',
  COLOR = 'color',
  IMAGE = 'image',
  FILE = 'file',
  RANGE = 'range',
  DIMENSIONS = 'dimensions',
  WEIGHT = 'weight',
}

export enum AttributeScope {
  GLOBAL = 'global',
  CATEGORY = 'category',
  SHOP = 'shop',
}

export enum AttributeDisplayLocation {
  PRODUCT_PAGE = 'product_page',
  PRODUCT_CARD = 'product_card',
  FILTERS = 'filters',
  COMPARISON = 'comparison',
  SEARCH = 'search',
  ALL = 'all',
}

export enum VariantGenerationType {
  MANUAL = 'manual',
  AUTO = 'auto',
}

// ============================================
// HELPER DTOs (must be defined first)
// ============================================

export class AttributeValidationDto {
  @IsOptional()
  @IsNumber()
  minLength?: number;

  @IsOptional()
  @IsNumber()
  maxLength?: number;

  @IsOptional()
  @IsNumber()
  min?: number;

  @IsOptional()
  @IsNumber()
  max?: number;

  @IsOptional()
  @IsString()
  pattern?: string; // Regex pattern

  @IsOptional()
  @IsArray()
  allowedFileTypes?: string[]; // For file/image attributes

  @IsOptional()
  @IsNumber()
  maxFileSize?: number; // In bytes

  @IsOptional()
  @IsNumber()
  decimalPlaces?: number;
}

export class AttributeOptionDto {
  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  colorCode?: string; // For color swatches

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class DimensionsDto {
  @IsNumber()
  length: number;

  @IsNumber()
  width: number;

  @IsNumber()
  height: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

// ============================================
// ATTRIBUTE DEFINITION DTOs
// ============================================

export class CreateAttributeDto {
  @IsString()
  name: string;

  @IsString()
  code: string; // Unique identifier like 'color', 'size', 'material'

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AttributeType)
  type: AttributeType;

  @IsOptional()
  @IsEnum(AttributeScope)
  scope?: AttributeScope;

  @IsOptional()
  @IsArray()
  categoryIds?: string[]; // If scope is 'category'

  @IsOptional()
  @IsString()
  shopId?: string; // If scope is 'shop'

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @IsOptional()
  @IsBoolean()
  isComparable?: boolean;

  @IsOptional()
  @IsBoolean()
  isVariant?: boolean; // Can be used for product variants

  @IsOptional()
  @IsBoolean()
  showOnProductPage?: boolean;

  @IsOptional()
  @IsBoolean()
  showOnProductCard?: boolean;

  @IsOptional()
  @IsArray()
  displayLocations?: AttributeDisplayLocation[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  validation?: AttributeValidationDto;

  @IsOptional()
  @IsArray()
  options?: AttributeOptionDto[]; // For select/multiselect

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsString()
  unit?: string; // kg, cm, inch, etc.

  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateAttributeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @IsOptional()
  @IsBoolean()
  isSearchable?: boolean;

  @IsOptional()
  @IsBoolean()
  isComparable?: boolean;

  @IsOptional()
  @IsBoolean()
  isVariant?: boolean;

  @IsOptional()
  @IsArray()
  displayLocations?: AttributeDisplayLocation[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  validation?: AttributeValidationDto;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// ATTRIBUTE GROUP DTOs
// ============================================

export class CreateAttributeGroupDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  attributeIds?: string[];

  @IsOptional()
  @IsArray()
  categoryIds?: string[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCollapsible?: boolean;

  @IsOptional()
  @IsBoolean()
  isCollapsedByDefault?: boolean;
}

export class UpdateAttributeGroupDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isCollapsible?: boolean;

  @IsOptional()
  @IsBoolean()
  isCollapsedByDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AddAttributesToGroupDto {
  @IsArray()
  attributeIds: string[];
}

export class ReorderAttributesInGroupDto {
  @IsArray()
  attributeOrders: { attributeId: string; sortOrder: number }[];
}

// ============================================
// ATTRIBUTE SET DTOs (Templates)
// ============================================

export class CreateAttributeSetDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  categoryIds?: string[];

  @IsArray()
  groups: AttributeSetGroupDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class AttributeSetGroupDto {
  @IsString()
  groupId: string;

  @IsArray()
  attributeIds: string[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateAttributeSetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  groups?: AttributeSetGroupDto[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// PRODUCT ATTRIBUTE VALUE DTOs
// ============================================

export class SetProductAttributeDto {
  @IsString()
  productId: string;

  @IsString()
  attributeId: string;

  value: any; // Type depends on attribute type

  @IsOptional()
  @IsString()
  variantId?: string;
}

export class SetProductAttributesDto {
  @IsString()
  productId: string;

  @IsArray()
  attributes: ProductAttributeValueDto[];
}

export class ProductAttributeValueDto {
  @IsString()
  attributeId: string;

  value: any;

  @IsOptional()
  @IsString()
  variantId?: string;
}

export class BulkSetProductAttributesDto {
  @IsArray()
  products: SetProductAttributesDto[];
}

// ============================================
// VARIANT DTOs
// ============================================

export class CreateVariantAttributesDto {
  @IsString()
  productId: string;

  @IsArray()
  variantAttributes: string[]; // Attribute IDs to use for variants

  @IsOptional()
  @IsEnum(VariantGenerationType)
  generationType?: VariantGenerationType;
}

export class GenerateVariantsDto {
  @IsString()
  productId: string;

  @IsArray()
  attributeCombinations: AttributeCombinationDto[];
}

export class AttributeCombinationDto {
  @IsString()
  attributeId: string;

  @IsArray()
  values: string[];
}

export class CreateProductVariantDto {
  @IsString()
  productId: string;

  @IsArray()
  attributeValues: VariantAttributeValueDto[];

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  dimensions?: DimensionsDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class VariantAttributeValueDto {
  @IsString()
  attributeId: string;

  @IsString()
  value: string;
}

export class UpdateProductVariantDto {
  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  dimensions?: DimensionsDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// FILTER DTOs
// ============================================

export class AttributeFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(AttributeType)
  type?: AttributeType;

  @IsOptional()
  @IsEnum(AttributeScope)
  scope?: AttributeScope;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @IsOptional()
  @IsBoolean()
  isVariant?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class ProductAttributeFilterDto {
  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsArray()
  attributeFilters?: AttributeFilterValueDto[];

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}

export class AttributeFilterValueDto {
  @IsString()
  attributeId: string;

  @IsOptional()
  @IsArray()
  values?: string[]; // For select/multiselect

  @IsOptional()
  @IsNumber()
  min?: number; // For range

  @IsOptional()
  @IsNumber()
  max?: number;
}

// ============================================
// IMPORT/EXPORT DTOs
// ============================================

export class ImportAttributesDto {
  @IsArray()
  attributes: CreateAttributeDto[];

  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;
}

export class ExportAttributesDto {
  @IsOptional()
  @IsArray()
  attributeIds?: string[];

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  format?: 'json' | 'csv';
}

// ============================================
// OPTION MANAGEMENT DTOs
// ============================================

export class AddAttributeOptionsDto {
  @IsString()
  attributeId: string;

  @IsArray()
  options: AttributeOptionDto[];
}

export class UpdateAttributeOptionDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  colorCode?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class ReorderAttributeOptionsDto {
  @IsString()
  attributeId: string;

  @IsArray()
  optionOrders: { optionId: string; sortOrder: number }[];
}

// ============================================
// CATEGORY-ATTRIBUTE MAPPING DTOs
// ============================================

export class AssignAttributesToCategoryDto {
  @IsString()
  categoryId: string;

  @IsArray()
  attributeIds: string[];

  @IsOptional()
  @IsBoolean()
  inherit?: boolean; // Apply to subcategories
}

export class GetCategoryAttributesDto {
  @IsString()
  categoryId: string;

  @IsOptional()
  @IsBoolean()
  includeInherited?: boolean;

  @IsOptional()
  @IsBoolean()
  filterableOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  variantOnly?: boolean;
}
