import { IsString, IsOptional, IsBoolean, IsObject, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LanguageDirection {
  LTR = 'ltr',
  RTL = 'rtl',
}

// ============================================
// LANGUAGE DTOs
// ============================================

export class CreateLanguageDto {
  @ApiProperty({ description: 'Language code (e.g., en, es, ar, fr)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Language name (e.g., English, Spanish)' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Native name (e.g., English, Español)' })
  @IsString()
  nativeName: string;

  @ApiPropertyOptional({ enum: LanguageDirection, default: LanguageDirection.LTR })
  @IsOptional()
  @IsEnum(LanguageDirection)
  direction?: LanguageDirection;

  @ApiPropertyOptional({ description: 'Flag emoji or icon URL' })
  @IsOptional()
  @IsString()
  flag?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateLanguageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nativeName?: string;

  @ApiPropertyOptional({ enum: LanguageDirection })
  @IsOptional()
  @IsEnum(LanguageDirection)
  direction?: LanguageDirection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  flag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

// ============================================
// TRANSLATION DTOs
// ============================================

export class CreateTranslationDto {
  @ApiProperty({ description: 'Language code' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Translation namespace (e.g., common, product, checkout)' })
  @IsString()
  namespace: string;

  @ApiProperty({ description: 'Translation key' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Translated value' })
  @IsString()
  value: string;
}

export class UpdateTranslationDto {
  @ApiProperty({ description: 'Translated value' })
  @IsString()
  value: string;
}

export class BulkTranslationDto {
  @ApiProperty({ description: 'Language code' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Namespace' })
  @IsString()
  namespace: string;

  @ApiProperty({ description: 'Key-value pairs of translations' })
  @IsObject()
  translations: Record<string, string>;
}

export class ImportTranslationsDto {
  @ApiProperty({ description: 'Language code' })
  @IsString()
  languageCode: string;

  @ApiPropertyOptional({ description: 'Overwrite existing translations' })
  @IsOptional()
  @IsBoolean()
  overwrite?: boolean;

  @ApiProperty({ description: 'Translations by namespace' })
  @IsObject()
  data: Record<string, Record<string, string>>;
}

// ============================================
// CONTENT TRANSLATION DTOs
// ============================================

export class TranslateContentDto {
  @ApiProperty({ description: 'Entity type (product, category, shop, page)' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  entityId: string;

  @ApiProperty({ description: 'Language code' })
  @IsString()
  languageCode: string;

  @ApiProperty({ description: 'Field translations' })
  @IsObject()
  fields: Record<string, string>;
}

export class GetContentTranslationDto {
  @ApiProperty({ description: 'Entity type' })
  @IsString()
  entityType: string;

  @ApiProperty({ description: 'Entity ID' })
  @IsString()
  entityId: string;

  @ApiPropertyOptional({ description: 'Language code (returns all if not specified)' })
  @IsOptional()
  @IsString()
  languageCode?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class LanguageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  nativeName: string;

  @ApiProperty()
  direction: string;

  @ApiProperty()
  flag: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isDefault: boolean;

  @ApiProperty()
  translationProgress: number;

  @ApiProperty()
  createdAt: string;
}

export class TranslationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  languageCode: string;

  @ApiProperty()
  namespace: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  updatedAt: string;
}

export class TranslationExportDto {
  @ApiProperty()
  language: LanguageResponseDto;

  @ApiProperty()
  translations: Record<string, Record<string, string>>;

  @ApiProperty()
  exportedAt: string;
}
