import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { EntityType, ProductEntity, ShopEntity } from '../../database/schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  QueryProductsDto,
  UpdateInventoryDto,
} from './dto/query-products.dto';
import { BulkEditDto, BulkAction, BulkEditResponseDto } from './dto/bulk-edit.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Helper method to filter products by active shop status and enrich with shop data
   * Only returns products from shops that are 'active' (approved)
   */
  private async filterProductsByActiveShops(products: ProductEntity[]): Promise<ProductEntity[]> {
    if (!products || products.length === 0) {
      this.logger.log('[filterProductsByActiveShops] No products to filter');
      return [];
    }

    this.logger.log(`[filterProductsByActiveShops] Filtering ${products.length} products`);

    // Get unique shop IDs
    const shopIds = [...new Set(products.map(p => p.shopId).filter(Boolean))];
    this.logger.log(`[filterProductsByActiveShops] Unique shop IDs: ${JSON.stringify(shopIds)}`);

    if (shopIds.length === 0) {
      this.logger.log('[filterProductsByActiveShops] No shop IDs found, returning all products');
      return products;
    }

    // Query each shop individually to check status and get shop data
    const shopDataMap: Map<string, any> = new Map();

    for (const shopId of shopIds) {
      try {
        const shop = await this.db.getEntity(EntityType.SHOP, shopId);
        this.logger.log(`[filterProductsByActiveShops] Shop ${shopId} status: ${shop?.status}`);
        if (shop && shop.status === 'active') {
          shopDataMap.set(shopId, {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            logo: shop.logo,
            isVerified: shop.isVerified || shop.is_verified || false,
          });
        }
      } catch (err) {
        this.logger.warn(`[filterProductsByActiveShops] Error checking shop ${shopId}: ${err.message}`);
      }
    }

    this.logger.log(`[filterProductsByActiveShops] Active shop IDs: ${JSON.stringify([...shopDataMap.keys()])}`);

    // Filter products to only include those from active shops and enrich with shop data
    const filteredProducts = products
      .filter(product => shopDataMap.has(product.shopId))
      .map(product => ({
        ...product,
        shop: shopDataMap.get(product.shopId),
        shopName: shopDataMap.get(product.shopId)?.name,
      }));

    this.logger.log(`[filterProductsByActiveShops] Filtered to ${filteredProducts.length} products`);

    return filteredProducts;
  }

  /**
   * Find all products with filters and pagination
   */
  async findAll(query: QueryProductsDto) {
    const {
      shopId,
      category,
      subcategory,
      status = 'active',
      isFeatured,
      minPrice,
      maxPrice,
      tag,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filters: any = {};

    // Only filter by status if provided
    if (status) {
      filters.status = status;
    }

    if (shopId) filters.shopId = shopId;
    if (category) {
      // categories is an array, need to check if category is in the array
      filters.categories = { $contains: category };
    }
    if (subcategory) {
      // subcategories might also be an array
      filters.categories = { $contains: subcategory };
    }
    if (isFeatured !== undefined) filters.is_featured = isFeatured;

    // Price range filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price.$gte = minPrice;
      if (maxPrice !== undefined) filters.price.$lte = maxPrice;
    }

    // Tag filtering
    if (tag) {
      filters.tags = { $in: [tag] };
    }

    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters,
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
    });

    // Filter products by active shop status (only for public queries)
    const filteredProducts = await this.filterProductsByActiveShops(result.data || []);

    return {
      data: filteredProducts,
      total: filteredProducts.length,
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
    };
  }

  /**
   * Find featured products for homepage
   */
  async findFeatured(limit: number = 10, offset: number = 0) {
    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { status: 'active', is_featured: true },
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
    });

    // Filter products by active shop status
    const filteredProducts = await this.filterProductsByActiveShops(result.data || []);

    return {
      data: filteredProducts,
      total: filteredProducts.length,
    };
  }

  /**
   * Search products by name, description, or tags
   * Uses database SDK unified search for hybrid keyword+semantic search
   */
  async search(searchTerm: string, query: QueryProductsDto) {
    const {
      category,
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0,
    } = query;

    // Build filters for additional filtering
    const additionalFilters: any = { status: 'active' };
    if (category) additionalFilters.category = category;
    if (minPrice !== undefined) additionalFilters.price = { $gte: minPrice };
    if (maxPrice !== undefined) {
      additionalFilters.price = { ...additionalFilters.price, $lte: maxPrice };
    }

    try {
      // Use SDK unified search (hybrid mode for best results)
      const searchResult = await this.db.unifiedSearch(
        'products',
        searchTerm,
        {
          mode: 'hybrid',
          columns: ['name', 'description', 'short_description', 'tags'],
          limit: parseInt(limit.toString()),
          filters: additionalFilters,
          highlight: true,
        }
      );

      // Extract documents from search results (results contain hit objects with document property)
      const documents = (searchResult.results || []).map((hit: any) => hit.document || hit);

      // Filter products by active shop status
      const filteredProducts = await this.filterProductsByActiveShops(documents);

      return {
        data: filteredProducts,
        total: filteredProducts.length,
        query: searchTerm,
        mode: 'unified',
      };
    } catch (error) {
      // Fallback to manual search if SDK search is not available
      console.warn('SDK unified search failed, falling back to manual search:', error.message);
      return this.manualSearch(searchTerm, query);
    }
  }

  /**
   * Fallback manual search using regex (when SDK search is unavailable)
   */
  private async manualSearch(searchTerm: string, query: QueryProductsDto) {
    const {
      category,
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0,
    } = query;

    const filters: any = { status: 'active' };

    // Full-text search using ILIKE for case-insensitive matching
    // Note: This is a simplified fallback - SDK search provides better results
    if (searchTerm) {
      // Use basic text matching - SDK provides better full-text/semantic search
      filters.name = { $ilike: `%${searchTerm}%` };
    }

    if (category) filters.category = category;

    // Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filters.price = {};
      if (minPrice !== undefined) filters.price.$gte = minPrice;
      if (maxPrice !== undefined) filters.price.$lte = maxPrice;
    }

    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters,
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
    });

    // Filter products by active shop status
    const filteredProducts = await this.filterProductsByActiveShops(result.data || []);

    return {
      data: filteredProducts,
      total: filteredProducts.length,
      query: searchTerm,
      mode: 'fallback',
    };
  }

  /**
   * Find products by category
   */
  async findByCategory(categoryId: string, query: QueryProductsDto) {
    const { limit = 20, offset = 0, status = 'active' } = query;

    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { categories: { $contains: categoryId }, status },
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
    });

    // Filter products by active shop status
    const filteredProducts = await this.filterProductsByActiveShops(result.data || []);

    return {
      data: filteredProducts,
      total: filteredProducts.length,
      categoryId,
    };
  }

  /**
   * Find products by shop
   */
  async findByShop(shopId: string, query: QueryProductsDto) {
    const {
      status,
      category,
      limit = 20,
      offset = 0,
    } = query;

    const filters: any = { shopId };

    // If specific status is requested, use it; otherwise exclude archived products
    if (status) {
      filters.status = status;
    } else {
      // Exclude archived (deleted) products by using $in with valid statuses
      // Using $in instead of $ne because database might not support != operator correctly
      filters.status = { $in: ['draft', 'active', 'published', 'out_of_stock', 'inactive'] };
    }
    if (category) filters.category = category;

    this.logger.log(`[findByShop] Querying products with filters: ${JSON.stringify(filters)}`);

    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters,
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
    });

    this.logger.log(`[findByShop] Found ${result.count} products for shop ${shopId}`);

    return {
      data: result.data || [],
      total: result.count || 0,
      shopId,
    };
  }

  /**
   * Find single product by ID with related data including shop info
   */
  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.db.getEntity(EntityType.PRODUCT, id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Enrich product with shop data
    if (product.shopId) {
      try {
        const shop = await this.db.getEntity(EntityType.SHOP, product.shopId);
        if (shop) {
          product.shop = {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            logo: shop.logo,
            isVerified: shop.isVerified || shop.is_verified || false,
            rating: shop.rating,
            totalProducts: shop.totalProducts,
            totalReviews: shop.totalReviews,
          };
          product.shopName = shop.name;
        }
      } catch (err) {
        this.logger.warn(`[findOne] Error fetching shop data for product ${id}: ${err.message}`);
      }
    }

    return product;
  }

  /**
   * Find product by slug (SEO-friendly) with shop info
   */
  async findBySlug(slug: string): Promise<ProductEntity> {
    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { slug },
      limit: 1,
    });

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }

    const product = result.data[0];

    // Enrich product with shop data
    if (product.shopId) {
      try {
        const shop = await this.db.getEntity(EntityType.SHOP, product.shopId);
        if (shop) {
          product.shop = {
            id: shop.id,
            name: shop.name,
            slug: shop.slug,
            logo: shop.logo,
            isVerified: shop.isVerified || shop.is_verified || false,
            rating: shop.rating,
            totalProducts: shop.totalProducts,
            totalReviews: shop.totalReviews,
          };
          product.shopName = shop.name;
        }
      } catch (err) {
        this.logger.warn(`[findBySlug] Error fetching shop data for product ${slug}: ${err.message}`);
      }
    }

    return product;
  }

  /**
   * Find related products (same category)
   */
  async findRelated(productId: string, limit: number = 8) {
    try {
      const product = await this.findOne(productId);

      // Build filters - only add category filter if product has categories
      const filters: any = {
        status: 'active',
      };

      // If product has categories, filter by the first one using $contains for JSONB array
      if (product.categories && product.categories.length > 0) {
        // Get the first category (could be string or object)
        const firstCategory = product.categories[0];
        const categoryValue = typeof firstCategory === 'string' ? firstCategory : firstCategory?.id || firstCategory?.name;
        if (categoryValue) {
          // Use $contains operator for JSONB array search
          filters.categories = { $contains: categoryValue };
        }
      }

      const result = await this.db.queryEntities(EntityType.PRODUCT, {
        filters,
        limit: parseInt(limit.toString()) + 1, // Get one extra to filter out current product
      });

      // Filter out current product from results
      const filteredData = (result.data || []).filter((p: any) => p.id !== productId).slice(0, limit);

      return {
        data: filteredData,
        total: filteredData.length,
      };
    } catch (error) {
      console.error('Error fetching related products:', error);
      // Return empty array on error instead of throwing
      return {
        data: [],
        total: 0,
      };
    }
  }

  /**
   * Create new product (verify shop ownership)
   */
  async create(createProductDto: CreateProductDto, userId: string): Promise<ProductEntity> {
    // Verify shop ownership
    const shop = await this.verifyShopOwnership(createProductDto.shopId, userId);

    // Check product limit based on user's subscription
    const productCheck = await this.subscriptionService.canAddProductForUser(userId);
    if (!productCheck.allowed) {
      throw new ForbiddenException(productCheck.reason || 'Product limit reached. Please upgrade your plan to add more products.');
    }

    // Generate slug
    const slug = await this.generateUniqueSlug(createProductDto.name);

    // Prepare product data - map DTO fields to database schema
    const productData: Partial<ProductEntity> = {
      shopId: createProductDto.shopId,
      name: createProductDto.name,
      slug,
      brand: createProductDto.brand || null,
      description: createProductDto.description,
      shortDescription: createProductDto.shortDescription,
      material: createProductDto.material || null,
      features: createProductDto.features || [],
      specifications: createProductDto.specifications || {},

      // Pricing
      price: createProductDto.price,
      salePrice: createProductDto.flashSalePrice,
      costPrice: createProductDto.costPerItem,
      comparePrice: createProductDto.compareAtPrice,

      // Inventory
      sku: createProductDto.sku || '',
      barcode: createProductDto.barcode,
      stock: createProductDto.quantity || 0,
      lowStockThreshold: createProductDto.lowStockThreshold || 5,
      trackInventory: createProductDto.trackInventory !== false,
      allowBackorder: createProductDto.allowBackorders || false,

      // Status
      status: createProductDto.status || 'draft',
      productType: 'simple',

      // Media
      images: createProductDto.images || [],
      videos: [],

      // Variants & Size/Color options
      variants: createProductDto.variants || [],
      variantAttributes: [],
      sizes: createProductDto.sizes || [],
      colors: createProductDto.colors || [],
      careInstructions: createProductDto.careInstructions || [],
      sizeChart: createProductDto.sizeChart || [],
      shippingInfo: createProductDto.shippingInfo || {},
      returnPolicy: createProductDto.returnPolicy || {},

      // Categories - transform categoryId to categories array
      categories: createProductDto.categoryId ? [createProductDto.categoryId] : [],
      tags: createProductDto.tags || [],

      // Shipping
      requiresShipping: true,

      // SEO
      metaTitle: createProductDto.metaTitle || createProductDto.name,
      metaDescription: createProductDto.metaDescription,
      metaKeywords: [],

      // Features
      isFeatured: createProductDto.isFeatured || false,
      isNew: false,
      isBestseller: false,

      // Statistics
      viewCount: 0,
      rating: 0,
      totalReviews: 0,
      totalSales: 0,

      // Additional
      attributes: {},
      metadata: {
        taxable: createProductDto.taxable,
        taxRate: createProductDto.taxRate,
        campaignIds: createProductDto.campaignIds || [],
        offerIds: createProductDto.offerIds || [],
        isFlashSale: createProductDto.isFlashSale || false,
        flashSaleEndDate: createProductDto.flashSaleEndDate,
        scheduledPublishDate: createProductDto.scheduledPublishDate,
        visibility: createProductDto.visibility,
        password: createProductDto.password,
      },

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Create product
    const product = await this.db.createEntity(
      EntityType.PRODUCT,
      productData,
    );

    // Update shop product count
    await this.updateShopProductCount(createProductDto.shopId);

    return product;
  }

  /**
   * Update product (verify shop ownership)
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);

    // Verify shop ownership
    await this.verifyShopOwnership(product.shopId, userId);

    // Update slug if name changed
    let slug = product.slug;
    if (updateProductDto.name && updateProductDto.name !== product.name) {
      slug = await this.generateUniqueSlug(updateProductDto.name, id);
    }

    // Map DTO fields to database schema (same mapping as create method)
    const updateData: Partial<ProductEntity> = {
      slug,
      updatedAt: new Date().toISOString(),
    };

    // Only include fields that are actually provided in the DTO
    if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
    if (updateProductDto.description !== undefined) updateData.description = updateProductDto.description;
    if (updateProductDto.shortDescription !== undefined) updateData.shortDescription = updateProductDto.shortDescription;

    // Pricing - map DTO field names to database column names
    if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price;
    if (updateProductDto.flashSalePrice !== undefined) updateData.salePrice = updateProductDto.flashSalePrice;
    if (updateProductDto.costPerItem !== undefined) updateData.costPrice = updateProductDto.costPerItem;
    if (updateProductDto.compareAtPrice !== undefined) updateData.comparePrice = updateProductDto.compareAtPrice;

    // Inventory - map DTO field names to database column names
    if (updateProductDto.sku !== undefined) updateData.sku = updateProductDto.sku;
    if (updateProductDto.barcode !== undefined) updateData.barcode = updateProductDto.barcode;
    if (updateProductDto.quantity !== undefined) updateData.stock = updateProductDto.quantity;
    if (updateProductDto.lowStockThreshold !== undefined) updateData.lowStockThreshold = updateProductDto.lowStockThreshold;
    if (updateProductDto.trackInventory !== undefined) updateData.trackInventory = updateProductDto.trackInventory;
    if (updateProductDto.allowBackorders !== undefined) updateData.allowBackorder = updateProductDto.allowBackorders;

    // Status
    if (updateProductDto.status !== undefined) updateData.status = updateProductDto.status;

    // Media
    if (updateProductDto.images !== undefined) updateData.images = updateProductDto.images;

    // Variants
    if (updateProductDto.variants !== undefined) updateData.variants = updateProductDto.variants;

    // Size/Color options
    if (updateProductDto.sizes !== undefined) updateData.sizes = updateProductDto.sizes;
    if (updateProductDto.colors !== undefined) updateData.colors = updateProductDto.colors;
    if (updateProductDto.careInstructions !== undefined) updateData.careInstructions = updateProductDto.careInstructions;
    if (updateProductDto.sizeChart !== undefined) updateData.sizeChart = updateProductDto.sizeChart;
    if (updateProductDto.shippingInfo !== undefined) updateData.shippingInfo = updateProductDto.shippingInfo;
    if (updateProductDto.returnPolicy !== undefined) updateData.returnPolicy = updateProductDto.returnPolicy;

    // Brand, Material, Features, Specifications
    if (updateProductDto.brand !== undefined) updateData.brand = updateProductDto.brand;
    if (updateProductDto.material !== undefined) updateData.material = updateProductDto.material;
    if (updateProductDto.features !== undefined) updateData.features = updateProductDto.features;
    if (updateProductDto.specifications !== undefined) updateData.specifications = updateProductDto.specifications;

    // Categories - transform categoryId to categories array
    if (updateProductDto.categoryId !== undefined) {
      updateData.categories = updateProductDto.categoryId ? [updateProductDto.categoryId] : [];
    }
    if (updateProductDto.tags !== undefined) updateData.tags = updateProductDto.tags;

    // SEO
    if (updateProductDto.metaTitle !== undefined) updateData.metaTitle = updateProductDto.metaTitle;
    if (updateProductDto.metaDescription !== undefined) updateData.metaDescription = updateProductDto.metaDescription;

    // Additional fields
    if (updateProductDto.isFeatured !== undefined) updateData.isFeatured = updateProductDto.isFeatured;

    // Metadata fields - these are stored in the metadata JSONB column
    // Build metadata object from current product metadata and update with new values
    const metadata: any = { ...(product.metadata || {}) };

    if (updateProductDto.taxable !== undefined) metadata.taxable = updateProductDto.taxable;
    if (updateProductDto.taxRate !== undefined) metadata.taxRate = updateProductDto.taxRate;
    if (updateProductDto.campaignIds !== undefined) metadata.campaignIds = updateProductDto.campaignIds;
    if (updateProductDto.offerIds !== undefined) metadata.offerIds = updateProductDto.offerIds;
    if (updateProductDto.isFlashSale !== undefined) metadata.isFlashSale = updateProductDto.isFlashSale;
    if (updateProductDto.flashSaleEndDate !== undefined) metadata.flashSaleEndDate = updateProductDto.flashSaleEndDate;
    if (updateProductDto.scheduledPublishDate !== undefined) metadata.scheduledPublishDate = updateProductDto.scheduledPublishDate;
    if (updateProductDto.visibility !== undefined) metadata.visibility = updateProductDto.visibility;
    if (updateProductDto.password !== undefined) metadata.password = updateProductDto.password;

    updateData.metadata = metadata;

    return this.db.updateEntity(EntityType.PRODUCT, id, updateData);
  }

  /**
   * Update product inventory
   */
  async updateInventory(
    id: string,
    updateInventoryDto: UpdateInventoryDto,
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);

    // Verify shop ownership
    await this.verifyShopOwnership(product.shopId, userId);

    // Update individual inventory fields
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (updateInventoryDto.quantity !== undefined) {
      updateData.stock = updateInventoryDto.quantity;
    }
    if (updateInventoryDto.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = updateInventoryDto.lowStockThreshold;
    }
    if (updateInventoryDto.allowBackorder !== undefined) {
      updateData.allowBackorder = updateInventoryDto.allowBackorder;
    }

    return this.db.updateEntity(EntityType.PRODUCT, id, updateData);
  }

  /**
   * Update product status (publish/unpublish)
   */
  async updateStatus(
    id: string,
    status: 'active' | 'draft' | 'archived',
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);

    // Verify shop ownership
    await this.verifyShopOwnership(product.shopId, userId);

    return this.db.updateEntity(EntityType.PRODUCT, id, {
      status,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete product (soft delete by archiving)
   */
  async remove(id: string, userId: string) {
    this.logger.log(`[remove] Deleting product ${id} for user ${userId}`);
    const product = await this.findOne(id);

    // Verify shop ownership
    await this.verifyShopOwnership(product.shopId, userId);

    // Soft delete by archiving
    this.logger.log(`[remove] Setting product ${id} status to archived`);
    const updateResult = await this.db.updateEntity(EntityType.PRODUCT, id, {
      status: 'archived',
      updatedAt: new Date().toISOString(),
    });
    this.logger.log(`[remove] Update result: ${JSON.stringify(updateResult)}`);

    // Update shop product count
    await this.updateShopProductCount(product.shopId);

    this.logger.log(`[remove] Product ${id} deleted successfully`);
    return {
      message: 'Product deleted successfully',
      id,
    };
  }

  /**
   * Generate SEO-friendly slug
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate unique slug (check for duplicates)
   */
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = this.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const result = await this.db.queryEntities(EntityType.PRODUCT, {
        filters: { slug },
        limit: 1,
      });

      // If no product found with this slug, or it's the same product we're updating
      if (!result.data || result.data.length === 0 ||
          (excludeId && result.data[0].id === excludeId)) {
        break;
      }

      // Generate new slug with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Verify shop ownership
   */
  private async verifyShopOwnership(shopId: string, userId: string): Promise<ShopEntity> {
    const shop = await this.db.getEntity(EntityType.SHOP, shopId);

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${shopId} not found`);
    }

    if (shop.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to manage this shop');
    }

    return shop;
  }

  /**
   * Update shop product count
   */
  private async updateShopProductCount(shopId: string): Promise<void> {
    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { shopId, status: { $ne: 'archived' } },
    });

    const totalProducts = result.count || 0;

    await this.db.updateEntity(EntityType.SHOP, shopId, {
      totalProducts,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Add a new image to product
   */
  async addImage(
    id: string,
    imageDto: { url: string; alt: string; isPrimary?: boolean },
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);
    await this.verifyShopOwnership(product.shopId, userId);

    const images = Array.isArray(product.images) ? [...product.images] : [];

    // Generate unique image ID
    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // If this is set as primary, unset all other primary flags
    if (imageDto.isPrimary) {
      images.forEach(img => img.isPrimary = false);
    }

    // Add new image
    const newImage = {
      id: imageId,
      url: imageDto.url,
      alt: imageDto.alt,
      isPrimary: imageDto.isPrimary || (images.length === 0), // First image is primary by default
      order: images.length,
    };

    images.push(newImage);

    return this.db.updateEntity(EntityType.PRODUCT, id, {
      images,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Add multiple images to product at once
   */
  async addBulkImages(
    id: string,
    imageDtos: Array<{ url: string; alt: string; isPrimary?: boolean }>,
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);
    await this.verifyShopOwnership(product.shopId, userId);

    const images = Array.isArray(product.images) ? [...product.images] : [];
    let hasPrimary = images.some(img => img.isPrimary);

    // Add all new images
    imageDtos.forEach((imageDto, index) => {
      const imageId = `img-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;

      // Only allow one primary image
      const isPrimary = !hasPrimary && (imageDto.isPrimary || index === 0);
      if (isPrimary) hasPrimary = true;

      images.push({
        id: imageId,
        url: imageDto.url,
        alt: imageDto.alt,
        isPrimary,
        order: images.length,
      });
    });

    return this.db.updateEntity(EntityType.PRODUCT, id, {
      images,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Update image metadata
   */
  async updateImage(
    productId: string,
    imageId: string,
    updateDto: { alt?: string; isPrimary?: boolean },
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(productId);
    await this.verifyShopOwnership(product.shopId, userId);

    const images = Array.isArray(product.images) ? [...product.images] : [];
    const imageIndex = images.findIndex(img => img.id === imageId);

    if (imageIndex === -1) {
      throw new NotFoundException(`Image with ID ${imageId} not found in product`);
    }

    // Update image properties
    if (updateDto.alt !== undefined) {
      images[imageIndex].alt = updateDto.alt;
    }

    // If setting as primary, unset all others
    if (updateDto.isPrimary === true) {
      images.forEach((img, idx) => {
        img.isPrimary = idx === imageIndex;
      });
    } else if (updateDto.isPrimary === false) {
      images[imageIndex].isPrimary = false;
    }

    return this.db.updateEntity(EntityType.PRODUCT, productId, {
      images,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Remove an image from product
   */
  async removeImage(
    productId: string,
    imageId: string,
    userId: string,
  ) {
    const product = await this.findOne(productId);
    await this.verifyShopOwnership(product.shopId, userId);

    const images = Array.isArray(product.images) ? [...product.images] : [];
    const imageIndex = images.findIndex(img => img.id === imageId);

    if (imageIndex === -1) {
      throw new NotFoundException(`Image with ID ${imageId} not found in product`);
    }

    const removedImage = images[imageIndex];
    images.splice(imageIndex, 1);

    // If removed image was primary, set first image as primary
    if (removedImage.isPrimary && images.length > 0) {
      images[0].isPrimary = true;
    }

    // Reorder remaining images
    images.forEach((img, idx) => {
      img.order = idx;
    });

    await this.db.updateEntity(EntityType.PRODUCT, productId, {
      images,
      updatedAt: new Date().toISOString(),
    });

    return {
      message: 'Image removed successfully',
      imageId,
      productId,
    };
  }

  /**
   * Reorder product images
   */
  async reorderImages(
    productId: string,
    imageIds: string[],
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(productId);
    await this.verifyShopOwnership(product.shopId, userId);

    const images = Array.isArray(product.images) ? [...product.images] : [];

    // Create a map for quick lookup
    const imageMap = new Map(images.map(img => [img.id, img]));

    // Reorder images based on provided IDs
    const reorderedImages = imageIds
      .map(id => imageMap.get(id))
      .filter(img => img !== undefined)
      .map((img, index) => ({
        ...img,
        order: index,
      }));

    // Append any images not in the reorder list
    const reorderedIds = new Set(imageIds);
    const remainingImages = images
      .filter(img => !reorderedIds.has(img.id))
      .map((img, index) => ({
        ...img,
        order: reorderedImages.length + index,
      }));

    const finalImages = [...reorderedImages, ...remainingImages];

    return this.db.updateEntity(EntityType.PRODUCT, productId, {
      images: finalImages,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Set an image as primary
   */
  async setPrimaryImage(
    productId: string,
    imageId: string,
    userId: string,
  ): Promise<ProductEntity> {
    const product = await this.findOne(productId);
    await this.verifyShopOwnership(product.shopId, userId);

    const images = Array.isArray(product.images) ? [...product.images] : [];
    const imageIndex = images.findIndex(img => img.id === imageId);

    if (imageIndex === -1) {
      throw new NotFoundException(`Image with ID ${imageId} not found in product`);
    }

    // Unset all primary flags, then set the specified image as primary
    images.forEach((img, idx) => {
      img.isPrimary = idx === imageIndex;
    });

    return this.db.updateEntity(EntityType.PRODUCT, productId, {
      images,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Upload product image to storage
   */
  async uploadProductImage(file: Express.Multer.File, shopId: string) {
    try {
      // Generate unique filename (following Deskive pattern)
      const fileName = `product-${shopId}-${Date.now()}-${file.originalname}`;

      // Upload file to database storage using products bucket
      // Following exact pattern from Deskive workspace.service.ts uploadLogo
      const uploadResult = await /* TODO: use StorageService */ this.db.uploadFile(
        'products',
        file.buffer,
        fileName,
        {
          contentType: file.mimetype,
          metadata: {
            shopId,
            originalName: file.originalname,
            type: 'product-image'
          }
        }
      );

      this.logger.log(`[uploadProductImage] Image uploaded successfully: ${uploadResult.url}`);

      return {
        success: true,
        url: uploadResult.url,
        fileName: fileName,
      };
    } catch (error) {
      this.logger.error('[uploadProductImage] Failed to upload image:', error);
      throw new BadRequestException('Failed to upload product image');
    }
  }

  /**
   * Bulk edit multiple products
   * Supports: status update, price adjustment, inventory adjustment, category update, delete
   */
  async bulkEdit(
    bulkEditDto: BulkEditDto,
    userId: string,
    shopId: string,
  ): Promise<BulkEditResponseDto> {
    const { productIds, action } = bulkEditDto;
    const updatedProductIds: string[] = [];
    const errors: Array<{ productId: string; error: string }> = [];

    this.logger.log(`[bulkEdit] Starting bulk ${action} for ${productIds.length} products`);

    // Verify shop ownership once
    await this.verifyShopOwnership(shopId, userId);

    // Process each product
    for (const productId of productIds) {
      try {
        // Verify product belongs to this shop
        const product = await this.findOne(productId);
        if (product.shopId !== shopId) {
          errors.push({
            productId,
            error: 'Product does not belong to this shop',
          });
          continue;
        }

        switch (action) {
          case BulkAction.UPDATE_STATUS:
            if (!bulkEditDto.status) {
              errors.push({ productId, error: 'Status is required for status update' });
              continue;
            }
            await this.db.updateEntity(EntityType.PRODUCT, productId, {
              status: bulkEditDto.status,
              updatedAt: new Date().toISOString(),
            });
            break;

          case BulkAction.UPDATE_PRICE:
            const newPrice = this.calculateNewPrice(
              product.price,
              bulkEditDto.priceAdjustmentType,
              bulkEditDto.priceValue,
            );
            if (newPrice === null) {
              errors.push({ productId, error: 'Invalid price adjustment parameters' });
              continue;
            }
            await this.db.updateEntity(EntityType.PRODUCT, productId, {
              price: newPrice,
              updatedAt: new Date().toISOString(),
            });
            break;

          case BulkAction.UPDATE_INVENTORY:
            const newStock = this.calculateNewInventory(
              product.stock || 0,
              bulkEditDto.inventoryAdjustmentType,
              bulkEditDto.inventoryValue,
            );
            if (newStock === null) {
              errors.push({ productId, error: 'Invalid inventory adjustment parameters' });
              continue;
            }
            await this.db.updateEntity(EntityType.PRODUCT, productId, {
              stock: newStock,
              updatedAt: new Date().toISOString(),
            });
            break;

          case BulkAction.UPDATE_CATEGORY:
            if (!bulkEditDto.categoryId) {
              errors.push({ productId, error: 'Category ID is required for category update' });
              continue;
            }
            await this.db.updateEntity(EntityType.PRODUCT, productId, {
              categories: [bulkEditDto.categoryId],
              updatedAt: new Date().toISOString(),
            });
            break;

          case BulkAction.DELETE:
            await this.db.updateEntity(EntityType.PRODUCT, productId, {
              status: 'archived',
              updatedAt: new Date().toISOString(),
            });
            break;

          default:
            errors.push({ productId, error: `Unknown action: ${action}` });
            continue;
        }

        updatedProductIds.push(productId);
      } catch (error) {
        this.logger.error(`[bulkEdit] Error processing product ${productId}:`, error);
        errors.push({
          productId,
          error: error.message || 'Unknown error occurred',
        });
      }
    }

    // Update shop product count if we deleted products
    if (action === BulkAction.DELETE && updatedProductIds.length > 0) {
      await this.updateShopProductCount(shopId);
    }

    this.logger.log(
      `[bulkEdit] Completed: ${updatedProductIds.length} success, ${errors.length} failed`,
    );

    return {
      successCount: updatedProductIds.length,
      failedCount: errors.length,
      updatedProductIds,
      errors,
    };
  }

  /**
   * Calculate new price based on adjustment type
   */
  private calculateNewPrice(
    currentPrice: number,
    adjustmentType?: string,
    value?: number,
  ): number | null {
    if (value === undefined || value === null) return null;

    switch (adjustmentType) {
      case 'set':
        return Math.max(0, value);
      case 'increase':
        return Math.max(0, currentPrice + value);
      case 'decrease':
        return Math.max(0, currentPrice - value);
      case 'percentage_increase':
        return Math.max(0, currentPrice * (1 + value / 100));
      case 'percentage_decrease':
        return Math.max(0, currentPrice * (1 - value / 100));
      default:
        return null;
    }
  }

  /**
   * Calculate new inventory based on adjustment type
   */
  private calculateNewInventory(
    currentStock: number,
    adjustmentType?: string,
    value?: number,
  ): number | null {
    if (value === undefined || value === null) return null;

    switch (adjustmentType) {
      case 'set':
        return Math.max(0, Math.floor(value));
      case 'increase':
        return Math.max(0, Math.floor(currentStock + value));
      case 'decrease':
        return Math.max(0, Math.floor(currentStock - value));
      default:
        return null;
    }
  }
}
