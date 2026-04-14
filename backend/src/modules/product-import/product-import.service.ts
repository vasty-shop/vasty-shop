import {
  Injectable,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  ImportFileFormat,
  ImportJobStatus,
  ImportResultDto,
  ImportJobStatusDto,
  ImportRowError,
  ParsedProductRow,
  IMPORT_TEMPLATE_COLUMNS,
} from './dto/product-import.dto';

interface ImportJob {
  jobId: string;
  vendorId: string;
  shopId: string;
  status: ImportJobStatus;
  result?: ImportResultDto;
  createdAt: string;
  completedAt?: string;
}

@Injectable()
export class ProductImportService {
  private readonly logger = new Logger(ProductImportService.name);

  // In-memory job store for async imports.
  // In production this should be backed by a database table or Redis.
  private jobs: Map<string, ImportJob> = new Map();

  constructor(private readonly db: DatabaseService) {}

  /**
   * Generate a CSV template with expected columns
   */
  getTemplate(): string {
    const header = IMPORT_TEMPLATE_COLUMNS.join(',');
    const exampleRow = [
      'Example Product',
      '29.99',
      'electronics',
      'A great product',
      'SKU-001',
      '1234567890123',
      '100',
      'https://example.com/img1.jpg,https://example.com/img2.jpg',
      '0.5',
      '10x5x3',
    ].join(',');
    return `${header}\n${exampleRow}\n`;
  }

  /**
   * Import products from an uploaded file (CSV or JSON)
   */
  async importProducts(
    file: Express.Multer.File,
    vendorId: string,
    shopId: string,
    dryRun: boolean,
  ): Promise<ImportResultDto | ImportJobStatusDto> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    const format = this.detectFormat(file);
    const content = file.buffer.toString('utf-8');

    let rows: ParsedProductRow[];
    try {
      rows = format === ImportFileFormat.CSV
        ? this.parseCsv(content)
        : this.parseJson(content);
    } catch (err) {
      throw new BadRequestException(`Failed to parse file: ${err.message}`);
    }

    // For large files (>100 rows), process asynchronously
    const ASYNC_THRESHOLD = 100;
    if (rows.length > ASYNC_THRESHOLD && !dryRun) {
      const jobId = `import_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const job: ImportJob = {
        jobId,
        vendorId,
        shopId,
        status: ImportJobStatus.PENDING,
        createdAt: new Date().toISOString(),
      };
      this.jobs.set(jobId, job);

      // Process in background (non-blocking)
      this.processAsync(job, rows);

      return {
        jobId,
        status: ImportJobStatus.PENDING,
        createdAt: job.createdAt,
      };
    }

    // Process synchronously
    return this.processRows(rows, vendorId, shopId, dryRun);
  }

  /**
   * Check the status of an async import job
   */
  getJobStatus(jobId: string, vendorId: string): ImportJobStatusDto {
    const job = this.jobs.get(jobId);
    if (!job || job.vendorId !== vendorId) {
      throw new BadRequestException('Import job not found');
    }
    return {
      jobId: job.jobId,
      status: job.status,
      result: job.result,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private detectFormat(file: Express.Multer.File): ImportFileFormat {
    const mime = file.mimetype || '';
    const name = (file.originalname || '').toLowerCase();

    if (mime === 'application/json' || name.endsWith('.json')) {
      return ImportFileFormat.JSON;
    }
    if (
      mime === 'text/csv' ||
      mime === 'application/vnd.ms-excel' ||
      name.endsWith('.csv')
    ) {
      return ImportFileFormat.CSV;
    }
    throw new BadRequestException(
      'Unsupported file format. Please upload a CSV or JSON file.',
    );
  }

  /**
   * Parse CSV content into product rows.
   * Handles quoted fields that may contain commas.
   */
  private parseCsv(content: string): ParsedProductRow[] {
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      throw new Error('CSV must have a header row and at least one data row');
    }

    const headers = this.parseCsvLine(lines[0]).map((h) =>
      h.trim().toLowerCase(),
    );
    const rows: ParsedProductRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const row: any = {};
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim() ?? '';
      });
      rows.push(this.mapRowToProduct(row));
    }

    return rows;
  }

  /**
   * Parse a single CSV line, respecting quoted fields.
   */
  private parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  }

  /**
   * Parse JSON content into product rows.
   * Accepts either an array of objects or { products: [...] }.
   */
  private parseJson(content: string): ParsedProductRow[] {
    const parsed = JSON.parse(content);
    const arr = Array.isArray(parsed) ? parsed : parsed.products;
    if (!Array.isArray(arr)) {
      throw new Error(
        'JSON must be an array of products or an object with a "products" array',
      );
    }
    return arr.map((item: any) => this.mapRowToProduct(item));
  }

  /**
   * Map a raw key/value object to a ParsedProductRow, normalising field names.
   */
  private mapRowToProduct(raw: Record<string, any>): ParsedProductRow {
    const getString = (keys: string[]): string | undefined => {
      for (const k of keys) {
        if (raw[k] !== undefined && raw[k] !== '') return String(raw[k]);
      }
      return undefined;
    };
    const getNumber = (keys: string[]): number | undefined => {
      const v = getString(keys);
      if (v === undefined) return undefined;
      const n = Number(v);
      return isNaN(n) ? undefined : n;
    };

    const imagesRaw = getString(['images', 'image_urls', 'image']);
    let images: string[] | undefined;
    if (imagesRaw) {
      if (Array.isArray(raw['images'])) {
        images = raw['images'] as string[];
      } else {
        images = imagesRaw
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean);
      }
    }

    return {
      name: getString(['name', 'product_name', 'title']),
      price: getNumber(['price']),
      category: getString(['category', 'category_id', 'categoryId']),
      description: getString(['description', 'desc']),
      sku: getString(['sku']),
      barcode: getString(['barcode', 'upc', 'ean']),
      stock: getNumber(['stock', 'quantity', 'inventory', 'inventory_quantity']),
      images,
      weight: getNumber(['weight']),
      dimensions: getString(['dimensions']),
    };
  }

  /**
   * Validate a single row and return per-field errors.
   */
  private validateRow(row: ParsedProductRow, rowIndex: number): ImportRowError[] {
    const errors: ImportRowError[] = [];

    if (!row.name || row.name.trim().length === 0) {
      errors.push({ row: rowIndex, field: 'name', message: 'Name is required' });
    }
    if (row.price === undefined || row.price === null) {
      errors.push({ row: rowIndex, field: 'price', message: 'Price is required' });
    } else if (row.price < 0) {
      errors.push({
        row: rowIndex,
        field: 'price',
        message: 'Price must be a non-negative number',
      });
    }
    if (!row.category || row.category.trim().length === 0) {
      errors.push({
        row: rowIndex,
        field: 'category',
        message: 'Category is required',
      });
    }
    if (row.stock !== undefined && row.stock < 0) {
      errors.push({
        row: rowIndex,
        field: 'stock',
        message: 'Stock must be a non-negative number',
      });
    }
    if (row.weight !== undefined && row.weight < 0) {
      errors.push({
        row: rowIndex,
        field: 'weight',
        message: 'Weight must be a non-negative number',
      });
    }

    return errors;
  }

  /**
   * Process rows: validate, skip duplicates, insert products.
   */
  private async processRows(
    rows: ParsedProductRow[],
    vendorId: string,
    shopId: string,
    dryRun: boolean,
  ): Promise<ImportResultDto> {
    const errors: ImportRowError[] = [];
    let imported = 0;
    let skipped = 0;

    // Collect all existing SKUs and barcodes for this shop to detect duplicates
    const existingProducts = await this.db.findMany('products', { shop_id: shopId });
    const existingSkus = new Set<string>();
    const existingBarcodes = new Set<string>();
    for (const p of existingProducts) {
      if (p.sku) existingSkus.add(p.sku);
      if (p.barcode) existingBarcodes.add(p.barcode);
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, accounting for header row

      // Validate
      const rowErrors = this.validateRow(row, rowNum);
      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
        continue;
      }

      // Check for duplicates by SKU or barcode
      if (row.sku && existingSkus.has(row.sku)) {
        skipped++;
        continue;
      }
      if (row.barcode && existingBarcodes.has(row.barcode)) {
        skipped++;
        continue;
      }

      if (dryRun) {
        imported++;
        continue;
      }

      // Build product entity
      try {
        const slug = this.generateSlug(row.name!);
        const images = (row.images || []).map((url, idx) => ({
          url,
          alt: row.name || '',
          isPrimary: idx === 0,
          order: idx,
        }));

        const productData: Record<string, any> = {
          shop_id: shopId,
          name: row.name,
          slug,
          description: row.description || '',
          sku: row.sku || `IMPORT-${Date.now()}-${i}`,
          barcode: row.barcode || null,
          price: row.price,
          stock: row.stock ?? 0,
          category_id: row.category,
          categories: JSON.stringify([row.category]),
          images: JSON.stringify(images),
          weight: row.weight ?? null,
          dimensions: row.dimensions || null,
          status: 'draft',
          product_type: 'physical',
          track_inventory: true,
          low_stock_threshold: 5,
          allow_backorder: false,
          tags: JSON.stringify([]),
          variants: JSON.stringify([]),
          variant_attributes: JSON.stringify([]),
          videos: JSON.stringify([]),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await this.db.insert('products', productData);

        // Track newly added SKU/barcode to avoid in-batch duplicates
        if (row.sku) existingSkus.add(row.sku);
        if (row.barcode) existingBarcodes.add(row.barcode);

        imported++;
      } catch (err) {
        this.logger.error(`Failed to insert product at row ${rowNum}: ${err.message}`);
        errors.push({
          row: rowNum,
          field: 'general',
          message: `Insert failed: ${err.message}`,
        });
      }
    }

    return { imported, skipped, errors };
  }

  /**
   * Process a large import asynchronously in the background.
   */
  private async processAsync(job: ImportJob, rows: ParsedProductRow[]): Promise<void> {
    job.status = ImportJobStatus.PROCESSING;
    try {
      const result = await this.processRows(rows, job.vendorId, job.shopId, false);
      job.result = result;
      job.status = ImportJobStatus.COMPLETED;
      job.completedAt = new Date().toISOString();
    } catch (err) {
      this.logger.error(`Async import job ${job.jobId} failed: ${err.message}`);
      job.status = ImportJobStatus.FAILED;
      job.result = { imported: 0, skipped: 0, errors: [{ row: 0, field: 'general', message: err.message }] };
      job.completedAt = new Date().toISOString();
    }
  }

  private generateSlug(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${base}-${Date.now().toString(36)}`;
  }
}
