import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  ExportType,
  ExportFormat,
  ExportRequestDto,
  ImportRequestDto,
  ImportResultDto,
} from './dto/export.dto';

interface ExportColumn {
  key: string;
  header: string;
  transform?: (value: any, row: any) => string;
}

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Column definitions for each export type
   */
  private getColumns(type: ExportType): ExportColumn[] {
    switch (type) {
      case ExportType.PRODUCTS:
        return [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'description', header: 'Description' },
          { key: 'sku', header: 'SKU' },
          { key: 'price', header: 'Price' },
          { key: 'sale_price', header: 'Sale Price' },
          { key: 'cost_price', header: 'Cost Price' },
          { key: 'inventory_quantity', header: 'Stock Quantity' },
          { key: 'category_id', header: 'Category ID' },
          { key: 'shop_id', header: 'Shop ID' },
          { key: 'status', header: 'Status' },
          { key: 'is_featured', header: 'Featured', transform: (v) => v ? 'Yes' : 'No' },
          { key: 'images', header: 'Images', transform: (v) => Array.isArray(v) ? v.join('|') : v },
          { key: 'tags', header: 'Tags', transform: (v) => Array.isArray(v) ? v.join(',') : v },
          { key: 'weight', header: 'Weight' },
          { key: 'dimensions', header: 'Dimensions', transform: (v) => v ? JSON.stringify(v) : '' },
          { key: 'created_at', header: 'Created At' },
          { key: 'updated_at', header: 'Updated At' },
        ];

      case ExportType.ORDERS:
        return [
          { key: 'id', header: 'Order ID' },
          { key: 'order_number', header: 'Order Number' },
          { key: 'user_id', header: 'Customer ID' },
          { key: 'shop_id', header: 'Shop ID' },
          { key: 'status', header: 'Status' },
          { key: 'payment_status', header: 'Payment Status' },
          { key: 'payment_method', header: 'Payment Method' },
          { key: 'subtotal', header: 'Subtotal' },
          { key: 'tax_amount', header: 'Tax' },
          { key: 'shipping_cost', header: 'Shipping Cost' },
          { key: 'discount_amount', header: 'Discount' },
          { key: 'total', header: 'Total' },
          { key: 'currency', header: 'Currency' },
          { key: 'shipping_address', header: 'Shipping Address', transform: (v) => v ? JSON.stringify(v) : '' },
          { key: 'billing_address', header: 'Billing Address', transform: (v) => v ? JSON.stringify(v) : '' },
          { key: 'notes', header: 'Notes' },
          { key: 'created_at', header: 'Order Date' },
          { key: 'updated_at', header: 'Last Updated' },
        ];

      case ExportType.CUSTOMERS:
        return [
          { key: 'id', header: 'Customer ID' },
          { key: 'email', header: 'Email' },
          { key: 'name', header: 'Name' },
          { key: 'phone', header: 'Phone' },
          { key: 'total_orders', header: 'Total Orders' },
          { key: 'total_spent', header: 'Total Spent' },
          { key: 'created_at', header: 'Registered Date' },
          { key: 'last_order_date', header: 'Last Order Date' },
        ];

      case ExportType.CATEGORIES:
        return [
          { key: 'id', header: 'Category ID' },
          { key: 'name', header: 'Name' },
          { key: 'slug', header: 'Slug' },
          { key: 'description', header: 'Description' },
          { key: 'parent_id', header: 'Parent Category ID' },
          { key: 'image', header: 'Image URL' },
          { key: 'is_active', header: 'Active', transform: (v) => v ? 'Yes' : 'No' },
          { key: 'sort_order', header: 'Sort Order' },
          { key: 'created_at', header: 'Created At' },
        ];

      case ExportType.REVIEWS:
        return [
          { key: 'id', header: 'Review ID' },
          { key: 'product_id', header: 'Product ID' },
          { key: 'user_id', header: 'Customer ID' },
          { key: 'rating', header: 'Rating' },
          { key: 'title', header: 'Title' },
          { key: 'comment', header: 'Comment' },
          { key: 'status', header: 'Status' },
          { key: 'is_verified', header: 'Verified Purchase', transform: (v) => v ? 'Yes' : 'No' },
          { key: 'created_at', header: 'Date' },
        ];

      case ExportType.COUPONS:
        return [
          { key: 'id', header: 'Coupon ID' },
          { key: 'code', header: 'Code' },
          { key: 'description', header: 'Description' },
          { key: 'type', header: 'Type' },
          { key: 'value', header: 'Value' },
          { key: 'min_purchase', header: 'Min Purchase' },
          { key: 'max_discount', header: 'Max Discount' },
          { key: 'usage_limit', header: 'Usage Limit' },
          { key: 'used_count', header: 'Times Used' },
          { key: 'start_date', header: 'Start Date' },
          { key: 'end_date', header: 'End Date' },
          { key: 'is_active', header: 'Active', transform: (v) => v ? 'Yes' : 'No' },
        ];

      case ExportType.CAMPAIGNS:
        return [
          { key: 'id', header: 'Campaign ID' },
          { key: 'name', header: 'Name' },
          { key: 'description', header: 'Description' },
          { key: 'type', header: 'Type' },
          { key: 'discount_type', header: 'Discount Type' },
          { key: 'discount_value', header: 'Discount Value' },
          { key: 'start_date', header: 'Start Date' },
          { key: 'end_date', header: 'End Date' },
          { key: 'is_active', header: 'Active', transform: (v) => v ? 'Yes' : 'No' },
          { key: 'created_at', header: 'Created At' },
        ];

      case ExportType.SHOPS:
        return [
          { key: 'id', header: 'Shop ID' },
          { key: 'name', header: 'Shop Name' },
          { key: 'slug', header: 'Slug' },
          { key: 'description', header: 'Description' },
          { key: 'owner_id', header: 'Owner ID' },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Phone' },
          { key: 'status', header: 'Status' },
          { key: 'is_verified', header: 'Verified', transform: (v) => v ? 'Yes' : 'No' },
          { key: 'total_products', header: 'Total Products' },
          { key: 'total_orders', header: 'Total Orders' },
          { key: 'total_revenue', header: 'Total Revenue' },
          { key: 'commission_rate', header: 'Commission Rate' },
          { key: 'created_at', header: 'Created At' },
        ];

      default:
        throw new BadRequestException(`Unknown export type: ${type}`);
    }
  }

  /**
   * Get table name for export type
   */
  private getTableName(type: ExportType): string {
    const tableMap: Record<ExportType, string> = {
      [ExportType.PRODUCTS]: 'products',
      [ExportType.ORDERS]: 'orders',
      [ExportType.CUSTOMERS]: 'customers',
      [ExportType.CATEGORIES]: 'categories',
      [ExportType.REVIEWS]: 'reviews',
      [ExportType.COUPONS]: 'coupons',
      [ExportType.CAMPAIGNS]: 'campaigns',
      [ExportType.SHOPS]: 'shops',
    };
    return tableMap[type];
  }

  /**
   * Export data to CSV or JSON format
   */
  async exportData(dto: ExportRequestDto, userId: string): Promise<{ data: string; filename: string; contentType: string }> {
    this.logger.log(`Exporting ${dto.type} data for user ${userId}`);

    const tableName = this.getTableName(dto.type);
    const columns = this.getColumns(dto.type);

    // Build query
    let query = /* TODO: replace client call */ this.db.client.query.from(tableName).select('*');

    // Apply filters
    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }

    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }

    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    if (dto.status) {
      query = query.where('status', dto.status);
    }

    if (dto.categoryId && dto.type === ExportType.PRODUCTS) {
      query = query.where('category_id', dto.categoryId);
    }

    // Execute query
    const result = await query.orderBy('created_at', 'DESC').get();
    const data = result || [];

    // Filter columns if specified
    const activeColumns = dto.columns?.length
      ? columns.filter(col => dto.columns!.includes(col.key))
      : columns;

    // Generate output based on format
    const format = dto.format || ExportFormat.CSV;
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === ExportFormat.JSON) {
      const jsonData = data.map((row: any) => {
        const obj: Record<string, any> = {};
        activeColumns.forEach(col => {
          const value = row[col.key];
          obj[col.key] = col.transform ? col.transform(value, row) : value;
        });
        return obj;
      });

      return {
        data: JSON.stringify(jsonData, null, 2),
        filename: `${dto.type}-export-${timestamp}.json`,
        contentType: 'application/json',
      };
    }

    // CSV format
    const csvRows: string[] = [];

    // Header row
    csvRows.push(activeColumns.map(col => this.escapeCsvField(col.header)).join(','));

    // Data rows
    data.forEach((row: any) => {
      const rowValues = activeColumns.map(col => {
        const value = row[col.key];
        const transformed = col.transform ? col.transform(value, row) : value;
        return this.escapeCsvField(transformed);
      });
      csvRows.push(rowValues.join(','));
    });

    return {
      data: csvRows.join('\n'),
      filename: `${dto.type}-export-${timestamp}.csv`,
      contentType: 'text/csv',
    };
  }

  /**
   * Get import template (CSV with headers only)
   */
  async getImportTemplate(type: ExportType): Promise<{ data: string; filename: string }> {
    const columns = this.getColumns(type);

    // For import, exclude auto-generated fields
    const importableColumns = columns.filter(col =>
      !['id', 'created_at', 'updated_at', 'total_orders', 'total_spent', 'used_count'].includes(col.key)
    );

    const headers = importableColumns.map(col => this.escapeCsvField(col.header)).join(',');
    const exampleRow = importableColumns.map(col => {
      // Provide example values
      switch (col.key) {
        case 'name': return '"Example Product"';
        case 'price': return '29.99';
        case 'inventory_quantity': return '100';
        case 'status': return 'active';
        case 'is_featured': return 'No';
        case 'is_active': return 'Yes';
        case 'rating': return '5';
        default: return '""';
      }
    }).join(',');

    return {
      data: `${headers}\n${exampleRow}`,
      filename: `${type}-import-template.csv`,
    };
  }

  /**
   * Import data from CSV
   */
  async importData(
    dto: ImportRequestDto,
    csvContent: string,
    userId: string
  ): Promise<ImportResultDto> {
    this.logger.log(`Importing ${dto.type} data for user ${userId}`);

    const result: ImportResultDto = {
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      skippedCount: 0,
      errors: [],
      createdIds: [],
      updatedIds: [],
    };

    // Parse CSV
    const rows = this.parseCsv(csvContent);
    if (rows.length < 2) {
      throw new BadRequestException('CSV file must have at least a header row and one data row');
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);
    result.totalRows = dataRows.length;

    const tableName = this.getTableName(dto.type);
    const columns = this.getColumns(dto.type);

    // Map headers to column keys
    const headerToKey: Record<string, string> = {};
    columns.forEach(col => {
      headerToKey[col.header.toLowerCase()] = col.key;
    });

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 2; // +2 because 1-indexed and skip header

      try {
        const record: Record<string, any> = {};

        // Map CSV values to record
        headers.forEach((header, index) => {
          const key = headerToKey[header.toLowerCase()];
          if (key && row[index] !== undefined) {
            let value: any = row[index];

            // Type conversions
            if (['price', 'sale_price', 'cost_price', 'total', 'subtotal'].includes(key)) {
              value = parseFloat(value) || 0;
            } else if (['inventory_quantity', 'stock', 'sort_order', 'rating'].includes(key)) {
              value = parseInt(value, 10) || 0;
            } else if (['is_featured', 'is_active', 'is_verified'].includes(key)) {
              value = String(value).toLowerCase() === 'yes' || value === 'true' || value === '1';
            } else if (key === 'images' && typeof value === 'string') {
              value = value.split('|').filter(Boolean);
            } else if (key === 'tags' && typeof value === 'string') {
              value = value.split(',').map((t: string) => t.trim()).filter(Boolean);
            }

            record[key] = value;
          }
        });

        // Add shop_id if provided
        if (dto.shopId) {
          record.shop_id = dto.shopId;
        }

        // Check if record exists (for update)
        let existingId: string | null = null;
        if (record.id) {
          const existing = await /* TODO: replace client call */ this.db.client.query
            .from(tableName)
            .select('id')
            .where('id', record.id)
            .get();

          if (existing && existing.length > 0) {
            existingId = record.id;
          }
        }

        if (existingId && dto.updateExisting) {
          // Update existing record
          delete record.id;
          await /* TODO: replace client call */ this.db.client.query
            .from(tableName)
            .where('id', existingId)
            .update(record)
            .execute();

          result.successCount++;
          result.updatedIds.push(existingId);
        } else if (existingId && !dto.updateExisting) {
          // Skip existing record
          result.skippedCount++;
        } else {
          // Create new record
          delete record.id;
          record.created_at = new Date().toISOString();
          record.updated_at = new Date().toISOString();

          const insertResult = await /* TODO: replace client call */ this.db.client.query
            .from(tableName)
            .insert(record)
            .returning('id')
            .execute();

          if (insertResult && insertResult[0]?.id) {
            result.successCount++;
            result.createdIds.push(insertResult[0].id);
          }
        }
      } catch (error: any) {
        result.failedCount++;
        result.errors.push({
          row: rowNumber,
          message: error.message || 'Unknown error',
        });

        if (!dto.skipErrors) {
          throw new BadRequestException(`Import failed at row ${rowNumber}: ${error.message}`);
        }
      }
    }

    this.logger.log(`Import completed: ${result.successCount} success, ${result.failedCount} failed, ${result.skippedCount} skipped`);
    return result;
  }

  /**
   * Escape a field for CSV format
   */
  private escapeCsvField(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    const stringValue = String(value);

    // Escape if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
  }

  /**
   * Parse CSV content into rows and columns
   */
  private parseCsv(content: string): string[][] {
    const rows: string[][] = [];
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      if (!line.trim()) continue;

      const row: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (inQuotes) {
          if (char === '"' && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
          } else if (char === '"') {
            inQuotes = false;
          } else {
            current += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            row.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
      }

      row.push(current.trim());
      rows.push(row);
    }

    return rows;
  }
}
