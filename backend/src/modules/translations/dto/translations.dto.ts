import { IsString, IsOptional, IsObject, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TranslatableEntityType {
  PRODUCT = 'product',
  CATEGORY = 'category',
}

export class TranslatedFieldsDto {
  @ApiPropertyOptional({ description: 'Translated name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Translated description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Translated short description' })
  @IsOptional()
  @IsString()
  short_description?: string;

  @ApiPropertyOptional({ description: 'Translated meta title for SEO' })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({ description: 'Translated meta description for SEO' })
  @IsOptional()
  @IsString()
  meta_description?: string;
}

export class SetTranslationDto {
  @ApiProperty({ description: 'Locale code (e.g. en, ja, fr)', example: 'ja' })
  @IsString()
  locale: string;

  @ApiProperty({ description: 'Translated fields', type: TranslatedFieldsDto })
  @IsObject()
  fields: TranslatedFieldsDto;
}

export class AutoTranslateDto {
  @ApiProperty({ description: 'Target locale to translate into', example: 'ja' })
  @IsString()
  targetLocale: string;

  @ApiPropertyOptional({ description: 'Source locale to translate from (defaults to en)', example: 'en' })
  @IsOptional()
  @IsString()
  sourceLocale?: string;
}
