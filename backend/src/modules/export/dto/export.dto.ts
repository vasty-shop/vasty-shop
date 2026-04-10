import { IsEnum, IsOptional, IsString, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ExportType {
  PRODUCTS = 'products',
  ORDERS = 'orders',
  CUSTOMERS = 'customers',
  CATEGORIES = 'categories',
  REVIEWS = 'reviews',
  COUPONS = 'coupons',
  CAMPAIGNS = 'campaigns',
  SHOPS = 'shops',
}

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
}

export class ExportRequestDto {
  @ApiProperty({ enum: ExportType, description: 'Type of data to export' })
  @IsEnum(ExportType)
  type: ExportType;

  @ApiPropertyOptional({ enum: ExportFormat, default: ExportFormat.CSV })
  @IsOptional()
  @IsEnum(ExportFormat)
  format?: ExportFormat = ExportFormat.CSV;

  @ApiPropertyOptional({ description: 'Shop ID to filter by (for vendors)' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Start date for date range filter' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for date range filter' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Status filter' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Category ID filter' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Specific columns to include', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  columns?: string[];
}

export class ImportRequestDto {
  @ApiProperty({ enum: ExportType, description: 'Type of data to import' })
  @IsEnum(ExportType)
  type: ExportType;

  @ApiPropertyOptional({ description: 'Shop ID for vendor imports' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiPropertyOptional({ description: 'Whether to update existing records', default: false })
  @IsOptional()
  updateExisting?: boolean = false;

  @ApiPropertyOptional({ description: 'Whether to skip errors and continue', default: true })
  @IsOptional()
  skipErrors?: boolean = true;
}

export class ImportResultDto {
  @ApiProperty()
  totalRows: number;

  @ApiProperty()
  successCount: number;

  @ApiProperty()
  failedCount: number;

  @ApiProperty()
  skippedCount: number;

  @ApiProperty({ type: [Object] })
  errors: Array<{ row: number; field?: string; message: string }>;

  @ApiProperty({ type: [String] })
  createdIds: string[];

  @ApiProperty({ type: [String] })
  updatedIds: string[];
}

export class ExportTemplateDto {
  @ApiProperty({ enum: ExportType })
  @IsEnum(ExportType)
  type: ExportType;
}
