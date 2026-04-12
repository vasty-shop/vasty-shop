import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateBundleDto,
  UpdateBundleDto,
  AddBundleToCartDto,
  BundleType,
  DiscountType,
} from './dto/create-bundle.dto';

export interface ProductBundle {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  bundle_type: string;
  discount_type: string;
  discount_value: number;
  min_selections: number | null;
  max_selections: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BundleItem {
  id: string;
  bundle_id: string;
  product_id: string;
  quantity: number;
  is_required: boolean;
}

interface ProductInfo {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: string;
  images: any[];
  shopId: string;
  shop_id: string;
}

@Injectable()
export class BundlesService {
  private readonly logger = new Logger(BundlesService.name);

  constructor(private readonly db: DatabaseService) {}

  /**
   * Create a new product bundle.
   */
  async createBundle(vendorId: string, dto: CreateBundleDto): Promise<any> {
    // Validate dynamic bundle constraints
    if (dto.bundleType === BundleType.DYNAMIC) {
      if (!dto.minSelections || !dto.maxSelections) {
        throw new BadRequestException(
          'Dynamic bundles require minSelections and maxSelections',
        );
      }
      if (dto.minSelections > dto.maxSelections) {
        throw new BadRequestException(
          'minSelections cannot exceed maxSelections',
        );
      }
      if (dto.maxSelections > dto.componentProducts.length) {
        throw new BadRequestException(
          'maxSelections cannot exceed the number of component products',
        );
      }
    }

    // Verify all products exist
    for (const item of dto.componentProducts) {
      const product = await this.db.findOne('products', { id: item.productId });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
    }

    // Validate discount
    if (dto.discountType === DiscountType.PERCENTAGE && dto.discountValue > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100');
    }

    // Insert bundle
    const bundle = await this.db.insert('product_bundles', {
      vendor_id: vendorId,
      name: dto.name,
      description: dto.description || null,
      bundle_type: dto.bundleType,
      discount_type: dto.discountType,
      discount_value: dto.discountValue,
      min_selections: dto.bundleType === BundleType.DYNAMIC ? dto.minSelections : null,
      max_selections: dto.bundleType === BundleType.DYNAMIC ? dto.maxSelections : null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Insert bundle items
    for (const item of dto.componentProducts) {
      await this.db.insert('bundle_items', {
        bundle_id: bundle.id,
        product_id: item.productId,
        quantity: item.quantity,
        is_required: item.isRequired !== false,
      });
    }

    return this.getBundle(bundle.id);
  }

  /**
   * Get a bundle with all component products and savings calculation.
   */
  async getBundle(bundleId: string): Promise<any> {
    const bundle = await this.db.findOne('product_bundles', { id: bundleId });
    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    const items = await this.db.findMany('bundle_items', { bundle_id: bundleId });

    // Fetch product details for each item
    const componentProducts = [];
    for (const item of items) {
      const product = await this.db.findOne('products', { id: item.product_id });
      componentProducts.push({
        ...item,
        product: product
          ? {
              id: product.id,
              name: product.name,
              price: product.price,
              images: product.images,
              stock: product.stock,
              status: product.status,
            }
          : null,
      });
    }

    // Calculate pricing
    const pricing = this.calculatePricing(bundle, componentProducts);

    return {
      ...bundle,
      componentProducts,
      pricing,
    };
  }

  /**
   * List bundles with optional filters.
   */
  async listBundles(filters: {
    vendorId?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const conditions: Record<string, any> = {};

    if (filters.vendorId) {
      conditions.vendor_id = filters.vendorId;
    }
    if (filters.isActive !== undefined) {
      conditions.is_active = filters.isActive;
    }

    const bundles = await this.db.findMany('product_bundles', conditions, {
      orderBy: 'created_at',
      order: 'desc',
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    });

    // Enrich each bundle with item count and pricing
    const enriched = [];
    for (const bundle of bundles) {
      const items = await this.db.findMany('bundle_items', { bundle_id: bundle.id });
      const componentProducts = [];
      for (const item of items) {
        const product = await this.db.findOne('products', { id: item.product_id });
        componentProducts.push({ ...item, product });
      }
      const pricing = this.calculatePricing(bundle, componentProducts);
      enriched.push({
        ...bundle,
        itemCount: items.length,
        pricing,
      });
    }

    return enriched;
  }

  /**
   * Calculate the bundle price, optionally for a subset of selected products.
   */
  async calculateBundlePrice(
    bundleId: string,
    selectedProductIds?: string[],
  ): Promise<any> {
    const bundle = await this.db.findOne('product_bundles', { id: bundleId });
    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    const items = await this.db.findMany('bundle_items', { bundle_id: bundleId });
    let relevantItems = items;

    if (
      bundle.bundle_type === BundleType.DYNAMIC &&
      selectedProductIds?.length
    ) {
      relevantItems = items.filter((i: BundleItem) =>
        selectedProductIds.includes(i.product_id),
      );

      if (bundle.min_selections && relevantItems.length < bundle.min_selections) {
        throw new BadRequestException(
          `Select at least ${bundle.min_selections} products`,
        );
      }
      if (bundle.max_selections && relevantItems.length > bundle.max_selections) {
        throw new BadRequestException(
          `Select at most ${bundle.max_selections} products`,
        );
      }
    }

    const componentProducts = [];
    for (const item of relevantItems) {
      const product = await this.db.findOne('products', { id: item.product_id });
      componentProducts.push({ ...item, product });
    }

    return this.calculatePricing(bundle, componentProducts);
  }

  /**
   * Update a bundle. Vendor must own the bundle.
   */
  async updateBundle(
    bundleId: string,
    vendorId: string,
    dto: UpdateBundleDto,
  ): Promise<any> {
    const bundle = await this.db.findOne('product_bundles', { id: bundleId });
    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }
    if (bundle.vendor_id !== vendorId) {
      throw new ForbiddenException('You do not own this bundle');
    }

    // Update bundle fields
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.bundleType !== undefined) updateData.bundle_type = dto.bundleType;
    if (dto.discountType !== undefined) updateData.discount_type = dto.discountType;
    if (dto.discountValue !== undefined) updateData.discount_value = dto.discountValue;
    if (dto.minSelections !== undefined) updateData.min_selections = dto.minSelections;
    if (dto.maxSelections !== undefined) updateData.max_selections = dto.maxSelections;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;

    await this.db.update('product_bundles', { id: bundleId }, updateData);

    // Update component products if provided
    if (dto.componentProducts) {
      // Remove old items
      await this.db.query(
        'DELETE FROM bundle_items WHERE bundle_id = $1',
        [bundleId],
      );

      // Insert new items
      for (const item of dto.componentProducts) {
        await this.db.insert('bundle_items', {
          bundle_id: bundleId,
          product_id: item.productId,
          quantity: item.quantity,
          is_required: item.isRequired !== false,
        });
      }
    }

    return this.getBundle(bundleId);
  }

  /**
   * Delete a bundle. Vendor must own the bundle.
   */
  async deleteBundle(bundleId: string, vendorId: string): Promise<void> {
    const bundle = await this.db.findOne('product_bundles', { id: bundleId });
    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }
    if (bundle.vendor_id !== vendorId) {
      throw new ForbiddenException('You do not own this bundle');
    }

    // Delete bundle items first
    await this.db.query('DELETE FROM bundle_items WHERE bundle_id = $1', [bundleId]);
    // Delete bundle
    await this.db.query('DELETE FROM product_bundles WHERE id = $1', [bundleId]);
  }

  /**
   * Add all bundle items to the user's cart as a group.
   */
  async addBundleToCart(
    userId: string,
    bundleId: string,
    dto: AddBundleToCartDto,
  ): Promise<any> {
    const bundle = await this.db.findOne('product_bundles', { id: bundleId });
    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }
    if (!bundle.is_active) {
      throw new BadRequestException('This bundle is not currently active');
    }

    const allItems = await this.db.findMany('bundle_items', { bundle_id: bundleId });
    let selectedItems = allItems;

    // For dynamic bundles, filter to selected products
    if (bundle.bundle_type === BundleType.DYNAMIC) {
      if (!dto.selectedProductIds?.length) {
        throw new BadRequestException(
          'Dynamic bundles require selectedProductIds',
        );
      }

      // Ensure required items are included
      const requiredItems = allItems.filter((i: BundleItem) => i.is_required);
      for (const req of requiredItems) {
        if (!dto.selectedProductIds.includes(req.product_id)) {
          throw new BadRequestException(
            `Product ${req.product_id} is required in this bundle`,
          );
        }
      }

      selectedItems = allItems.filter((i: BundleItem) =>
        dto.selectedProductIds!.includes(i.product_id),
      );

      if (bundle.min_selections && selectedItems.length < bundle.min_selections) {
        throw new BadRequestException(
          `Select at least ${bundle.min_selections} products`,
        );
      }
      if (bundle.max_selections && selectedItems.length > bundle.max_selections) {
        throw new BadRequestException(
          `Select at most ${bundle.max_selections} products`,
        );
      }
    }

    // Verify stock for all selected items
    const cartItems = [];
    for (const item of selectedItems) {
      const product = await this.db.findOne('products', { id: item.product_id });
      if (!product) {
        throw new NotFoundException(`Product ${item.product_id} not found`);
      }
      if (product.status !== 'active') {
        throw new BadRequestException(`Product "${product.name}" is not available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}": need ${item.quantity}, have ${product.stock}`,
        );
      }
      cartItems.push({ item, product });
    }

    // Calculate pricing
    const componentProducts = cartItems.map((ci) => ({
      ...ci.item,
      product: ci.product,
    }));
    const pricing = this.calculatePricing(bundle, componentProducts);

    // Get or create cart
    const carts = await this.db.findMany('carts', { user_id: userId }, { limit: 1 });
    let cart = carts[0];
    if (!cart) {
      cart = await this.db.insert('carts', {
        user_id: userId,
        items: JSON.stringify([]),
        applied_coupons: JSON.stringify([]),
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Parse existing cart items
    let existingItems: any[] = [];
    if (cart.items) {
      existingItems = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
    }

    // Add bundle items to cart
    const bundleGroupId = `bundle-${bundleId}-${Date.now()}`;
    for (const { item, product } of cartItems) {
      const pricePerUnit =
        (pricing.bundlePrice / pricing.originalPrice) * product.price;
      existingItems.push({
        id: `${bundleGroupId}-${item.product_id}`,
        productId: item.product_id,
        shopId: product.shop_id || product.shopId,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: pricePerUnit,
        quantity: item.quantity,
        total: pricePerUnit * item.quantity,
        bundleId: bundleId,
        bundleGroupId,
        bundleName: bundle.name,
      });
    }

    // Recalculate cart subtotal
    const subtotal = existingItems.reduce(
      (sum: number, i: any) => sum + (i.total || i.price * i.quantity),
      0,
    );

    await this.db.update('carts', { id: cart.id }, {
      items: JSON.stringify(existingItems),
      subtotal,
      total: subtotal + (cart.tax || 0) + (cart.shipping || 0) - (cart.discount || 0),
      updated_at: new Date().toISOString(),
    });

    return {
      bundleId,
      bundleName: bundle.name,
      itemsAdded: cartItems.length,
      pricing,
      bundleGroupId,
    };
  }

  // ============================================
  // Private helpers
  // ============================================

  private calculatePricing(
    bundle: ProductBundle,
    componentProducts: any[],
  ): {
    originalPrice: number;
    bundlePrice: number;
    savings: number;
    savingsPercent: number;
  } {
    const originalPrice = componentProducts.reduce((sum, cp) => {
      const price = cp.product?.price || 0;
      const qty = cp.quantity || 1;
      return sum + price * qty;
    }, 0);

    let bundlePrice = originalPrice;

    if (bundle.discount_type === DiscountType.PERCENTAGE) {
      bundlePrice = originalPrice * (1 - bundle.discount_value / 100);
    } else if (bundle.discount_type === DiscountType.FIXED_AMOUNT) {
      bundlePrice = Math.max(0, originalPrice - bundle.discount_value);
    }

    const savings = originalPrice - bundlePrice;
    const savingsPercent =
      originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

    return {
      originalPrice: Math.round(originalPrice * 100) / 100,
      bundlePrice: Math.round(bundlePrice * 100) / 100,
      savings: Math.round(savings * 100) / 100,
      savingsPercent,
    };
  }
}
