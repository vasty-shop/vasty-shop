# Cart and Orders Modules - Fluxez E-commerce Backend

## Overview

Comprehensive Cart and Orders modules have been created for the Fluxez e-commerce platform, providing full shopping cart functionality and order management capabilities.

## Cart Module

**Location**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/backend/src/modules/cart/`

### Files Created/Updated
- `cart.module.ts` - Module configuration with FluxezModule import
- `cart.controller.ts` - REST API endpoints for cart operations
- `cart.service.ts` - Business logic for cart management
- `dto/add-to-cart.dto.ts` - DTO for adding items to cart
- `dto/update-cart-item.dto.ts` - DTO for updating cart item quantity
- `dto/apply-coupon.dto.ts` - DTO for applying coupon codes

### Cart Controller Endpoints

**Base Path**: `api/v1/cart`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get current user cart (authenticated or guest) | Optional |
| GET | `/guest/:sessionId` | Get guest cart by session ID | No |
| POST | `/add` | Add item to cart | Optional |
| PUT | `/item/:itemId` | Update cart item quantity | Optional |
| DELETE | `/item/:itemId` | Remove item from cart | Optional |
| DELETE | `/clear` | Clear entire cart | Optional |
| POST | `/apply-coupon` | Apply coupon code to cart | Optional |
| DELETE | `/remove-coupon/:code` | Remove coupon from cart | Optional |
| POST | `/merge` | Merge guest cart with user cart after login | Yes |
| GET | `/check-inventory` | Check inventory availability for cart items | Optional |

### Cart Service Methods

#### Core Methods
- `getCart(userId)` - Get or create cart for authenticated user
- `getGuestCart(sessionId)` - Get guest cart by session ID
- `addItem(userId, addToCartDto)` - Add product to cart with inventory validation
- `updateItem(cartId, itemId, updateDto)` - Update cart item quantity
- `removeItem(cartId, itemId)` - Remove item from cart
- `clearCart(cartId)` - Empty entire cart

#### Coupon Management
- `applyCoupon(cartId, applyCouponDto)` - Apply discount code with validation
- `removeCoupon(cartId, code)` - Remove discount code
- `validateCoupon(code, cart)` - Validate coupon eligibility

#### Advanced Features
- `mergeGuestCart(sessionId, userId)` - Merge guest cart after user login
- `checkInventory(cartId)` - Verify stock availability for all items
- `calculateTotals(cart)` - Calculate subtotal, tax, shipping, discount, and total

### Key Features

#### Guest & Authenticated User Support
- Guest users identified by `x-session-id` header
- Automatic cart creation for both user types
- Cart expiration: 7 days for guests, 30 days for authenticated users
- Seamless cart merging upon user login

#### Automatic Calculations
- **Subtotal**: Sum of all item prices × quantities
- **Tax**: 10% of subtotal after discount
- **Shipping**: Free for orders ≥$100, otherwise $10
- **Discount**: Applied from coupons (percentage or fixed)
- **Total**: Subtotal - Discount + Tax + Shipping

#### Inventory Management
- Real-time stock checking when adding items
- Maximum 100 items per product
- Prevents adding more than available stock
- Returns unavailable items list when checking inventory

#### Product Variants
- Support for size, color, material variants
- Custom variant attributes
- Variant-based item uniqueness in cart

#### Coupon Validation
- Check expiration dates
- Verify usage limits
- Validate minimum purchase requirements
- Support for both percentage and fixed discounts
- Maximum discount caps

---

## Orders Module

**Location**: `/Users/islamnymul/DEVELOP/INFOINLET-PROD/fluxez-shop/backend/src/modules/orders/`

### Files Created/Updated
- `orders.module.ts` - Module configuration with FluxezModule import
- `orders.controller.ts` - REST API endpoints for order operations
- `orders.service.ts` - Business logic for order management
- `dto/create-order.dto.ts` - DTO for order creation
- `dto/update-order-status.dto.ts` - DTO for status updates
- `dto/add-order-note.dto.ts` - DTO for adding order notes

### Orders Controller Endpoints

**Base Path**: `api/v1/orders`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Create order from cart | Yes |
| GET | `/` | Get user order history (paginated) | Yes |
| GET | `/:id` | Get single order details | Yes |
| GET | `/number/:orderNumber` | Get order by order number | Yes |
| GET | `/track/:trackingNumber` | Track order by tracking number | No |
| POST | `/:id/cancel` | Cancel order (if pending/processing) | Yes |
| PATCH | `/:id/status` | Update order status (shop owner) | Yes (Shop) |
| POST | `/:id/notes` | Add note to order | Yes |
| POST | `/:id/refund` | Request refund | Yes |
| GET | `/shop/:shopId/statistics` | Get shop order statistics | Yes (Shop) |
| GET | `/:id/timeline` | Get order status timeline | Yes |

### Orders Service Methods

#### Core Methods
- `create(userId, createOrderDto)` - Create order from cart with validation
- `findAll(userId, filters)` - Get order history with pagination
- `findOne(id, userId)` - Get single order with ownership verification
- `findByOrderNumber(orderNumber)` - Track by order number
- `trackOrder(trackingNumber)` - Track by tracking number
- `generateOrderNumber()` - Generate unique order number (FLX-YYYY-XXXXX)

#### Status Management
- `updateStatus(orderId, updateDto, shopId)` - Change order status (shop owner)
- `cancel(orderId, userId)` - Cancel order (customer, pending/processing only)
- `validateStatusTransition(currentStatus, newStatus)` - Ensure valid transitions

#### Order Features
- `addNote(orderId, addNoteDto, userId, isShopOwner)` - Add customer or internal notes
- `refund(orderId, amount, reason, userId)` - Request refund for delivered orders
- `getStatistics(shopId)` - Get shop order statistics
- `calculateOrderTimeline(order)` - Get status change history

#### Private Helper Methods
- `lockInventory(items)` - Decrease stock when order is created
- `releaseInventory(items)` - Restore stock when order is cancelled
- `clearCart(cartId)` - Empty cart after successful order

### Key Features

#### Order Creation
- Creates from existing cart
- Validates cart ownership
- Checks inventory availability for all items
- Groups items by shop for multi-vendor support
- Generates unique order number (FLX-2025-XXXXX format)
- Locks inventory immediately
- Clears cart after successful creation

#### Order Status Workflow
```
pending → processing → shipped → delivered
   ↓                       ↓
cancelled         refund_requested → refunded
```

**Status Transition Rules**:
- `pending` can become `processing` or `cancelled`
- `processing` can become `shipped` or `cancelled`
- `shipped` can become `delivered`
- `delivered` can become `refund_requested`
- `cancelled` and `refunded` are terminal states

#### Timeline Tracking
Each order maintains a timeline array with:
- Status changes
- Timestamps
- Notes/messages
- Who made the change (shop owner or system)

#### Order Cancellation
**Customer Cancellation**:
- Only allowed for `pending` or `processing` orders
- Automatically releases inventory back to stock
- Adds cancellation note to timeline

**Shop Cancellation**:
- Shop owners can cancel via status update
- Same inventory release logic applies

#### Refund System
- Only allowed for `delivered` orders
- Partial or full refunds supported
- Cannot exceed order total
- Creates refund request for shop owner approval
- Changes status to `refund_requested`

#### Multi-Vendor Support
- Orders can contain items from multiple shops
- Each shop can update status for their items
- Statistics calculated per shop
- Revenue tracked per shop

#### Order Notes
**Customer Notes**:
- Visible to customer and shop owner
- Added during order creation or after

**Internal Notes**:
- Only visible to shop owners
- Used for order processing notes
- Optional notification to customer

#### Order Statistics
For shop owners, provides:
- Total orders containing shop items
- Total revenue from shop items
- Count by status (pending, processing, shipped, delivered, cancelled)

#### Shipping Address Validation
Required fields:
- Full name
- Phone number
- Address line 1
- City, State, Postal Code
- Country
- Optional address line 2

#### Payment Methods
Supported:
- Credit Card
- PayPal
- Stripe
- Cash on Delivery (COD)

**Payment Status**:
- COD orders: `pending`
- All others: `paid` (assumed paid through gateway)

---

## Business Logic Highlights

### Cart Business Rules
1. **Quantity Limits**: Min 1, Max 100 per product
2. **Stock Validation**: Real-time inventory checking
3. **Cart Expiration**: Auto-cleanup of old carts
4. **Coupon Stacking**: Multiple coupons can be applied
5. **Price Recalculation**: Automatic on every change
6. **Guest Cart Merge**: Intelligent merging without duplicates

### Order Business Rules
1. **Inventory Lock**: Stock reserved immediately on order creation
2. **Status Validation**: Only valid transitions allowed
3. **Ownership Verification**: Users can only access their orders
4. **Shop Authorization**: Shop owners only manage their items
5. **Cancellation Window**: Limited to early order stages
6. **Refund Eligibility**: Only for delivered orders
7. **Timeline Immutability**: Status history preserved

### Validation Features

#### Cart Validation
- Product existence and availability
- Stock sufficiency
- Coupon validity and eligibility
- Minimum purchase requirements
- Quantity limits

#### Order Validation
- Cart ownership
- Cart not empty
- All items in stock
- Valid shipping address
- Status transition rules
- Refund amount limits

---

## API Response Examples

### Cart Response
```json
{
  "id": "cart_123456",
  "userId": "user_789",
  "items": [
    {
      "id": "item_001",
      "productId": "prod_456",
      "productName": "Wireless Headphones",
      "productImage": "https://...",
      "price": 99.99,
      "quantity": 2,
      "variant": {
        "color": "Black",
        "size": "Large"
      },
      "shopId": "shop_123",
      "shopName": "Tech Store",
      "subtotal": 199.98
    }
  ],
  "coupons": [
    {
      "code": "SUMMER2024",
      "discountType": "percentage",
      "discountValue": 10,
      "appliedAt": "2025-10-26T10:00:00Z"
    }
  ],
  "subtotal": 199.98,
  "discount": 20.00,
  "tax": 17.99,
  "shipping": 0,
  "total": 197.97,
  "updatedAt": "2025-10-26T10:00:00Z"
}
```

### Order Response
```json
{
  "id": "order_789",
  "orderNumber": "FLX-2025-12345",
  "userId": "user_789",
  "status": "processing",
  "items": [...],
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States"
  },
  "paymentMethod": "credit_card",
  "paymentStatus": "paid",
  "subtotal": 199.98,
  "discount": 20.00,
  "tax": 17.99,
  "shipping": 0,
  "total": 197.97,
  "timeline": [
    {
      "status": "pending",
      "timestamp": "2025-10-26T10:00:00Z",
      "note": "Order placed successfully"
    },
    {
      "status": "processing",
      "timestamp": "2025-10-26T10:30:00Z",
      "note": "Order is being processed",
      "updatedBy": "shop_123"
    }
  ],
  "createdAt": "2025-10-26T10:00:00Z",
  "updatedAt": "2025-10-26T10:30:00Z"
}
```

### Order Statistics Response
```json
{
  "totalOrders": 245,
  "totalRevenue": 48750.50,
  "pendingOrders": 12,
  "processingOrders": 34,
  "shippedOrders": 18,
  "deliveredOrders": 176,
  "cancelledOrders": 5
}
```

---

## Security Features

### Cart Security
- Optional authentication (supports both guest and authenticated users)
- Session-based guest identification
- Cart ownership verification for authenticated users
- XSS protection via validation decorators
- SQL injection prevention through ORM

### Order Security
- JWT authentication required for most endpoints
- Order ownership verification
- Shop owner authorization for status updates
- Role-based access control (RBAC)
- Sensitive data protection (internal notes)

---

## Future Enhancements (TODO)

### Cart Module
- [ ] Cart abandonment notifications
- [ ] Save for later functionality
- [ ] Wishlist integration
- [ ] Price alerts
- [ ] Bulk item operations

### Orders Module
- [x] Email notifications (marked in code as TODO)
  - Order confirmation
  - Status updates
  - Cancellation confirmations
  - Refund notifications
- [ ] Shop owner notifications
- [ ] Order invoice generation (PDF)
- [ ] Order export (CSV, Excel)
- [ ] Advanced filtering (date range, amount range)
- [ ] Order dispute system
- [ ] Automated refund processing
- [ ] Shipping label generation
- [ ] Multi-language support
- [ ] Currency conversion

---

## Error Handling

### Common Error Codes

**400 Bad Request**
- Cart is empty
- Invalid quantity
- Coupon already applied
- Cannot cancel order with current status

**403 Forbidden**
- Cart doesn't belong to user
- Order doesn't belong to user
- Unauthorized status update

**404 Not Found**
- Cart not found
- Order not found
- Product not found
- Coupon not found

**422 Unprocessable Entity**
- Insufficient stock
- Some items are no longer available
- Invalid status transition

---

## Testing Recommendations

### Cart Module Tests
1. Add item to cart (authenticated & guest)
2. Update item quantity with stock validation
3. Remove item from cart
4. Apply multiple coupons
5. Merge guest cart after login
6. Cart expiration cleanup
7. Inventory checking
8. Calculate totals accuracy

### Orders Module Tests
1. Create order from cart
2. Order creation with unavailable items (should fail)
3. Cancel order (valid and invalid states)
4. Update order status (valid transitions only)
5. Add customer and internal notes
6. Request refund (delivered orders only)
7. Shop statistics calculation
8. Order timeline tracking
9. Inventory lock/release
10. Multi-vendor order handling

---

## Integration Points

### Required Integrations
- **Fluxez Service**: Core database operations
- **Product Module**: Stock validation and updates
- **User Module**: Authentication and authorization
- **Shop Module**: Multi-vendor support
- **Offer Module**: Coupon validation

### Optional Integrations
- **Payment Gateway**: Stripe, PayPal integration
- **Email Service**: Transactional emails
- **SMS Service**: Order updates
- **Shipping API**: Tracking integration
- **Analytics**: Order metrics and reporting

---

## Configuration

### Environment Variables (Recommended)
```env
# Tax Configuration
TAX_RATE=0.10

# Shipping Configuration
FREE_SHIPPING_THRESHOLD=100
STANDARD_SHIPPING_COST=10

# Cart Configuration
GUEST_CART_EXPIRY_DAYS=7
USER_CART_EXPIRY_DAYS=30
MAX_CART_ITEM_QUANTITY=100

# Order Configuration
ORDER_NUMBER_PREFIX=FLX
CANCELLATION_ALLOWED_STATUSES=pending,processing
```

---

## Performance Considerations

### Cart Optimization
- Implement cart caching (Redis)
- Batch inventory checks
- Lazy load product details
- Index on userId and sessionId

### Order Optimization
- Paginated order listing
- Index on orderNumber, trackingNumber, userId
- Background job for inventory operations
- Order statistics caching

---

## Swagger Documentation

Both modules are fully documented with Swagger decorators:
- Complete API endpoint descriptions
- Request/Response schemas
- Authentication requirements
- Example values
- Status codes

Access Swagger UI at: `http://localhost:3000/api/docs`

---

## Module Dependencies

### Cart Module
```typescript
imports: [FluxezModule]
exports: [CartService]
```

### Orders Module
```typescript
imports: [FluxezModule]
exports: [OrdersService]
```

---

## Summary

These modules provide a production-ready foundation for e-commerce cart and order management with:

- Full CRUD operations
- Guest and authenticated user support
- Real-time inventory management
- Multi-vendor support
- Comprehensive validation
- Order lifecycle management
- Refund system
- Analytics and statistics
- Extensible architecture
- Complete API documentation

The implementation follows NestJS best practices with proper separation of concerns, comprehensive error handling, and scalable architecture.
