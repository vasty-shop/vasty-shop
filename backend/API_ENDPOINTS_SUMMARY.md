# API Endpoints Summary - Cart and Orders Modules

## Cart Module Endpoints

**Base URL**: `api/v1/cart`

### 1. Get Current User Cart
**GET** `/api/v1/cart`
- **Description**: Get cart for authenticated user or guest
- **Auth**: Optional (JWT or Session ID)
- **Headers**: `x-session-id` (optional, for guests)
- **Response**: Cart object with items, totals, and coupons
- **Business Logic**:
  - Returns existing cart or creates new one
  - Auto-calculates all totals
  - Supports both authenticated and guest users

### 2. Get Guest Cart
**GET** `/api/v1/cart/guest/:sessionId`
- **Description**: Get guest cart by session ID
- **Auth**: None
- **Params**: `sessionId` - Guest session identifier
- **Response**: Guest cart object
- **Business Logic**:
  - Creates cart if doesn't exist
  - 7-day expiration for guest carts

### 3. Add Item to Cart
**POST** `/api/v1/cart/add`
- **Description**: Add product to cart
- **Auth**: Optional
- **Body**:
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2,
  "variant": {
    "size": "Large",
    "color": "Blue"
  },
  "sessionId": "abc123def456"
}
```
- **Response**: Updated cart
- **Business Logic**:
  - Validates product exists and is active
  - Checks stock availability
  - Maximum 100 items per product
  - Merges if item already exists
  - Recalculates totals

### 4. Update Cart Item
**PUT** `/api/v1/cart/item/:itemId`
- **Description**: Update cart item quantity
- **Auth**: Optional
- **Headers**: `x-session-id` (optional)
- **Body**:
```json
{
  "quantity": 3
}
```
- **Response**: Updated cart
- **Business Logic**:
  - Validates new quantity against stock
  - Max 100 items per product
  - Recalculates item subtotal and cart totals

### 5. Remove Cart Item
**DELETE** `/api/v1/cart/item/:itemId`
- **Description**: Remove item from cart
- **Auth**: Optional
- **Headers**: `x-session-id` (optional)
- **Response**: Updated cart
- **Business Logic**:
  - Removes item completely
  - Recalculates cart totals

### 6. Clear Cart
**DELETE** `/api/v1/cart/clear`
- **Description**: Clear entire cart
- **Auth**: Optional
- **Headers**: `x-session-id` (optional)
- **Response**: Empty cart
- **Business Logic**:
  - Removes all items and coupons
  - Resets all totals to zero

### 7. Apply Coupon
**POST** `/api/v1/cart/apply-coupon`
- **Description**: Apply discount coupon to cart
- **Auth**: Optional
- **Body**:
```json
{
  "code": "SUMMER2024",
  "sessionId": "abc123def456"
}
```
- **Response**: Updated cart with discount
- **Business Logic**:
  - Validates coupon code exists and is active
  - Checks expiration date
  - Verifies usage limits
  - Validates minimum purchase requirement
  - Prevents duplicate application
  - Recalculates discount and totals

### 8. Remove Coupon
**DELETE** `/api/v1/cart/remove-coupon/:code`
- **Description**: Remove coupon from cart
- **Auth**: Optional
- **Headers**: `x-session-id` (optional)
- **Response**: Updated cart without discount
- **Business Logic**:
  - Removes coupon
  - Recalculates totals without discount

### 9. Merge Guest Cart
**POST** `/api/v1/cart/merge`
- **Description**: Merge guest cart with user cart after login
- **Auth**: Required (JWT)
- **Body**:
```json
{
  "sessionId": "abc123def456"
}
```
- **Response**: Merged cart
- **Business Logic**:
  - Combines items from guest and user carts
  - Merges quantities for duplicate items
  - Validates stock for merged quantities
  - Transfers coupons
  - Deletes guest cart after merge

### 10. Check Inventory
**GET** `/api/v1/cart/check-inventory`
- **Description**: Verify stock availability for all cart items
- **Auth**: Optional
- **Headers**: `x-session-id` (optional)
- **Response**:
```json
{
  "available": false,
  "unavailableItems": [
    {
      "productId": "prod_123",
      "productName": "Wireless Headphones",
      "requested": 5,
      "available": 2
    }
  ]
}
```
- **Business Logic**:
  - Checks each item against current stock
  - Returns list of unavailable or insufficient items
  - Useful before checkout

---

## Orders Module Endpoints

**Base URL**: `api/v1/orders`

### 1. Create Order
**POST** `/api/v1/orders`
- **Description**: Create order from cart
- **Auth**: Required (JWT)
- **Body**:
```json
{
  "cartId": "507f1f77bcf86cd799439011",
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "+1234567890",
    "addressLine1": "123 Main Street, Apt 4B",
    "addressLine2": "Near Central Park",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States"
  },
  "paymentMethod": "credit_card",
  "customerNote": "Please deliver before 5 PM"
}
```
- **Response**: Created order
- **Business Logic**:
  - Validates cart ownership
  - Checks cart is not empty
  - Verifies all items in stock
  - Generates unique order number (FLX-YYYY-XXXXX)
  - Locks inventory (decreases stock)
  - Clears cart after success
  - Creates order timeline
  - Sets initial status to "pending"

### 2. Get Order History
**GET** `/api/v1/orders`
- **Description**: Get user's order history with pagination
- **Auth**: Required (JWT)
- **Query Params**:
  - `status` (optional): Filter by order status
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 10): Items per page
  - `sortBy` (optional): Field to sort by
  - `sortOrder` (optional): 'asc' or 'desc'
- **Response**:
```json
{
  "data": [...orders],
  "total": 45,
  "page": 1,
  "pages": 5
}
```
- **Business Logic**:
  - Returns only user's orders
  - Supports pagination
  - Filtering by status
  - Sorting options

### 3. Get Single Order
**GET** `/api/v1/orders/:id`
- **Description**: Get detailed order information
- **Auth**: Required (JWT)
- **Params**: `id` - Order ID
- **Response**: Order object with all details
- **Business Logic**:
  - Verifies order ownership
  - Returns complete order details including items, shipping, timeline

### 4. Get Order by Order Number
**GET** `/api/v1/orders/number/:orderNumber`
- **Description**: Retrieve order using order number
- **Auth**: Required (JWT)
- **Params**: `orderNumber` (e.g., FLX-2025-12345)
- **Response**: Order object
- **Business Logic**:
  - Searches by unique order number
  - Useful for customer tracking

### 5. Track Order
**GET** `/api/v1/orders/track/:trackingNumber`
- **Description**: Track order by carrier tracking number (Public)
- **Auth**: None
- **Params**: `trackingNumber` (e.g., TRK123456789)
- **Response**: Order tracking information
- **Business Logic**:
  - Public endpoint for tracking
  - Returns order status and timeline
  - No authentication required

### 6. Cancel Order
**POST** `/api/v1/orders/:id/cancel`
- **Description**: Cancel order (customer only)
- **Auth**: Required (JWT)
- **Params**: `id` - Order ID
- **Response**: Cancelled order
- **Business Logic**:
  - Only pending or processing orders can be cancelled
  - Verifies order ownership
  - Releases inventory (restores stock)
  - Updates timeline
  - Changes status to "cancelled"

### 7. Update Order Status
**PATCH** `/api/v1/orders/:id/status`
- **Description**: Update order status (shop owner only)
- **Auth**: Required (JWT + Shop Owner)
- **Params**: `id` - Order ID
- **Body**:
```json
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "carrier": "FedEx",
  "statusNote": "Package shipped via express delivery"
}
```
- **Response**: Updated order
- **Business Logic**:
  - Validates shop owns at least one item in order
  - Validates status transition rules
  - Updates tracking info if provided
  - Adds entry to timeline
  - Releases inventory if cancelled

**Valid Status Transitions**:
- pending → processing, cancelled
- processing → shipped, cancelled
- shipped → delivered
- delivered → refund_requested

### 8. Add Order Note
**POST** `/api/v1/orders/:id/notes`
- **Description**: Add note to order
- **Auth**: Required (JWT)
- **Params**: `id` - Order ID
- **Body**:
```json
{
  "note": "Customer requested gift wrapping",
  "isInternal": false,
  "notifyCustomer": true
}
```
- **Response**: Updated order
- **Business Logic**:
  - Customer and shop owner can add notes
  - Internal notes only visible to shop owners
  - Optional customer notification
  - Tracks who added the note

### 9. Request Refund
**POST** `/api/v1/orders/:id/refund`
- **Description**: Request refund for delivered order
- **Auth**: Required (JWT)
- **Params**: `id` - Order ID
- **Body**:
```json
{
  "amount": 99.99,
  "reason": "Item damaged during shipping"
}
```
- **Response**: Order with refund request
- **Business Logic**:
  - Only delivered orders can be refunded
  - Refund amount cannot exceed order total
  - Creates refund request for shop approval
  - Changes status to "refund_requested"
  - Adds to timeline

### 10. Get Shop Statistics
**GET** `/api/v1/orders/shop/:shopId/statistics`
- **Description**: Get order statistics for shop (shop owner only)
- **Auth**: Required (JWT + Shop Owner)
- **Params**: `shopId` - Shop ID
- **Response**:
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
- **Business Logic**:
  - Calculates statistics for shop's items only
  - Revenue includes only shop's item totals
  - Counts orders containing shop items

### 11. Get Order Timeline
**GET** `/api/v1/orders/:id/timeline`
- **Description**: Get order status change history
- **Auth**: Required (JWT)
- **Params**: `id` - Order ID
- **Response**: Array of timeline entries
```json
[
  {
    "status": "pending",
    "timestamp": "2025-10-26T10:00:00Z",
    "note": "Order placed successfully"
  },
  {
    "status": "processing",
    "timestamp": "2025-10-26T11:00:00Z",
    "note": "Order is being processed",
    "updatedBy": "shop_123"
  },
  {
    "status": "shipped",
    "timestamp": "2025-10-26T14:00:00Z",
    "note": "Package shipped via FedEx",
    "updatedBy": "shop_123"
  }
]
```
- **Business Logic**:
  - Shows complete order history
  - Includes timestamps and notes
  - Tracks who made each change

---

## Critical Business Logic Summary

### Cart Logic
1. **Auto-calculation**: Subtotal, tax (10%), shipping (free >$100), discount, total
2. **Guest Support**: 7-day cart expiration, session-based identification
3. **Inventory Validation**: Real-time stock checking on add/update
4. **Coupon System**: Multiple coupons, validation, expiration, usage limits
5. **Cart Merging**: Intelligent merge on login, no duplicate items

### Order Logic
1. **Order Number**: Unique FLX-YYYY-XXXXX format
2. **Inventory Lock**: Stock reserved on order creation
3. **Status Workflow**: Strict transition rules enforced
4. **Multi-Vendor**: Orders can contain items from multiple shops
5. **Cancellation**: Only pending/processing, inventory restored
6. **Refund System**: Only delivered orders, partial/full support
7. **Timeline**: Immutable history of all status changes
8. **Authorization**: Ownership verification on all operations

### Payment Methods
- Credit Card (paid immediately)
- PayPal (paid immediately)
- Stripe (paid immediately)
- Cash on Delivery (payment pending)

### Shipping Calculation
- Free shipping for orders ≥ $100
- $10 flat rate for orders < $100

### Tax Calculation
- 10% tax on subtotal after discount

---

## Error Responses

### Common Error Codes

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "Cart is empty",
  "error": "Bad Request"
}
```

**403 Forbidden**
```json
{
  "statusCode": 403,
  "message": "You do not have access to this order",
  "error": "Forbidden"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Order not found",
  "error": "Not Found"
}
```

**422 Unprocessable Entity**
```json
{
  "statusCode": 422,
  "message": "Some items are no longer available",
  "unavailableItems": [
    "Wireless Headphones (only 2 available)"
  ]
}
```

---

## Authentication

### Required Headers

**JWT Authentication**:
```
Authorization: Bearer <jwt_token>
```

**Guest Session**:
```
x-session-id: <session_id>
```

---

## Swagger Documentation

Complete API documentation available at:
```
http://localhost:3000/api/docs
```

Includes:
- All endpoints
- Request/Response schemas
- Authentication requirements
- Example requests
- Status codes
- Parameter descriptions

---

## Summary

**Cart Module**: 10 endpoints
**Orders Module**: 11 endpoints
**Total**: 21 comprehensive e-commerce endpoints

All endpoints include:
- Full validation
- Error handling
- Swagger documentation
- Business logic enforcement
- Security checks
