import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { EntityType, CategoryEntity, ProductEntity } from '../../database/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find all categories with product counts
   */
  async findAll(includeInactive: boolean = false) {
    const filters: any = {};

    if (!includeInactive) {
      filters.is_active = true;
    }

    const result = await this.db.queryEntities(EntityType.CATEGORY, {
      filters,
    });

    // Sort by order and then by name
    const categories = (result.data || []).sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      data: categories,
      total: result.count || 0,
    };
  }

  /**
   * Find categories for a specific shop (with product counts for that shop)
   * Categories are platform-wide, but this returns them with shop-specific product counts
   */
  async findByShop(shopId: string) {
    // Get all active categories
    const categoriesResult = await this.db.queryEntities(
      EntityType.CATEGORY,
      {
        filters: { is_active: true },
      },
    );

    const categories = categoriesResult.data || [];

    // Get all products for this shop to count categories
    const productsResult = await this.db.queryEntities(
      EntityType.PRODUCT,
      {
        filters: { shop_id: shopId, status: { $ne: 'archived' } },
      },
    );

    const products = productsResult.data || [];

    // Count products per category for this shop
    const categoryProductCounts = new Map<string, number>();
    products.forEach((product: any) => {
      const productCategories = product.categories || [];
      productCategories.forEach((categoryId: string) => {
        categoryProductCounts.set(
          categoryId,
          (categoryProductCounts.get(categoryId) || 0) + 1,
        );
      });
    });

    // Add shop-specific product counts to categories
    const categoriesWithCounts = categories.map((category: CategoryEntity) => ({
      ...category,
      productCount: categoryProductCounts.get(category.id) || 0,
    }));

    // Sort by display_order and name
    categoriesWithCounts.sort((a, b) => {
      if (a.displayOrder !== b.displayOrder) {
        return a.displayOrder - b.displayOrder;
      }
      return a.name.localeCompare(b.name);
    });

    return categoriesWithCounts;
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async findTree() {
    const result = await this.db.queryEntities(EntityType.CATEGORY, {
      filters: { is_active: true },
    });

    const categories = result.data || [];

    // Build tree structure
    const categoryMap = new Map<string, any>();
    const rootCategories: any[] = [];

    // First pass: create map of all categories
    categories.forEach((category: CategoryEntity) => {
      categoryMap.set(category.id, {
        ...category,
        children: [],
      });
    });

    // Second pass: build tree
    categories.forEach((category: CategoryEntity) => {
      const node = categoryMap.get(category.id);

      if (category.parentId && categoryMap.has(category.parentId)) {
        // Add to parent's children
        const parent = categoryMap.get(category.parentId);
        parent.children.push(node);
      } else {
        // Root level category
        rootCategories.push(node);
      }
    });

    // Sort by order
    const sortByOrder = (items: any[]) => {
      items.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name);
      });
      items.forEach((item) => {
        if (item.children.length > 0) {
          sortByOrder(item.children);
        }
      });
    };

    sortByOrder(rootCategories);

    return {
      data: rootCategories,
      total: rootCategories.length,
    };
  }

  /**
   * Find featured categories
   */
  async findFeatured(limit: number = 8) {
    // Get top-level categories with most products
    const result = await this.db.queryEntities(EntityType.CATEGORY, {
      filters: { is_active: true, level: 0 },
    });

    const categories = (result.data || [])
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, limit);

    return {
      data: categories,
      total: categories.length,
    };
  }

  /**
   * Find single category by ID
   */
  async findOne(id: string): Promise<CategoryEntity> {
    const category = await this.db.getEntity(EntityType.CATEGORY, id);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Find category by slug (SEO-friendly)
   */
  async findBySlug(slug: string): Promise<CategoryEntity> {
    const result = await this.db.queryEntities(EntityType.CATEGORY, {
      filters: { slug },
      limit: 1,
    });

    if (!result.data || result.data.length === 0) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return result.data[0];
  }

  /**
   * Get products in category
   */
  async getProducts(categoryId: string, limit: number = 20, offset: number = 0) {
    // Verify category exists
    await this.findOne(categoryId);

    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { categories: { $contains: categoryId }, status: 'active' },
      limit: parseInt(limit.toString()),
      offset: parseInt(offset.toString()),
    });

    return {
      data: result.data || [],
      total: result.count || 0,
      categoryId,
    };
  }

  /**
   * Get subcategories of a category
   */
  async getSubcategories(parentId: string) {
    // Verify parent category exists
    await this.findOne(parentId);

    const result = await this.db.queryEntities(EntityType.CATEGORY, {
      filters: { parentId, is_active: true },
    });

    const subcategories = (result.data || []).sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name);
    });

    return {
      data: subcategories,
      total: result.count || 0,
      parentId,
    };
  }

  /**
   * Create new category
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    // Generate slug
    const slug = await this.generateUniqueSlug(createCategoryDto.name);

    // Determine level based on parent
    let level = 0;
    if (createCategoryDto.parentId) {
      const parent = await this.findOne(createCategoryDto.parentId);
      level = parent.level + 1;
    }

    const categoryData: Partial<CategoryEntity> = {
      ...createCategoryDto,
      slug,
      level,
      isActive: createCategoryDto.isActive !== undefined ? createCategoryDto.isActive : true,
      displayOrder: (createCategoryDto as any).order !== undefined ? (createCategoryDto as any).order : 0,
      productCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.db.createEntity(EntityType.CATEGORY, categoryData);
  }

  /**
   * Update category
   */
  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id);

    // Update slug if name changed
    let slug = category.slug;
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      slug = await this.generateUniqueSlug(updateCategoryDto.name, id);
    }

    // Update level if parent changed
    let level = category.level;
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId) {
        // Prevent setting self as parent
        if (updateCategoryDto.parentId === id) {
          throw new BadRequestException('Category cannot be its own parent');
        }

        const parent = await this.findOne(updateCategoryDto.parentId);
        level = parent.level + 1;
      } else {
        level = 0;
      }
    }

    const updateData: Partial<CategoryEntity> = {
      ...updateCategoryDto,
      slug,
      level,
      updatedAt: new Date().toISOString(),
    };

    return this.db.updateEntity(EntityType.CATEGORY, id, updateData);
  }

  /**
   * Delete category (check for products and subcategories first)
   */
  async remove(id: string) {
    const category = await this.findOne(id);

    // Check if category has products
    const productsResult = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { categories: { $contains: id }, status: { $ne: 'archived' } },
      limit: 1,
    });

    console.log('[Categories Service] Delete check:', {
      categoryId: id,
      categoryName: category.name,
      productsFound: productsResult.count || 0,
      hasProducts: productsResult.data && productsResult.data.length > 0,
      products: productsResult.data
    });

    if (productsResult.data && productsResult.data.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with products. Please reassign or delete products first.',
      );
    }

    // Check if category has subcategories
    const subcategoriesResult = await this.db.queryEntities(
      EntityType.CATEGORY,
      {
        filters: { parentId: id },
        limit: 1,
      },
    );

    if (subcategoriesResult.data && subcategoriesResult.data.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories. Please delete subcategories first.',
      );
    }

    // Delete category
    await this.db.deleteEntity(EntityType.CATEGORY, id);

    return {
      message: 'Category deleted successfully',
      id,
    };
  }

  /**
   * Update product count for category
   */
  async updateProductCount(categoryId: string): Promise<void> {
    const result = await this.db.queryEntities(EntityType.PRODUCT, {
      filters: { categories: { $contains: categoryId }, status: 'active' },
    });

    const productCount = result.count || 0;

    await this.db.updateEntity(EntityType.CATEGORY, categoryId, {
      productCount,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Generate SEO-friendly slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Toggle category featured status
   */
  async toggleFeatured(id: string): Promise<CategoryEntity> {
    const category = await this.findOne(id);

    const updateData: Partial<CategoryEntity> = {
      isFeatured: !category.isFeatured,
      updatedAt: new Date().toISOString(),
    };

    return this.db.updateEntity(EntityType.CATEGORY, id, updateData);
  }

  /**
   * Generate unique slug (check for duplicates)
   */
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = this.generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const result = await this.db.queryEntities(EntityType.CATEGORY, {
        filters: { slug },
        limit: 1,
      });

      // If no category found with this slug, or it's the same category we're updating
      if (
        !result.data ||
        result.data.length === 0 ||
        (excludeId && result.data[0].id === excludeId)
      ) {
        break;
      }

      // Generate new slug with counter
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
