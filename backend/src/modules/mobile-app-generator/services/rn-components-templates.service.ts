import { Injectable } from '@nestjs/common';
import { MobileAppConfig, GeneratedFile } from '../interfaces/types';

@Injectable()
export class RNComponentsTemplatesService {
  /**
   * Generate all common components
   */
  generateComponents(config: MobileAppConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // Product Card
    files.push(this.generateProductCard(config));

    // Category Card
    files.push(this.generateCategoryCard(config));

    // Cart Item
    files.push(this.generateCartItem(config));

    // Order Card
    files.push(this.generateOrderCard(config));

    // Banner Carousel
    files.push(this.generateBannerCarousel(config));

    // Search Bar
    files.push(this.generateSearchBar(config));

    // Rating Stars
    files.push(this.generateRatingStars(config));

    // Quantity Selector
    files.push(this.generateQuantitySelector(config));

    // Empty State
    files.push(this.generateEmptyState(config));

    // Loading Skeleton
    files.push(this.generateLoadingSkeleton(config));

    // Button
    files.push(this.generateButton(config));

    // Input
    files.push(this.generateInput(config));

    // Toast Config
    files.push(this.generateToastConfig(config));

    // Components Index
    files.push(this.generateComponentsIndex(config));

    return files;
  }

  /**
   * Generate Product Card Component
   */
  private generateProductCard(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/ProductCard.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FastImage from 'react-native-fast-image';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';
import { Product } from '@api/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: (id: string) => void;
  isInWishlist?: boolean;
  variant?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToWishlist,
  isInWishlist = false,
  variant = 'grid',
}) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0;

  const handlePress = () => {
    navigation.navigate('ProductDetail', { id: product.id });
  };

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listContainer} onPress={handlePress} activeOpacity={0.7}>
        <FastImage
          source={{ uri: product.images?.[0] || '' }}
          style={styles.listImage}
          resizeMode={FastImage.resizeMode.cover}
        />
        <View style={styles.listContent}>
          <Text style={styles.listName} numberOfLines={2}>{product.name}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              \${(product.discountPrice || product.price).toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>\${product.price.toFixed(2)}</Text>
            )}
          </View>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={theme.colors.warning} />
            <Text style={styles.rating}>{product.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount || 0})</Text>
          </View>
        </View>
        {onAddToWishlist && (
          <TouchableOpacity
            style={styles.listWishlistBtn}
            onPress={() => onAddToWishlist(product.id)}
          >
            <Icon
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={22}
              color={isInWishlist ? theme.colors.error : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <FastImage
          source={{ uri: product.images?.[0] || '' }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}
        {onAddToWishlist && (
          <TouchableOpacity
            style={styles.wishlistBtn}
            onPress={() => onAddToWishlist(product.id)}
          >
            <Icon
              name={isInWishlist ? 'heart' : 'heart-outline'}
              size={20}
              color={isInWishlist ? theme.colors.error : theme.colors.text}
            />
          </TouchableOpacity>
        )}
        {product.stock === 0 && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>
            \${(product.discountPrice || product.price).toFixed(2)}
          </Text>
          {hasDiscount && (
            <Text style={styles.originalPrice}>\${product.price.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.ratingRow}>
          <Icon name="star" size={12} color={theme.colors.warning} />
          <Text style={styles.rating}>{product.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount || 0})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  discountText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  wishlistBtn: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  outOfStock: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#FFFFFF',
    fontFamily: theme.typography.fontFamily.medium,
  },
  content: {
    padding: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
    height: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  price: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  originalPrice: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    marginLeft: theme.spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    marginLeft: 2,
    fontFamily: theme.typography.fontFamily.medium,
  },
  reviewCount: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },
  // List variant styles
  listContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
  },
  listContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  listName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  listWishlistBtn: {
    justifyContent: 'center',
    paddingLeft: theme.spacing.sm,
  },
});

export default ProductCard;
`,
    };
  }

  /**
   * Generate Category Card Component
   */
  private generateCategoryCard(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/CategoryCard.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';
import { Category } from '@api/types';

interface CategoryCardProps {
  category: Category;
  variant?: 'circle' | 'square' | 'card';
  size?: 'small' | 'medium' | 'large';
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  variant = 'circle',
  size = 'medium',
}) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles((theme) => createStyles(theme, size));

  const handlePress = () => {
    navigation.navigate('Products', { categoryId: category.id, title: category.name });
  };

  if (variant === 'card') {
    return (
      <TouchableOpacity style={styles.cardContainer} onPress={handlePress} activeOpacity={0.7}>
        {category.image ? (
          <FastImage
            source={{ uri: category.image }}
            style={styles.cardImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <View style={styles.cardPlaceholder}>
            <Icon name="tag" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
        <View style={styles.cardOverlay}>
          <Text style={styles.cardName}>{category.name}</Text>
          {category.productCount !== undefined && (
            <Text style={styles.cardCount}>{category.productCount} items</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'square') {
    return (
      <TouchableOpacity style={styles.squareContainer} onPress={handlePress} activeOpacity={0.7}>
        <View style={styles.squareImageContainer}>
          {category.image ? (
            <FastImage
              source={{ uri: category.image }}
              style={styles.squareImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <Icon name="tag" size={28} color={theme.colors.primary} />
          )}
        </View>
        <Text style={styles.squareName} numberOfLines={1}>{category.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.circleContainer} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.circleImageContainer}>
        {category.image ? (
          <FastImage
            source={{ uri: category.image }}
            style={styles.circleImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        ) : (
          <Icon name="tag" size={24} color={theme.colors.primary} />
        )}
      </View>
      <Text style={styles.circleName} numberOfLines={1}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme, size: 'small' | 'medium' | 'large') => {
  const sizeMap = {
    small: { circle: 50, square: 60, card: 120 },
    medium: { circle: 70, square: 80, card: 150 },
    large: { circle: 90, square: 100, card: 180 },
  };

  const dimensions = sizeMap[size];

  return {
    // Circle variant
    circleContainer: {
      alignItems: 'center',
      marginRight: theme.spacing.md,
      width: dimensions.circle + 10,
    },
    circleImageContainer: {
      width: dimensions.circle,
      height: dimensions.circle,
      borderRadius: dimensions.circle / 2,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    circleImage: {
      width: '100%',
      height: '100%',
    },
    circleName: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    // Square variant
    squareContainer: {
      alignItems: 'center',
      marginRight: theme.spacing.md,
      width: dimensions.square + 10,
    },
    squareImageContainer: {
      width: dimensions.square,
      height: dimensions.square,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    squareImage: {
      width: '100%',
      height: '100%',
    },
    squareName: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.medium,
    },
    // Card variant
    cardContainer: {
      width: dimensions.card,
      height: dimensions.card * 0.8,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginRight: theme.spacing.md,
      ...theme.shadows.md,
    },
    cardImage: {
      width: '100%',
      height: '100%',
    },
    cardPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: theme.spacing.sm,
    },
    cardName: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: '#FFFFFF',
    },
    cardCount: {
      fontSize: theme.typography.fontSize.xs,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 2,
    },
  };
};

export default CategoryCard;
`,
    };
  }

  /**
   * Generate Cart Item Component
   */
  private generateCartItem(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/CartItem.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';
import { QuantitySelector } from './QuantitySelector';
import { CartItem as CartItemType } from '@api/types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  const hasVariant = item.variant && (item.variant.color || item.variant.size);

  return (
    <View style={styles.container}>
      <FastImage
        source={{ uri: item.product.images?.[0] || '' }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => onRemove(item.id)}
            disabled={disabled}
          >
            <Icon name="close" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {hasVariant && (
          <View style={styles.variantRow}>
            {item.variant?.color && (
              <View style={styles.variantItem}>
                <View style={[styles.colorDot, { backgroundColor: item.variant.color }]} />
                <Text style={styles.variantText}>{item.variant.colorName}</Text>
              </View>
            )}
            {item.variant?.size && (
              <View style={styles.variantItem}>
                <Text style={styles.variantText}>Size: {item.variant.size}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>
            \${((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
          </Text>
          <QuantitySelector
            value={item.quantity}
            onChange={(qty) => onUpdateQuantity(item.id, qty)}
            min={1}
            max={item.product.stock}
            size="small"
            disabled={disabled}
          />
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.md,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    marginRight: theme.spacing.sm,
  },
  removeBtn: {
    padding: 4,
  },
  variantRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.xs,
  },
  variantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  variantText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  price: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
});

export default CartItem;
`,
    };
  }

  /**
   * Generate Order Card Component
   */
  private generateOrderCard(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/OrderCard.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';
import { Order } from '@api/types';

interface OrderCardProps {
  order: Order;
}

const STATUS_CONFIG: Record<string, { color: string; icon: string }> = {
  pending: { color: 'warning', icon: 'clock-outline' },
  confirmed: { color: 'info', icon: 'check' },
  processing: { color: 'info', icon: 'cog' },
  shipped: { color: 'primary', icon: 'truck-delivery' },
  delivered: { color: 'success', icon: 'check-circle' },
  cancelled: { color: 'error', icon: 'close-circle' },
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const statusColor = theme.colors[statusConfig.color as keyof typeof theme.colors] || theme.colors.textSecondary;

  const handlePress = () => {
    navigation.navigate('OrderDetail', { id: order.id });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderNumber}>Order #{order.orderNumber}</Text>
          <Text style={styles.date}>
            {format(new Date(order.createdAt), 'MMM dd, yyyy')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <Icon name={statusConfig.icon} size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.itemsPreview}>
        {order.items.slice(0, 3).map((item, index) => (
          <View key={item.id} style={[styles.itemImage, { zIndex: 3 - index }]}>
            <FastImage
              source={{ uri: item.product?.images?.[0] || '' }}
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
            />
          </View>
        ))}
        {order.items.length > 3 && (
          <View style={styles.moreItems}>
            <Text style={styles.moreItemsText}>+{order.items.length - 3}</Text>
          </View>
        )}
        <Text style={styles.itemCount}>
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.total}>\${order.total.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  orderNumber: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  date: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.medium,
    marginLeft: 4,
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  moreItems: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.border,
    marginLeft: -10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  moreItemsText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
  },
  itemCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  total: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
});

export default OrderCard;
`,
    };
  }

  /**
   * Generate Banner Carousel Component
   */
  private generateBannerCarousel(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/BannerCarousel.tsx',
      type: 'component',
      content: `import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

const { width } = Dimensions.get('window');

interface Banner {
  id: string;
  image: string;
  link?: string;
  linkType?: 'product' | 'category' | 'url';
  linkId?: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  height?: number;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  banners,
  autoPlay = true,
  autoPlayInterval = 4000,
  height = 180,
}) => {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useStyles((t) => createStyles(t, height));

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (autoPlay && banners.length > 1) {
      intervalRef.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeIndex, autoPlay, autoPlayInterval, banners.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleBannerPress = (banner: Banner) => {
    if (banner.linkType === 'product' && banner.linkId) {
      navigation.navigate('ProductDetail', { id: banner.linkId });
    } else if (banner.linkType === 'category' && banner.linkId) {
      navigation.navigate('Products', { categoryId: banner.linkId });
    }
  };

  const renderBanner = ({ item }: { item: Banner }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleBannerPress(item)}
      style={styles.bannerContainer}
    >
      <FastImage
        source={{ uri: item.image }}
        style={styles.bannerImage}
        resizeMode={FastImage.resizeMode.cover}
      />
    </TouchableOpacity>
  );

  if (!banners.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width - 32,
          offset: (width - 32) * index,
          index,
        })}
      />
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme, height: number) => ({
  container: {
    marginTop: theme.spacing.md,
  },
  bannerContainer: {
    width: width - 32,
    height,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
    width: 20,
  },
});

export default BannerCarousel;
`,
    };
  }

  /**
   * Generate Search Bar Component
   */
  private generateSearchBar(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/SearchBar.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmit,
  onFocus,
  placeholder = 'Search products...',
  autoFocus = false,
  showFilter = false,
  onFilterPress,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Icon name="magnify" size={22} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          onFocus={onFocus}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          autoFocus={autoFocus}
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText('')}>
            <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      {showFilter && (
        <TouchableOpacity style={styles.filterBtn} onPress={onFilterPress}>
          <Icon name="filter-variant" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 46,
    ...theme.shadows.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    paddingVertical: 0,
  },
  filterBtn: {
    width: 46,
    height: 46,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    ...theme.shadows.sm,
  },
});

export default SearchBar;
`,
    };
  }

  /**
   * Generate Rating Stars Component
   */
  private generateRatingStars(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/RatingStars.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  showHalf?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  onRatingChange,
  interactive = false,
  showHalf = true,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  const renderStar = (index: number) => {
    const filled = rating >= index + 1;
    const halfFilled = showHalf && !filled && rating > index && rating < index + 1;

    let iconName = 'star-outline';
    if (filled) {
      iconName = 'star';
    } else if (halfFilled) {
      iconName = 'star-half-full';
    }

    const star = (
      <Icon
        name={iconName}
        size={size}
        color={filled || halfFilled ? theme.colors.warning : theme.colors.border}
        style={styles.star}
      />
    );

    if (interactive && onRatingChange) {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => onRatingChange(index + 1)}
          activeOpacity={0.7}
        >
          {star}
        </TouchableOpacity>
      );
    }

    return <View key={index}>{star}</View>;
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default RatingStars;
`,
    };
  }

  /**
   * Generate Quantity Selector Component
   */
  private generateQuantitySelector(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/QuantitySelector.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'medium',
  disabled = false,
}) => {
  const { theme } = useTheme();
  const styles = useStyles((t) => createStyles(t, size));

  const handleDecrease = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const isMinDisabled = value <= min || disabled;
  const isMaxDisabled = value >= max || disabled;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isMinDisabled && styles.buttonDisabled]}
        onPress={handleDecrease}
        disabled={isMinDisabled}
      >
        <Icon
          name="minus"
          size={styles.iconSize}
          color={isMinDisabled ? theme.colors.disabled : theme.colors.text}
        />
      </TouchableOpacity>
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
      </View>
      <TouchableOpacity
        style={[styles.button, isMaxDisabled && styles.buttonDisabled]}
        onPress={handleIncrease}
        disabled={isMaxDisabled}
      >
        <Icon
          name="plus"
          size={styles.iconSize}
          color={isMaxDisabled ? theme.colors.disabled : theme.colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: Theme, size: 'small' | 'medium' | 'large') => {
  const sizeConfig = {
    small: { button: 28, value: 32, icon: 16, fontSize: theme.typography.fontSize.sm },
    medium: { button: 36, value: 44, icon: 20, fontSize: theme.typography.fontSize.md },
    large: { button: 44, value: 54, icon: 24, fontSize: theme.typography.fontSize.lg },
  };

  const config = sizeConfig[size];

  return {
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    button: {
      width: config.button,
      height: config.button,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.disabled,
    },
    valueContainer: {
      minWidth: config.value,
      paddingHorizontal: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    value: {
      fontSize: config.fontSize,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text,
    },
    iconSize: config.icon,
  };
};

export default QuantitySelector;
`,
    };
  }

  /**
   * Generate Empty State Component
   */
  private generateEmptyState(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/EmptyState.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'package-variant',
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={64} color={theme.colors.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 22,
  },
  button: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  buttonText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: '#FFFFFF',
  },
});

export default EmptyState;
`,
    };
  }

  /**
   * Generate Loading Skeleton Component
   */
  private generateLoadingSkeleton(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/LoadingSkeleton.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import { useTheme } from '@theme/ThemeContext';
import { Theme } from '@theme/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface LoadingSkeletonProps {
  type: 'product-grid' | 'product-list' | 'category' | 'banner' | 'order' | 'cart-item';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 4 }) => {
  const { theme } = useTheme();

  const renderProductGrid = () => (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surface}
      highlightColor={theme.colors.border}
    >
      <SkeletonPlaceholder.Item flexDirection="row" flexWrap="wrap" justifyContent="space-between" paddingHorizontal={16}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonPlaceholder.Item key={index} width={CARD_WIDTH} marginBottom={16}>
            <SkeletonPlaceholder.Item width={CARD_WIDTH} height={CARD_WIDTH} borderRadius={12} />
            <SkeletonPlaceholder.Item marginTop={8}>
              <SkeletonPlaceholder.Item width={CARD_WIDTH - 20} height={16} borderRadius={4} />
              <SkeletonPlaceholder.Item width={80} height={20} borderRadius={4} marginTop={8} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );

  const renderProductList = () => (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surface}
      highlightColor={theme.colors.border}
    >
      <SkeletonPlaceholder.Item paddingHorizontal={16}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonPlaceholder.Item key={index} flexDirection="row" marginBottom={16}>
            <SkeletonPlaceholder.Item width={100} height={100} borderRadius={12} />
            <SkeletonPlaceholder.Item marginLeft={16} justifyContent="center">
              <SkeletonPlaceholder.Item width={180} height={18} borderRadius={4} />
              <SkeletonPlaceholder.Item width={100} height={22} borderRadius={4} marginTop={8} />
              <SkeletonPlaceholder.Item width={80} height={14} borderRadius={4} marginTop={8} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );

  const renderCategory = () => (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surface}
      highlightColor={theme.colors.border}
    >
      <SkeletonPlaceholder.Item flexDirection="row" paddingHorizontal={16}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonPlaceholder.Item key={index} alignItems="center" marginRight={16}>
            <SkeletonPlaceholder.Item width={70} height={70} borderRadius={35} />
            <SkeletonPlaceholder.Item width={60} height={12} borderRadius={4} marginTop={8} />
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );

  const renderBanner = () => (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surface}
      highlightColor={theme.colors.border}
    >
      <SkeletonPlaceholder.Item paddingHorizontal={16}>
        <SkeletonPlaceholder.Item width={width - 32} height={180} borderRadius={16} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );

  const renderOrder = () => (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surface}
      highlightColor={theme.colors.border}
    >
      <SkeletonPlaceholder.Item paddingHorizontal={16}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonPlaceholder.Item key={index} marginBottom={16}>
            <SkeletonPlaceholder.Item width="100%" height={140} borderRadius={12} />
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );

  const renderCartItem = () => (
    <SkeletonPlaceholder
      backgroundColor={theme.colors.surface}
      highlightColor={theme.colors.border}
    >
      <SkeletonPlaceholder.Item paddingHorizontal={16}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonPlaceholder.Item key={index} flexDirection="row" marginBottom={16}>
            <SkeletonPlaceholder.Item width={90} height={90} borderRadius={12} />
            <SkeletonPlaceholder.Item marginLeft={16} flex={1} justifyContent="space-between">
              <SkeletonPlaceholder.Item width="80%" height={18} borderRadius={4} />
              <SkeletonPlaceholder.Item width={100} height={22} borderRadius={4} />
              <SkeletonPlaceholder.Item width={120} height={32} borderRadius={4} />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );

  switch (type) {
    case 'product-grid':
      return renderProductGrid();
    case 'product-list':
      return renderProductList();
    case 'category':
      return renderCategory();
    case 'banner':
      return renderBanner();
    case 'order':
      return renderOrder();
    case 'cart-item':
      return renderCartItem();
    default:
      return null;
  }
};

export default LoadingSkeleton;
`,
    };
  }

  /**
   * Generate Button Component
   */
  private generateButton(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/Button.tsx',
      type: 'component',
      content: `import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  const styles = useStyles((t) => createStyles(t, variant, size));

  const isDisabled = disabled || loading;

  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary}
          style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
        />
      );
    }
    if (icon) {
      return (
        <Icon
          name={icon}
          size={styles.iconSize}
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary}
          style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
        />
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {iconPosition === 'left' && renderIcon()}
      <Text style={[styles.text, textStyle]}>{title}</Text>
      {iconPosition === 'right' && renderIcon()}
    </TouchableOpacity>
  );
};

const createStyles = (
  theme: Theme,
  variant: 'primary' | 'secondary' | 'outline' | 'ghost',
  size: 'small' | 'medium' | 'large'
) => {
  const sizeConfig = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: theme.typography.fontSize.sm, iconSize: 16 },
    medium: { paddingVertical: 12, paddingHorizontal: 24, fontSize: theme.typography.fontSize.md, iconSize: 20 },
    large: { paddingVertical: 16, paddingHorizontal: 32, fontSize: theme.typography.fontSize.lg, iconSize: 24 },
  };

  const config = sizeConfig[size];

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary,
      textColor: '#FFFFFF',
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      textColor: '#FFFFFF',
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: theme.colors.primary,
      borderColor: 'transparent',
    },
  };

  const variantConfig = variantStyles[variant];

  return {
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: config.paddingVertical,
      paddingHorizontal: config.paddingHorizontal,
      backgroundColor: variantConfig.backgroundColor,
      borderRadius: theme.borderRadius.md,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: variantConfig.borderColor,
    },
    fullWidth: {
      width: '100%',
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: config.fontSize,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: variantConfig.textColor,
    },
    iconLeft: {
      marginRight: theme.spacing.sm,
    },
    iconRight: {
      marginLeft: theme.spacing.sm,
    },
    iconSize: config.iconSize,
  };
};

export default Button;
`,
    };
  }

  /**
   * Generate Input Component
   */
  private generateInput(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/Input.tsx',
      type: 'component',
      content: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useTheme } from '@theme/ThemeContext';
import { useStyles } from '@theme/styled';
import { Theme } from '@theme/types';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const { theme } = useTheme();
  const styles = useStyles(createStyles);
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordInput = secureTextEntry !== undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            color={error ? theme.colors.error : theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPasswordInput && !showPassword}
          {...props}
        />
        {isPasswordInput && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.textSecondary}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        )}
        {rightIcon && !isPasswordInput && (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
            <Icon
              name={rightIcon}
              size={20}
              color={theme.colors.textSecondary}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const createStyles = (theme: Theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.input,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default Input;
`,
    };
  }

  /**
   * Generate Toast Config
   */
  private generateToastConfig(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/Toast/toastConfig.tsx',
      type: 'component',
      content: `import React from 'react';
import { View, Text } from 'react-native';
import { ToastConfig } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { lightTheme as theme } from '@theme/constants';

export const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.success + '20' }]}>
        <Icon name="check-circle" size={24} color={theme.colors.success} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  error: ({ text1, text2 }) => (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
        <Icon name="alert-circle" size={24} color={theme.colors.error} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }) => (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.info + '20' }]}>
        <Icon name="information" size={24} color={theme.colors.info} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
  warning: ({ text1, text2 }) => (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.warning + '20' }]}>
        <Icon name="alert" size={24} color={theme.colors.warning} />
      </View>
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = {
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  message: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
};

export default toastConfig;
`,
    };
  }

  /**
   * Generate Components Index
   */
  private generateComponentsIndex(config: MobileAppConfig): GeneratedFile {
    return {
      path: 'src/components/index.ts',
      type: 'component',
      content: `export { ProductCard } from './ProductCard';
export { CategoryCard } from './CategoryCard';
export { CartItem } from './CartItem';
export { OrderCard } from './OrderCard';
export { BannerCarousel } from './BannerCarousel';
export { SearchBar } from './SearchBar';
export { RatingStars } from './RatingStars';
export { QuantitySelector } from './QuantitySelector';
export { EmptyState } from './EmptyState';
export { LoadingSkeleton } from './LoadingSkeleton';
export { Button } from './Button';
export { Input } from './Input';
export { toastConfig } from './Toast/toastConfig';
`,
    };
  }
}
