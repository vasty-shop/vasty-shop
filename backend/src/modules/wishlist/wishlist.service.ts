import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AddToWishlistDto, CreateWishlistDto, UpdateWishlistDto, WishlistPrivacy } from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class WishlistService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Get all wishlists for a user
   */
  async getUserWishlists(userId: string) {
    const wishlists = await this.db.queryEntities('wishlists', {
      filters: { user_id: userId, deleted_at: null },
      orderBy: 'created_at',
      order: 'desc',
    });

    // Get product details for each wishlist
    for (const wishlist of wishlists.data || []) {
      if (wishlist.products && wishlist.products.length > 0) {
        const productIds = wishlist.products
          .map((item: any) => item.product_id)
          .filter((id: string | null | undefined) => id != null);

        if (productIds.length === 0) {
          wishlist.items = [];
          continue;
        }

        const productDetails = await this.db.queryEntities('products', {
          filters: { id: { $in: productIds } },
        });

        // Attach product details to items
        wishlist.items = wishlist.products.map((item: any) => ({
          ...item,
          product: productDetails.data?.find((p: any) => p.id === item.product_id),
        }));
      } else {
        wishlist.items = [];
      }
    }

    return wishlists;
  }

  /**
   * Get a single wishlist by ID
   */
  async getWishlist(wishlistId: string, userId?: string) {
    const wishlist = await this.db.getEntity('wishlists', wishlistId);

    if (!wishlist || wishlist.deleted_at) {
      throw new NotFoundException('Wishlist not found');
    }

    // Check privacy
    if (wishlist.privacy === WishlistPrivacy.PRIVATE && wishlist.user_id !== userId) {
      throw new ForbiddenException('This wishlist is private');
    }

    // Get product details
    if (wishlist.products && wishlist.products.length > 0) {
      const productIds = wishlist.products
        .map((item: any) => item.product_id)
        .filter((id: string | null | undefined) => id != null);

      if (productIds.length > 0) {
        const productDetails = await this.db.queryEntities('products', {
          filters: { id: { $in: productIds } },
        });

        wishlist.items = wishlist.products.map((item: any) => ({
          ...item,
          product: productDetails.data?.find((p: any) => p.id === item.product_id),
        }));
      } else {
        wishlist.items = [];
      }
    } else {
      wishlist.items = [];
    }

    return wishlist;
  }

  /**
   * Get shared wishlist by token
   */
  async getSharedWishlist(shareToken: string) {
    const wishlists = await this.db.queryEntities('wishlists', {
      filters: { share_token: shareToken, deleted_at: null },
      limit: 1,
    });

    if (!wishlists.data || wishlists.data.length === 0) {
      throw new NotFoundException('Shared wishlist not found');
    }

    const wishlist = wishlists.data[0];

    if (wishlist.privacy === WishlistPrivacy.PRIVATE) {
      throw new ForbiddenException('This wishlist is not shared');
    }

    // Get product details
    if (wishlist.products && wishlist.products.length > 0) {
      const productIds = wishlist.products
        .map((item: any) => item.product_id)
        .filter((id: string | null | undefined) => id != null);

      if (productIds.length > 0) {
        const productDetails = await this.db.queryEntities('products', {
          filters: { id: { $in: productIds } },
        });

        wishlist.items = wishlist.products.map((item: any) => ({
          ...item,
          product: productDetails.data?.find((p: any) => p.id === item.product_id),
        }));
      } else {
        wishlist.items = [];
      }
    } else {
      wishlist.items = [];
    }

    return wishlist;
  }

  /**
   * Create a new wishlist
   */
  async createWishlist(dto: CreateWishlistDto, userId: string) {
    const shareToken = randomBytes(16).toString('hex');

    return await this.db.createEntity('wishlists', {
      user_id: userId,
      name: dto.name,
      privacy: dto.privacy || WishlistPrivacy.PRIVATE,
      share_token: shareToken,
      products: [],
      total_items: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });
  }

  /**
   * Update wishlist details
   */
  async updateWishlist(wishlistId: string, dto: UpdateWishlistDto, userId: string) {
    const wishlist = await this.db.getEntity('wishlists', wishlistId);

    if (!wishlist || wishlist.deleted_at) {
      throw new NotFoundException('Wishlist not found');
    }

    if (wishlist.user_id !== userId) {
      throw new ForbiddenException('You can only update your own wishlists');
    }

    return await this.db.updateEntity('wishlists', wishlistId, {
      ...dto,
      updated_at: new Date(),
    });
  }

  /**
   * Delete a wishlist
   */
  async deleteWishlist(wishlistId: string, userId: string) {
    const wishlist = await this.db.getEntity('wishlists', wishlistId);

    if (!wishlist || wishlist.deleted_at) {
      throw new NotFoundException('Wishlist not found');
    }

    if (wishlist.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own wishlists');
    }

    return await this.db.updateEntity('wishlists', wishlistId, {
      deleted_at: new Date(),
    });
  }

  /**
   * Add a product to wishlist
   */
  async addToWishlist(dto: AddToWishlistDto, userId: string) {
    // Verify product exists
    const product = await this.db.getEntity('products', dto.productId);
    if (!product || product.deleted_at) {
      throw new NotFoundException('Product not found');
    }

    // Get or create default wishlist
    let wishlist;
    if (dto.wishlistId) {
      wishlist = await this.db.getEntity('wishlists', dto.wishlistId);
      if (!wishlist || wishlist.deleted_at) {
        throw new NotFoundException('Wishlist not found');
      }
      if (wishlist.user_id !== userId) {
        throw new ForbiddenException('You can only add to your own wishlists');
      }
    } else {
      // Get or create default wishlist - query all and filter manually for reliability
      console.log('[addToWishlist] Finding default wishlist for user:', userId);
      const wishlists = await this.db.queryEntities('wishlists', {
        filters: { user_id: userId },
        limit: 100,
      });

      console.log('[addToWishlist] Query result count:', wishlists.data?.length);

      // Find existing default wishlist for THIS user
      const existingWishlist = wishlists.data?.find(
        (w: any) => w.name === 'My Wishlist' && !w.deleted_at && w.user_id === userId
      );

      if (existingWishlist) {
        console.log('[addToWishlist] Found existing wishlist:', existingWishlist.id);
        wishlist = existingWishlist;
      } else {
        console.log('[addToWishlist] Creating new wishlist for user:', userId);
        wishlist = await this.createWishlist(
          {
            name: 'My Wishlist',
            privacy: WishlistPrivacy.PRIVATE,
          },
          userId,
        );
        console.log('[addToWishlist] Created new wishlist:', wishlist.id);
      }
    }

    // Check if product already in wishlist
    const products = wishlist.products || [];
    const existingItem = products.find((item: any) => item.product_id === dto.productId);

    if (existingItem) {
      throw new ConflictException('Product already in wishlist');
    }

    // Add product to wishlist
    const newItem = {
      product_id: dto.productId,
      added_at: new Date(),
      notes: dto.note || null,
      variant_id: null,
    };

    products.push(newItem);

    return await this.db.updateEntity('wishlists', wishlist.id, {
      products,
      total_items: products.length,
      updated_at: new Date(),
    });
  }

  /**
   * Remove a product from wishlist
   */
  async removeFromWishlist(productId: string, userId: string, wishlistId?: string) {
    let wishlist;

    console.log('[removeFromWishlist] Starting removal');
    console.log('[removeFromWishlist] productId:', productId);
    console.log('[removeFromWishlist] userId from JWT:', userId);
    console.log('[removeFromWishlist] wishlistId param:', wishlistId);

    if (wishlistId) {
      wishlist = await this.db.getEntity('wishlists', wishlistId);
      console.log('[removeFromWishlist] Found wishlist by ID:', wishlist?.id);
      console.log('[removeFromWishlist] Wishlist user_id:', wishlist?.user_id);
      if (!wishlist || wishlist.deleted_at) {
        throw new NotFoundException('Wishlist not found');
      }
    } else {
      // Find default wishlist - query all wishlists for user and filter manually
      console.log('[removeFromWishlist] Finding default wishlist for user:', userId);
      const wishlists = await this.db.queryEntities('wishlists', {
        filters: { user_id: userId },
        limit: 100,
      });

      console.log('[removeFromWishlist] Query result count:', wishlists.data?.length);

      if (!wishlists.data || wishlists.data.length === 0) {
        throw new NotFoundException('Wishlist not found');
      }

      // Find the default wishlist manually to ensure correct filtering
      wishlist = wishlists.data.find(
        (w: any) => w.name === 'My Wishlist' && !w.deleted_at && w.user_id === userId
      );

      if (!wishlist) {
        // Fallback: try any non-deleted wishlist for this user
        wishlist = wishlists.data.find((w: any) => !w.deleted_at && w.user_id === userId);
      }

      if (!wishlist) {
        console.log('[removeFromWishlist] No valid wishlist found for user');
        throw new NotFoundException('Wishlist not found');
      }

      console.log('[removeFromWishlist] Found wishlist:', wishlist.id);
      console.log('[removeFromWishlist] Wishlist user_id:', wishlist.user_id);
    }

    console.log('[removeFromWishlist] Comparing user_id:', wishlist.user_id, '!==', userId, '=', wishlist.user_id !== userId);

    // This check should now always pass since we manually verified user_id above
    if (wishlist.user_id !== userId) {
      console.log('[removeFromWishlist] MISMATCH! Wishlist belongs to different user');
      throw new ForbiddenException('You can only modify your own wishlists');
    }

    // Remove product from products array
    const products = wishlist.products || [];
    const newProducts = products.filter((item: any) => item.product_id !== productId);

    if (products.length === newProducts.length) {
      throw new NotFoundException('Product not found in wishlist');
    }

    return await this.db.updateEntity('wishlists', wishlist.id, {
      products: newProducts,
      total_items: newProducts.length,
      updated_at: new Date(),
    });
  }

  /**
   * Clear all items from a wishlist
   */
  async clearWishlist(wishlistId: string, userId: string) {
    const wishlist = await this.db.getEntity('wishlists', wishlistId);

    if (!wishlist || wishlist.deleted_at) {
      throw new NotFoundException('Wishlist not found');
    }

    if (wishlist.user_id !== userId) {
      throw new ForbiddenException('You can only clear your own wishlists');
    }

    return await this.db.updateEntity('wishlists', wishlistId, {
      products: [],
      total_items: 0,
      updated_at: new Date(),
    });
  }

  /**
   * Check if a product is in user's wishlist
   */
  async checkProductInWishlist(productId: string, userId: string) {
    const wishlists = await this.db.queryEntities('wishlists', {
      filters: { user_id: userId, deleted_at: null },
    });

    for (const wishlist of wishlists.data || []) {
      const products = wishlist.products || [];
      const found = products.find((item: any) => item.product_id === productId);
      if (found) {
        return {
          inWishlist: true,
          wishlistId: wishlist.id,
          wishlistName: wishlist.name,
        };
      }
    }

    return { inWishlist: false };
  }

  /**
   * Update wishlist privacy
   */
  async updatePrivacy(wishlistId: string, privacy: WishlistPrivacy, userId: string) {
    const wishlist = await this.db.getEntity('wishlists', wishlistId);

    if (!wishlist || wishlist.deleted_at) {
      throw new NotFoundException('Wishlist not found');
    }

    if (wishlist.user_id !== userId) {
      throw new ForbiddenException('You can only update your own wishlists');
    }

    // Generate new share token if changing to shared
    let shareToken = wishlist.share_token;
    if (privacy === WishlistPrivacy.SHARED && !shareToken) {
      shareToken = randomBytes(16).toString('hex');
    }

    return await this.db.updateEntity('wishlists', wishlistId, {
      privacy,
      share_token: shareToken,
      updated_at: new Date(),
    });
  }

  /**
   * Move all items from wishlist to cart
   */
  async moveToCart(wishlistId: string, userId: string) {
    const wishlist = await this.db.getEntity('wishlists', wishlistId);

    if (!wishlist || wishlist.deleted_at) {
      throw new NotFoundException('Wishlist not found');
    }

    if (wishlist.user_id !== userId) {
      throw new ForbiddenException('You can only access your own wishlists');
    }

    const wishlistProducts = wishlist.products || [];

    if (wishlistProducts.length === 0) {
      throw new ConflictException('Wishlist is empty');
    }

    // Get or create cart for user
    const carts = await this.db.queryEntities('carts', {
      filters: { user_id: userId },
      limit: 1,
    });

    let cart;
    if (carts.data && carts.data.length > 0) {
      cart = carts.data[0];
    } else {
      cart = await this.db.createEntity('carts', {
        user_id: userId,
        items: [],
        applied_coupons: [],
        totals: {},
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    // Get product details to verify availability
    const productIds = wishlistProducts
      .map((item: any) => item.product_id)
      .filter((id: string | null | undefined) => id != null);

    if (productIds.length === 0) {
      return {
        success: true,
        addedCount: 0,
        addedProducts: [],
        unavailableCount: wishlistProducts.length,
        unavailableProducts: wishlistProducts.map(() => 'Unknown product'),
      };
    }

    const productDetails = await this.db.queryEntities('products', {
      filters: { id: { $in: productIds } },
    });

    const cartItems = cart.items || [];
    const addedProducts: string[] = [];
    const unavailableProducts: string[] = [];

    for (const wishlistItem of wishlistProducts) {
      const product = productDetails.data?.find((p: any) => p.id === wishlistItem.product_id);

      if (!product || product.deleted_at || product.status !== 'published') {
        unavailableProducts.push(product?.name || wishlistItem.product_id);
        continue;
      }

      if (product.stock <= 0) {
        unavailableProducts.push(product.name);
        continue;
      }

      // Check if already in cart
      const existingCartItem = cartItems.find((item: any) => item.product_id === wishlistItem.product_id);

      if (existingCartItem) {
        // Update quantity
        existingCartItem.quantity += 1;
      } else {
        // Add new item to cart
        cartItems.push({
          product_id: wishlistItem.product_id,
          quantity: 1,
          price: product.sale_price || product.price,
          selected_variant: null,
          added_at: new Date(),
        });
      }

      addedProducts.push(product.name);
    }

    // Update cart
    await this.db.updateEntity('carts', cart.id, {
      items: cartItems,
      updated_at: new Date(),
    });

    // Clear wishlist
    await this.db.updateEntity('wishlists', wishlistId, {
      products: [],
      total_items: 0,
      updated_at: new Date(),
    });

    return {
      success: true,
      addedCount: addedProducts.length,
      addedProducts,
      unavailableCount: unavailableProducts.length,
      unavailableProducts,
    };
  }

  // TODO: Implement price drop tracking
  // TODO: Implement back-in-stock alerts
  // TODO: Implement email notifications for price drops
  // TODO: Implement wishlist sharing via email
  // TODO: Implement wishlist analytics (most wished products)
}
