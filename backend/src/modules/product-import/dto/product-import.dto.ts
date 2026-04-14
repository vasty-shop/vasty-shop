import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum ImportFileFormat {
  CSV = 'csv',
  JSON = 'json',
}

export enum ImportJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class ImportRowError {
  @ApiProperty({ example: 2 })
  row: number;

  @ApiProperty({ example: 'price' })
  field: string;

  @ApiProperty({ example: 'Price must be a positive number' })
  message: string;
}

export class ImportResultDto {
  @ApiProperty({ example: 15 })
  imported: number;

  @ApiProperty({ example: 2 })
  skipped: number;

  @ApiProperty({ type: [ImportRowError] })
  errors: ImportRowError[];

  @ApiPropertyOptional({ example: 'job_abc123' })
  jobId?: string;
}

export class ImportJobStatusDto {
  @ApiProperty({ example: 'job_abc123' })
  jobId: string;

  @ApiProperty({ enum: ImportJobStatus })
  status: ImportJobStatus;

  @ApiPropertyOptional()
  result?: ImportResultDto;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional()
  completedAt?: string;
}

export interface ParsedProductRow {
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  sku?: string;
  barcode?: string;
  stock?: number;
  images?: string[];
  weight?: number;
  dimensions?: string;
}

export const IMPORT_TEMPLATE_COLUMNS = [
  'name',
  'price',
  'category',
  'description',
  'sku',
  'barcode',
  'stock',
  'images',
  'weight',
  'dimensions',
];
