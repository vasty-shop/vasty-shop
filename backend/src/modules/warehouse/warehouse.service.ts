import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { WAREHOUSE_MIGRATION_SQL } from './warehouse.migration';
import {
  CreateWarehouseDto,
  UpdateWarehouseDto,
  SetStockDto,
  TransferStockDto,
} from './dto/warehouse.dto';

@Injectable()
export class WarehouseService implements OnModuleInit {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    try {
      await this.db.query(WAREHOUSE_MIGRATION_SQL);
      this.logger.log('Warehouse tables initialised');
    } catch (error: any) {
      this.logger.error('Failed to run warehouse migration', error.message);
    }
  }

  // ============================================
  // WAREHOUSE CRUD
  // ============================================

  async createWarehouse(vendorId: string, dto: CreateWarehouseDto) {
    // If setting as default, unset current default first
    if (dto.is_default) {
      await this.db.query(
        `UPDATE warehouses SET is_default = false WHERE vendor_id = $1 AND deleted_at IS NULL`,
        [vendorId],
      );
    }

    const warehouse = await this.db.insert('warehouses', {
      vendor_id: vendorId,
      name: dto.name,
      address: JSON.stringify(dto.address || {}),
      is_default: dto.is_default ?? false,
      is_active: dto.is_active ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return warehouse;
  }

  async listWarehouses(vendorId: string) {
    const result = await this.db.query(
      `SELECT * FROM warehouses WHERE vendor_id = $1 AND deleted_at IS NULL ORDER BY is_default DESC, created_at ASC`,
      [vendorId],
    );
    return result.rows;
  }

  async updateWarehouse(id: string, vendorId: string, dto: UpdateWarehouseDto) {
    const warehouse = await this.findWarehouse(id, vendorId);

    // If promoting to default, demote others first
    if (dto.is_default && !warehouse.is_default) {
      await this.db.query(
        `UPDATE warehouses SET is_default = false WHERE vendor_id = $1 AND deleted_at IS NULL`,
        [vendorId],
      );
    }

    const data: Record<string, any> = { updated_at: new Date().toISOString() };
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.address !== undefined) data.address = JSON.stringify(dto.address);
    if (dto.is_default !== undefined) data.is_default = dto.is_default;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;

    const updated = await this.db.update('warehouses', { id, vendor_id: vendorId }, data);
    if (!updated) throw new NotFoundException('Warehouse not found');
    return updated;
  }

  async deleteWarehouse(id: string, vendorId: string) {
    const warehouse = await this.findWarehouse(id, vendorId);

    // Check for remaining stock
    const stockResult = await this.db.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total FROM warehouse_stock WHERE warehouse_id = $1`,
      [id],
    );
    const totalStock = parseInt(stockResult.rows[0]?.total || '0', 10);
    if (totalStock > 0) {
      throw new BadRequestException(
        `Cannot delete warehouse with ${totalStock} items in stock. Transfer or clear stock first.`,
      );
    }

    // Soft delete
    await this.db.update('warehouses', { id, vendor_id: vendorId }, {
      deleted_at: new Date().toISOString(),
      is_active: false,
      updated_at: new Date().toISOString(),
    });

    return { message: 'Warehouse deleted successfully' };
  }

  // ============================================
  // STOCK MANAGEMENT
  // ============================================

  async setStock(warehouseId: string, vendorId: string, dto: SetStockDto) {
    // Verify warehouse belongs to vendor
    await this.findWarehouse(warehouseId, vendorId);

    const existing = await this.db.findOne('warehouse_stock', {
      warehouse_id: warehouseId,
      product_id: dto.product_id,
    });

    if (existing) {
      return this.db.update(
        'warehouse_stock',
        { warehouse_id: warehouseId, product_id: dto.product_id },
        {
          quantity: dto.quantity,
          low_stock_threshold: dto.low_stock_threshold ?? existing.low_stock_threshold,
          updated_at: new Date().toISOString(),
        },
      );
    }

    return this.db.insert('warehouse_stock', {
      warehouse_id: warehouseId,
      product_id: dto.product_id,
      quantity: dto.quantity,
      reserved_quantity: 0,
      low_stock_threshold: dto.low_stock_threshold ?? 10,
      updated_at: new Date().toISOString(),
    });
  }

  async getStock(productId: string) {
    const rows = await this.db.query(
      `SELECT
         ws.warehouse_id,
         w.name AS warehouse_name,
         w.address,
         w.is_default,
         ws.quantity,
         ws.reserved_quantity,
         (ws.quantity - ws.reserved_quantity) AS available,
         ws.low_stock_threshold
       FROM warehouse_stock ws
       JOIN warehouses w ON w.id = ws.warehouse_id AND w.deleted_at IS NULL
       WHERE ws.product_id = $1
       ORDER BY w.is_default DESC, w.name ASC`,
      [productId],
    );

    const locations = rows.rows;
    const total = locations.reduce((sum: number, r: any) => sum + r.quantity, 0);
    const totalAvailable = locations.reduce(
      (sum: number, r: any) => sum + (r.quantity - r.reserved_quantity),
      0,
    );

    return { product_id: productId, total, totalAvailable, locations };
  }

  async transferStock(vendorId: string, dto: TransferStockDto, userId?: string) {
    // Verify both warehouses belong to this vendor
    await this.findWarehouse(dto.from_warehouse_id, vendorId);
    await this.findWarehouse(dto.to_warehouse_id, vendorId);

    if (dto.from_warehouse_id === dto.to_warehouse_id) {
      throw new BadRequestException('Source and destination warehouse must be different');
    }

    // Check available stock at source
    const source = await this.db.findOne('warehouse_stock', {
      warehouse_id: dto.from_warehouse_id,
      product_id: dto.product_id,
    });

    if (!source) {
      throw new NotFoundException('Product not found in source warehouse');
    }

    const available = source.quantity - source.reserved_quantity;
    if (available < dto.quantity) {
      throw new BadRequestException(
        `Insufficient available stock. Available: ${available}, requested: ${dto.quantity}`,
      );
    }

    // Decrement source
    await this.db.query(
      `UPDATE warehouse_stock SET quantity = quantity - $1, updated_at = NOW()
       WHERE warehouse_id = $2 AND product_id = $3`,
      [dto.quantity, dto.from_warehouse_id, dto.product_id],
    );

    // Upsert destination
    await this.db.query(
      `INSERT INTO warehouse_stock (warehouse_id, product_id, quantity, reserved_quantity, updated_at)
       VALUES ($1, $2, $3, 0, NOW())
       ON CONFLICT (warehouse_id, product_id)
       DO UPDATE SET quantity = warehouse_stock.quantity + $3, updated_at = NOW()`,
      [dto.to_warehouse_id, dto.product_id, dto.quantity],
    );

    // Record transfer
    const transfer = await this.db.insert('stock_transfers', {
      from_warehouse_id: dto.from_warehouse_id,
      to_warehouse_id: dto.to_warehouse_id,
      product_id: dto.product_id,
      quantity: dto.quantity,
      status: 'completed',
      created_by: userId || null,
      created_at: new Date().toISOString(),
    });

    return transfer;
  }

  async getLowStockAlerts(vendorId: string, threshold?: number) {
    const sql = `
      SELECT
        ws.product_id,
        ws.warehouse_id,
        w.name AS warehouse_name,
        ws.quantity,
        ws.reserved_quantity,
        (ws.quantity - ws.reserved_quantity) AS available,
        ws.low_stock_threshold
      FROM warehouse_stock ws
      JOIN warehouses w ON w.id = ws.warehouse_id AND w.deleted_at IS NULL
      WHERE w.vendor_id = $1
        AND (ws.quantity - ws.reserved_quantity) <= ${threshold !== undefined ? '$2' : 'ws.low_stock_threshold'}
      ORDER BY (ws.quantity - ws.reserved_quantity) ASC
    `;

    const params: any[] = [vendorId];
    if (threshold !== undefined) params.push(threshold);

    const result = await this.db.query(sql, params);
    return result.rows;
  }

  async reserveStock(
    vendorId: string,
    productId: string,
    quantity: number,
    preferredWarehouseId?: string,
  ) {
    // Strategy: try preferred warehouse first, then fall back to highest-stock warehouse
    let warehouseId: string | null = null;

    if (preferredWarehouseId) {
      const preferred = await this.db.query(
        `SELECT ws.warehouse_id, (ws.quantity - ws.reserved_quantity) AS available
         FROM warehouse_stock ws
         JOIN warehouses w ON w.id = ws.warehouse_id AND w.deleted_at IS NULL
         WHERE ws.warehouse_id = $1
           AND ws.product_id = $2
           AND w.vendor_id = $3
           AND (ws.quantity - ws.reserved_quantity) >= $4`,
        [preferredWarehouseId, productId, vendorId, quantity],
      );
      if (preferred.rows.length > 0) {
        warehouseId = preferred.rows[0].warehouse_id;
      }
    }

    if (!warehouseId) {
      // Pick warehouse with highest available stock
      const best = await this.db.query(
        `SELECT ws.warehouse_id, (ws.quantity - ws.reserved_quantity) AS available
         FROM warehouse_stock ws
         JOIN warehouses w ON w.id = ws.warehouse_id AND w.deleted_at IS NULL AND w.is_active = true
         WHERE ws.product_id = $1
           AND w.vendor_id = $2
           AND (ws.quantity - ws.reserved_quantity) >= $3
         ORDER BY (ws.quantity - ws.reserved_quantity) DESC
         LIMIT 1`,
        [productId, vendorId, quantity],
      );

      if (best.rows.length === 0) {
        throw new BadRequestException(
          `Insufficient stock to reserve ${quantity} units of product ${productId}`,
        );
      }
      warehouseId = best.rows[0].warehouse_id;
    }

    // Increment reserved_quantity
    await this.db.query(
      `UPDATE warehouse_stock
       SET reserved_quantity = reserved_quantity + $1, updated_at = NOW()
       WHERE warehouse_id = $2 AND product_id = $3`,
      [quantity, warehouseId, productId],
    );

    // Create reservation record
    const reservation = await this.db.insert('stock_reservations', {
      warehouse_id: warehouseId,
      product_id: productId,
      quantity,
      status: 'active',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min hold
      created_at: new Date().toISOString(),
    });

    return reservation;
  }

  // ============================================
  // Helpers
  // ============================================

  private async findWarehouse(id: string, vendorId: string) {
    const warehouse = await this.db.findOne('warehouses', {
      id,
      vendor_id: vendorId,
    });
    if (!warehouse || warehouse.deleted_at) {
      throw new NotFoundException(`Warehouse ${id} not found`);
    }
    return warehouse;
  }
}
