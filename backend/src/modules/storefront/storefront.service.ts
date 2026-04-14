import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  StorefrontProductsQueryDto,
  ProductSortBy,
  AddToCartDto,
  CheckoutDto,
} from './dto';

@Injectable()
export class StorefrontService {
  private readonly logger = new Logger(StorefrontService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // PRODUCTS
  // ============================================

  /**
   * Get products with faceted filtering, sorting, and pagination.
   * Optimized single-query with JOINs for shop data.
   */
  async getProducts(query: StorefrontProductsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['p."status" = $1', 'p."deleted_at" IS NULL'];
    const params: any[] = ['active'];
    let paramIndex = 2;

    if (query.categoryId) {
      conditions.push(`p."categories" @> $${paramIndex}::jsonb`);
      params.push(JSON.stringify([query.categoryId]));
      paramIndex++;
    }

    if (query.minPrice !== undefined) {
      conditions.push(`p."price" >= $${paramIndex}`);
      params.push(query.minPrice);
      paramIndex++;
    }
    if (query.maxPrice !== undefined) {
      conditions.push(`p."price" <= $${paramIndex}`);
      params.push(query.maxPrice);
      paramIndex++;
    }

    if (query.shopId) {
      conditions.push(`p."shop_id" = $${paramIndex}`);
      params.push(query.shopId);
      paramIndex++;
    }

    if (query.search) {
      conditions.push(
        `(p."name" ILIKE $${paramIndex} OR p."description" ILIKE $${paramIndex})`,
      );
      params.push(`%${query.search}%`);
      paramIndex++;
    }

    if (query.attributes) {
      try {
        const attrs = JSON.parse(query.attributes);
        for (const [key, value] of Object.entries(attrs)) {
          conditions.push(
            `p."variant_attributes"->$${paramIndex} = $${paramIndex + 1}::jsonb`,
          );
          params.push(key, JSON.stringify(value));
          paramIndex += 2;
        }
      } catch {
        // Ignore invalid attribute JSON
      }
    }

    let orderClause = 'p."created_at" DESC';
    switch (query.sortBy) {
      case ProductSortBy.PRICE_ASC:
        orderClause = 'p."price" ASC';
        break;
      case ProductSortBy.PRICE_DESC:
        orderClause = 'p."price" DESC';
        break;
      case ProductSortBy.NEWEST:
        orderClause = 'p."created_at" DESC';
        break;
      case ProductSortBy.POPULARITY:
        orderClause = 'p."total_sales" DESC NULLS LAST, p."created_at" DESC';
        break;
      case ProductSortBy.NAME_ASC:
        orderClause = 'p."name" ASC';
        break;
      case ProductSortBy.NAME_DESC:
        orderClause = 'p."name" DESC';
        break;
    }

    const whereClause = conditions.join(' AND ');

    const countSql = `
      SELECT COUNT(*) as total
      FROM "products" p
      INNER JOIN "shops" s ON s."id" = p."shop_id" AND s."status" = 'active'
      WHERE ${whereClause}
    `;

    const dataSql = `
      SELECT
        p."id", p."name", p."slug", p."description",
        p."price", p."compare_price",
        p."images", p."categories", p."stock",
        p."rating", p."total_reviews", p."total_sales",
        p."variants", p."variant_attributes", p."tags",
        p."created_at",
        json_build_object(
          'id', s."id",
          'name', s."name",
          'slug', s."slug",
          'logo', s."logo",
          'is_verified', s."is_verified"
        ) as shop
      FROM "products" p
      INNER JOIN "shops" s ON s."id" = p."shop_id" AND s."status" = 'active'
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, limit, offset];

    const [countResult, dataResult] = await Promise.all([
      this.db.query(countSql, params),
      this.db.query(dataSql, dataParams),
    ]);

    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    return {
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get single product detail with variants, images, reviews summary, and related products.
   */
  async getProduct(slug: string) {
    const productSql = `
      SELECT
        p.*,
        json_build_object(
          'id', s."id",
          'name', s."name",
          'slug', s."slug",
          'logo', s."logo",
          'is_verified', s."is_verified",
          'rating', s."rating"
        ) as shop
      FROM "products" p
      INNER JOIN "shops" s ON s."id" = p."shop_id" AND s."status" = 'active'
      WHERE p."slug" = $1 AND p."status" = 'active' AND p."deleted_at" IS NULL
      LIMIT 1
    `;

    const { rows } = await this.db.query(productSql, [slug]);
    const product = rows[0];

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Reviews summary
    let reviewsSummary = { average: 0, count: 0, distribution: {} };
    try {
      const reviewsSql = `
        SELECT
          COALESCE(AVG("rating"), 0) as average,
          COUNT(*) as count,
          COUNT(*) FILTER (WHERE "rating" = 5) as five_star,
          COUNT(*) FILTER (WHERE "rating" = 4) as four_star,
          COUNT(*) FILTER (WHERE "rating" = 3) as three_star,
          COUNT(*) FILTER (WHERE "rating" = 2) as two_star,
          COUNT(*) FILTER (WHERE "rating" = 1) as one_star
        FROM "reviews"
        WHERE "product_id" = $1 AND "status" = 'approved'
      `;
      const reviewsResult = await this.db.query(reviewsSql, [product.id]);
      const r = reviewsResult.rows[0];
      if (r) {
        reviewsSummary = {
          average: parseFloat(parseFloat(r.average).toFixed(1)),
          count: parseInt(r.count, 10),
          distribution: {
            5: parseInt(r.five_star, 10),
            4: parseInt(r.four_star, 10),
            3: parseInt(r.three_star, 10),
            2: parseInt(r.two_star, 10),
            1: parseInt(r.one_star, 10),
          },
        };
      }
    } catch {
      // Reviews table may not exist yet
    }

    // Related products (same category)
    let relatedProducts: any[] = [];
    const productCategories: string[] = Array.isArray(product.categories)
      ? product.categories
      : [];
    const primaryCategory = productCategories[0];
    if (primaryCategory) {
      try {
        const relatedSql = `
          SELECT
            p."id", p."name", p."slug", p."price", p."compare_price",
            p."images", p."rating", p."total_reviews",
            json_build_object('id', s."id", 'name', s."name", 'slug', s."slug") as shop
          FROM "products" p
          INNER JOIN "shops" s ON s."id" = p."shop_id" AND s."status" = 'active'
          WHERE p."categories" @> $1::jsonb
            AND p."id" != $2
            AND p."status" = 'active'
            AND p."deleted_at" IS NULL
          ORDER BY p."total_sales" DESC NULLS LAST
          LIMIT 8
        `;
        const relatedResult = await this.db.query(relatedSql, [
          JSON.stringify([primaryCategory]),
          product.id,
        ]);
        relatedProducts = relatedResult.rows;
      } catch (err) {
        this.logger.warn(`related-products query failed: ${(err as Error).message}`);
      }
    }

    return {
      ...product,
      reviewsSummary,
      relatedProducts,
    };
  }

  // ============================================
  // CATEGORIES
  // ============================================

  /**
   * Get category tree with product counts.
   */
  async getCategories() {
    const sql = `
      SELECT
        c.*,
        COALESCE(c."product_count", 0)::integer as product_count
      FROM "categories" c
      WHERE c."is_active" = true AND c."deleted_at" IS NULL
      ORDER BY c."display_order" ASC, c."name" ASC
    `;

    const { rows } = await this.db.query(sql);

    // Build tree structure
    const categoryMap = new Map<string, any>();
    const roots: any[] = [];

    for (const cat of rows) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    for (const cat of rows) {
      const node = categoryMap.get(cat.id);
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return { data: roots, total: rows.length };
  }

  // ============================================
  // CART (Stateless -- cart ID is the session)
  // ============================================

  /**
   * Create a new cart and return its ID.
   */
  async createCart() {
    const cart = await this.db.insert('carts', {
      items: JSON.stringify([]),
      applied_coupons: JSON.stringify([]),
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return { cartId: cart.id, items: [], subtotal: 0, total: 0 };
  }

  /**
   * Get cart by ID (no auth required).
   */
  async getCart(cartId: string) {
    const cart = await this.db.findOne('carts', { id: cartId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return this.formatCart(cart);
  }

  /**
   * Add or update item in cart.
   */
  async addToCart(cartId: string, dto: AddToCartDto) {
    const cart = await this.db.findOne('carts', { id: cartId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    let product: any;
    try {
      product = await this.db.findOne('products', { id: dto.productId });
    } catch {
      throw new NotFoundException('Product not found or unavailable');
    }
    if (!product || product.status !== 'active' || product.deleted_at) {
      throw new NotFoundException('Product not found or unavailable');
    }

    if (product.stock < dto.quantity) {
      throw new UnprocessableEntityException(
        `Only ${product.stock} items available in stock`,
      );
    }

    let items: any[] = [];
    try {
      items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items || [];
    } catch {
      items = [];
    }

    const existingIdx = items.findIndex(
      (item: any) =>
        item.productId === dto.productId &&
        JSON.stringify(item.variant) === JSON.stringify(dto.variant),
    );

    let shopName = 'Unknown Shop';
    try {
      const shop = await this.db.findOne('shops', { id: product.shop_id });
      if (shop) shopName = shop.name;
    } catch {
      // Ignore
    }

    if (existingIdx > -1) {
      const newQty = items[existingIdx].quantity + dto.quantity;
      if (newQty > product.stock) {
        throw new UnprocessableEntityException(
          `Cannot add more items. Only ${product.stock} available`,
        );
      }
      items[existingIdx].quantity = newQty;
      items[existingIdx].total = newQty * items[existingIdx].price;
    } else {
      const itemId = `item_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      items.push({
        id: itemId,
        productId: dto.productId,
        variant: dto.variant || null,
        shopId: product.shop_id,
        shopName,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.price,
        quantity: dto.quantity,
        total: product.price * dto.quantity,
      });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);

    const updated = await this.db.update('carts', cartId, {
      items: JSON.stringify(items),
      subtotal,
      total: subtotal,
      updated_at: new Date().toISOString(),
    });

    return this.formatCart(updated);
  }

  /**
   * Remove item from cart.
   */
  async removeFromCart(cartId: string, itemId: string) {
    const cart = await this.db.findOne('carts', { id: cartId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    let items: any[] = [];
    try {
      items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items || [];
    } catch {
      items = [];
    }

    const filtered = items.filter((item: any) => item.id !== itemId);
    if (filtered.length === items.length) {
      throw new NotFoundException('Item not found in cart');
    }

    const subtotal = filtered.reduce((sum: number, item: any) => sum + item.total, 0);

    const updated = await this.db.update('carts', cartId, {
      items: JSON.stringify(filtered),
      subtotal,
      total: subtotal,
      updated_at: new Date().toISOString(),
    });

    return this.formatCart(updated);
  }

  /**
   * Initiate checkout for a cart.
   */
  async checkout(cartId: string, dto: CheckoutDto) {
    const cart = await this.db.findOne('carts', { id: cartId });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    let items: any[] = [];
    try {
      items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items || [];
    } catch {
      items = [];
    }

    if (items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Verify inventory
    for (const item of items) {
      const product = await this.db.findOne('products', { id: item.productId });
      if (!product || product.status !== 'active') {
        throw new BadRequestException(`Product "${item.name}" is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new UnprocessableEntityException(
          `"${item.name}" only has ${product.stock} in stock (requested ${item.quantity})`,
        );
      }
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + item.total, 0);

    const order = await this.db.insert('orders', {
      customer_email: dto.email,
      customer_id: dto.customerId || null,
      items: JSON.stringify(items),
      shipping_address: JSON.stringify(dto.shippingAddress),
      payment_method: dto.paymentMethod,
      notes: dto.notes || null,
      subtotal,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: subtotal,
      status: 'pending',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Clear cart
    await this.db.update('carts', cartId, {
      items: JSON.stringify([]),
      subtotal: 0,
      total: 0,
      updated_at: new Date().toISOString(),
    });

    return {
      orderId: order.id,
      status: order.status,
      total: order.total,
      message: 'Checkout initiated successfully',
    };
  }

  // ============================================
  // STOREFRONT AUTH
  // ============================================

  /**
   * Customer login via email+password.
   */
  async login(email: string, password: string) {
    let result: any;
    try {
      result = await this.db.signIn(email, password);
    } catch (err) {
      const message = (err as Error)?.message || '';
      if (/invalid credentials|not found|wrong password|unauthorized/i.test(message)) {
        throw new UnauthorizedException('Invalid email or password');
      }
      throw err;
    }
    const user = result.user || result;
    const token =
      (result as any).token ||
      (result as any).access_token ||
      (result as any).accessToken;
    const refreshToken =
      (result as any).refreshToken || (result as any).refresh_token;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || user.full_name,
        role: user.role || 'customer',
      },
      accessToken: token,
      refreshToken,
    };
  }

  /**
   * Customer registration.
   */
  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ) {
    const name = `${firstName || ''} ${lastName || ''}`.trim();
    const metadata = { phone, firstName, lastName, full_name: name };

    let result: any;
    try {
      result = await this.db.signUp(email, password, name, 'customer', metadata);
    } catch (err) {
      const message = (err as Error)?.message || '';
      if (/already (exists|in use|registered)|duplicate|unique/i.test(message)) {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
    const user = result.user || result;
    const token =
      (result as any).token ||
      (result as any).access_token ||
      (result as any).accessToken;
    const refreshToken =
      (result as any).refreshToken || (result as any).refresh_token;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || name,
        role: 'customer',
      },
      accessToken: token,
      refreshToken,
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private formatCart(cart: any) {
    let items: any[] = [];
    try {
      items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items || [];
    } catch {
      items = [];
    }

    return {
      id: cart.id,
      items,
      subtotal: cart.subtotal || 0,
      tax: cart.tax || 0,
      shipping: cart.shipping || 0,
      discount: cart.discount || 0,
      total: cart.total || 0,
      itemCount: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
    };
  }
}
