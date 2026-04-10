import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/constants/api_constants.dart';
import '../../../../../core/errors/error_handler.dart';
import '../models/delivery_order_model.dart';


class DeliveryRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get orders assigned to delivery partner
  Future<List<DeliveryOrderModel>> getDeliveryOrders({
    int page = 1,
    int limit = 20,
    String? status,
  }) async {
    try {
      debugPrint('🚚 Fetching orders, status: $status');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      final queryParams = <String, dynamic>{
        if (status != null) 'status': status,
      };

      debugPrint('🚚 Fetching orders for delivery man: $deliveryManId');
      debugPrint('📋 Query params: $queryParams');

      // Call the correct endpoint: /delivery-man/:id/orders
      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/orders',
        queryParameters: queryParams,
      );

      debugPrint('✅ Delivery orders API Response received');
      debugPrint('📦 Response data: ${response.data}');

      // Backend returns { data: [...] } or { data: { data: [...] } }
      List<dynamic> ordersData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is Map &&
            response.data['data']['data'] != null) {
          ordersData = response.data['data']['data'] as List;
        } else if (response.data['data'] is List) {
          ordersData = response.data['data'] as List;
        } else {
          ordersData = [];
        }
      } else if (response.data is List) {
        ordersData = response.data as List;
      } else {
        ordersData = [];
      }

      debugPrint('✅ Received ${ordersData.length} delivery orders');

      return ordersData
          .map((json) => _transformDeliveryOrderData(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('❌ Error loading delivery orders: $e');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Error parsing delivery orders: $e');
      rethrow;
    }
  }

  /// Transform API response to DeliveryOrderModel format
  DeliveryOrderModel _transformDeliveryOrderData(Map<String, dynamic> json) {
    // API returns delivery assignment with nested order data
    final order = json['order'] as Map<String, dynamic>? ?? {};
    final pickupAddr = json['pickupAddress'] as Map<String, dynamic>? ?? {};
    final deliveryAddr = json['deliveryAddress'] as Map<String, dynamic>? ?? {};
    final items = order['items'] as List? ?? [];
    final shippingAddress = order['shippingAddress'] as Map<String, dynamic>? ?? {};

    // Parse items
    final parsedItems = items.map((item) {
      final itemMap = item as Map<String, dynamic>;
      return OrderItem(
        id: itemMap['productId']?.toString() ?? '',
        productId: itemMap['productId']?.toString() ?? '',
        name: itemMap['productName']?.toString() ?? itemMap['name']?.toString() ?? 'Unknown',
        quantity: (itemMap['quantity'] as num?)?.toInt() ?? 1,
        price: _parseDouble(itemMap['price']),
        image: itemMap['productImage']?.toString() ?? itemMap['image']?.toString(),
      );
    }).toList();

    // Build customer info
    final customerName = deliveryAddr['customerName']?.toString() ??
                         shippingAddress['fullName']?.toString() ??
                         order['customerName']?.toString() ?? 'Customer';
    final customerPhone = deliveryAddr['customerPhone']?.toString() ??
                          shippingAddress['phone']?.toString() ?? '';

    // Build addresses
    final pickupAddress = AddressInfo(
      street: pickupAddr['address']?.toString() ?? pickupAddr['street']?.toString() ?? 'Pickup Location',
      city: pickupAddr['city']?.toString() ?? '',
      state: pickupAddr['state']?.toString(),
      postalCode: pickupAddr['postalCode']?.toString(),
      latitude: _parseDoubleOrNull(pickupAddr['latitude']),
      longitude: _parseDoubleOrNull(pickupAddr['longitude']),
      instructions: pickupAddr['contact_name']?.toString(),
    );

    final deliveryAddress = AddressInfo(
      street: deliveryAddr['address']?.toString() ??
              shippingAddress['addressLine1']?.toString() ??
              'Delivery Location',
      city: deliveryAddr['city']?.toString() ?? shippingAddress['city']?.toString() ?? '',
      state: deliveryAddr['state']?.toString() ?? shippingAddress['state']?.toString(),
      postalCode: deliveryAddr['postalCode']?.toString() ?? shippingAddress['zipCode']?.toString(),
      latitude: _parseDoubleOrNull(deliveryAddr['latitude']),
      longitude: _parseDoubleOrNull(deliveryAddr['longitude']),
      instructions: deliveryAddr['instructions']?.toString(),
    );

    // Calculate total
    final subtotal = _parseDouble(order['subtotal']);
    final shipping = _parseDouble(order['shippingCost'] ?? order['shipping']);
    final tax = _parseDouble(order['tax']);
    final total = subtotal + shipping + tax;

    // Map status - keep original status names for proper workflow
    // Workflow: assigned -> accepted -> picked_up -> in_transit/on_the_way -> delivered
    final rawStatus = json['status']?.toString().toLowerCase() ?? order['status']?.toString().toLowerCase() ?? 'pending';
    String status;
    switch (rawStatus) {
      case 'assigned':
        status = 'pending'; // Needs to be accepted first
        break;
      case 'accepted':
        status = 'accepted';
        break;
      case 'picked_up':
        status = 'picked_up';
        break;
      case 'in_transit':
      case 'on_the_way':
        status = 'in_transit';
        break;
      case 'delivered':
        status = 'delivered';
        break;
      case 'cancelled':
      case 'rejected':
        status = 'cancelled';
        break;
      default:
        status = 'pending';
    }

    // Use actual orderId for API calls, not assignment id
    // The json['id'] is assignment ID, json['orderId'] is the actual order ID
    final actualOrderId = json['orderId']?.toString() ?? order['id']?.toString() ?? json['id']?.toString() ?? '';

    return DeliveryOrderModel(
      id: actualOrderId, // Use the actual order ID for status update calls
      orderNumber: json['orderNumber']?.toString() ?? order['orderNumber']?.toString() ?? '',
      status: status,
      totalAmount: total > 0 ? total : _parseDouble(order['total']),
      deliveryFee: _parseDouble(json['deliveryFee']),
      paymentStatus: order['paymentStatus']?.toString() ?? 'pending',
      paymentMethod: order['paymentMethod']?.toString() ?? 'unknown',
      customer: CustomerInfo(
        id: order['userId']?.toString() ?? '',
        name: customerName,
        phone: customerPhone,
        email: order['customerEmail']?.toString(),
      ),
      pickupAddress: pickupAddress,
      deliveryAddress: deliveryAddress,
      items: parsedItems,
      notes: json['notes']?.toString(),
      deliveryNotes: deliveryAddr['instructions']?.toString(),
      createdAt: json['assignedAt']?.toString() ?? order['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
      acceptedAt: json['assignedAt']?.toString(),
      pickedUpAt: json['pickedUpAt']?.toString(),
      deliveredAt: json['deliveredAt']?.toString(),
      estimatedDeliveryTime: json['estimatedTime']?.toString(),
      distance: _parseDoubleOrNull(json['distance']),
      tip: _parseDoubleOrNull(json['tip']),
      shop: order['shopId'] != null ? ShopInfo(
        id: order['shopId']?.toString() ?? '',
        name: pickupAddr['shop_name']?.toString() ?? (items.isNotEmpty ? ((items.first as Map<String, dynamic>)['shopName']?.toString() ?? 'Store') : 'Store'),
        phone: pickupAddr['contact_phone']?.toString(),
      ) : null,
    );
  }

  double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  double? _parseDoubleOrNull(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value);
    return null;
  }

  /// Get order details by ID
  Future<DeliveryOrderModel> getOrderById(String orderId) async {
    try {
      final response = await _dioClient.get(
        '${ApiConstants.deliveryOrders}/$orderId',
      );

      Map<String, dynamic> orderData;
      if (response.data is Map && response.data['data'] != null) {
        orderData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        orderData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid order data format');
      }

      return DeliveryOrderModel.fromJson(orderData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Accept an order
  Future<DeliveryOrderModel> acceptOrder(String orderId) async {
    try {
      debugPrint('✅ Accepting order: $orderId');

      final deliveryManId = await _getDeliveryManId();
      debugPrint('✅ Delivery man ID: $deliveryManId');

      // Backend endpoint: POST /delivery-man/:id/accept-order
      final response = await _dioClient.dio.post(
        '/delivery-man/$deliveryManId/accept-order',
        data: {'orderId': orderId},
      );

      debugPrint('✅ Accept response: ${response.data}');

      Map<String, dynamic> orderData;
      if (response.data is Map && response.data['data'] != null) {
        orderData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        orderData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid order data format');
      }

      return _transformDeliveryOrderData(orderData);
    } on DioException catch (e) {
      debugPrint('❌ Error accepting order: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Reject an order
  Future<void> rejectOrder(String orderId, {String? reason}) async {
    try {
      debugPrint('❌ Rejecting order: $orderId');

      final deliveryManId = await _getDeliveryManId();
      debugPrint('❌ Delivery man ID: $deliveryManId');

      // Backend endpoint: POST /delivery-man/:id/reject-order
      // Backend requires 'reason' to be a string, so we provide a default if not given
      await _dioClient.dio.post(
        '/delivery-man/$deliveryManId/reject-order',
        data: {
          'orderId': orderId,
          'reason': reason ?? 'Declined by delivery partner',
        },
      );
    } on DioException catch (e) {
      debugPrint('❌ Error rejecting order: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get delivery man ID from profile
  Future<String> _getDeliveryManId() async {
    final profileResponse = await _dioClient.dio.get('/delivery-man/me');
    Map<String, dynamic> profile;
    if (profileResponse.data is Map && profileResponse.data['data'] != null) {
      profile = profileResponse.data['data'] as Map<String, dynamic>;
    } else if (profileResponse.data is Map) {
      profile = profileResponse.data as Map<String, dynamic>;
    } else {
      throw Exception('Failed to get delivery man profile');
    }
    final deliveryManId = profile['id'];
    if (deliveryManId == null) {
      throw Exception('Delivery man ID not found');
    }
    return deliveryManId;
  }

  /// Mark order as picked up
  Future<DeliveryOrderModel> pickupOrder(String orderId) async {
    try {
      debugPrint('📦 Marking order as picked up: $orderId');

      final deliveryManId = await _getDeliveryManId();
      debugPrint('📦 Delivery man ID: $deliveryManId');

      // Backend endpoint: PATCH /delivery-man/:id/order/:orderId/picked-up
      final response = await _dioClient.dio.patch(
        '/delivery-man/$deliveryManId/order/$orderId/picked-up',
      );

      debugPrint('📦 Pickup response: ${response.data}');

      Map<String, dynamic> orderData;
      if (response.data is Map && response.data['data'] != null) {
        orderData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        orderData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid order data format');
      }

      return _transformDeliveryOrderData(orderData);
    } on DioException catch (e) {
      debugPrint('❌ Error marking order as picked up: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Mark order as on the way
  Future<DeliveryOrderModel> markOnTheWay(String orderId) async {
    try {
      debugPrint('🚗 Marking order as on the way: $orderId');

      final deliveryManId = await _getDeliveryManId();
      debugPrint('🚗 Delivery man ID: $deliveryManId');

      // Backend endpoint: PATCH /delivery-man/:id/order/:orderId/on-the-way
      final response = await _dioClient.dio.patch(
        '/delivery-man/$deliveryManId/order/$orderId/on-the-way',
      );

      debugPrint('🚗 On the way response: ${response.data}');

      Map<String, dynamic> orderData;
      if (response.data is Map && response.data['data'] != null) {
        orderData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        orderData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid order data format');
      }

      return _transformDeliveryOrderData(orderData);
    } on DioException catch (e) {
      debugPrint('❌ Error marking order as on the way: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Mark order as delivered
  Future<DeliveryOrderModel> deliverOrder(
    String orderId, {
    String? notes,
    String? signature,
  }) async {
    try {
      debugPrint('✅ Marking order as delivered: $orderId');

      final deliveryManId = await _getDeliveryManId();
      debugPrint('✅ Delivery man ID: $deliveryManId');

      // Backend endpoint: POST /delivery-man/:id/complete-delivery
      final response = await _dioClient.dio.post(
        '/delivery-man/$deliveryManId/complete-delivery',
        data: {
          'orderId': orderId,
          if (notes != null) 'notes': notes,
          if (signature != null) 'signature': signature,
        },
      );

      debugPrint('✅ Delivery complete response: ${response.data}');

      Map<String, dynamic> orderData;
      if (response.data is Map && response.data['data'] != null) {
        orderData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        orderData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid order data format');
      }

      return _transformDeliveryOrderData(orderData);
    } on DioException catch (e) {
      debugPrint('❌ Error marking order as delivered: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get delivery earnings
  Future<DeliveryEarnings> getEarnings({String? period}) async {
    try {
      debugPrint('📊 Fetching earnings, period: ${period ?? 'all'}');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('📊 Fetching earnings for delivery man: $deliveryManId');

      // Call the correct endpoint: /delivery-man/:id/earnings
      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/earnings',
        queryParameters: period != null ? {'period': period} : null,
      );

      debugPrint('📊 Earnings response: ${response.data}');

      // Backend returns { data: { totalEarnings, pendingEarnings, periodEarnings, periodDeliveries, ... } }
      Map<String, dynamic> earningsData;
      if (response.data is Map && response.data['data'] != null) {
        earningsData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        earningsData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid earnings data format');
      }

      // Transform backend response to match mobile model
      // Backend provides periodEarnings/periodDeliveries based on selected period
      // Mobile expects specific todayEarnings, weekEarnings, monthEarnings
      return DeliveryEarnings(
        totalEarnings: (earningsData['totalEarnings'] ?? 0).toDouble(),
        todayEarnings: period == 'today' ? (earningsData['periodEarnings'] ?? 0).toDouble() : 0,
        weekEarnings: period == 'week' ? (earningsData['periodEarnings'] ?? 0).toDouble() : 0,
        monthEarnings: period == 'month' ? (earningsData['periodEarnings'] ?? 0).toDouble() : 0,
        totalDeliveries: earningsData['periodDeliveries'] ?? 0,
        todayDeliveries: period == 'today' ? (earningsData['periodDeliveries'] ?? 0) : 0,
        weekDeliveries: period == 'week' ? (earningsData['periodDeliveries'] ?? 0) : 0,
        monthDeliveries: period == 'month' ? (earningsData['periodDeliveries'] ?? 0) : 0,
        averageRating: 0.0, // Not provided by backend in earnings endpoint
        totalRatings: 0, // Not provided by backend in earnings endpoint
      );
    } on DioException catch (e) {
      debugPrint('❌ Error fetching earnings: $e');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Error parsing earnings: $e');
      rethrow;
    }
  }

  /// Get delivery history
  Future<List<DeliveryOrderModel>> getHistory({
    int page = 1,
    int limit = 20,
  }) async {
    try {
      debugPrint('📜 Fetching history, page: $page, limit: $limit');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('📜 Fetching history for delivery man: $deliveryManId');

      // Call the correct endpoint: /delivery-man/:id/history
      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/history',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      debugPrint('📜 History response: ${response.data}');

      // Backend returns { data: [...] } or { data: { data: [...] } }
      List<dynamic> ordersData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is Map &&
            response.data['data']['data'] != null) {
          ordersData = response.data['data']['data'] as List;
        } else if (response.data['data'] is List) {
          ordersData = response.data['data'] as List;
        } else {
          ordersData = [];
        }
      } else if (response.data is List) {
        ordersData = response.data as List;
      } else {
        ordersData = [];
      }

      debugPrint('📜 Found ${ordersData.length} history orders');

      return ordersData
          .map((json) => _transformDeliveryOrderData(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      debugPrint('❌ Error fetching history: $e');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Error parsing history: $e');
      rethrow;
    }
  }

  /// Update delivery partner location
  Future<void> updateLocation({
    required double latitude,
    required double longitude,
  }) async {
    try {
      await _dioClient.post(
        ApiConstants.updateLocation,
        data: {
          'latitude': latitude,
          'longitude': longitude,
        },
      );
    } on DioException catch (e) {
      // Don't throw error for location updates to avoid disrupting the app
      debugPrint('❌ Error updating location: $e');
    }
  }

  /// Request withdrawal
  Future<void> requestWithdrawal({
    required double amount,
    required String paymentMethod,
    required Map<String, dynamic> paymentDetails,
  }) async {
    try {
      debugPrint('💰 Requesting withdrawal, amount: $amount');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('💰 Requesting withdrawal for delivery man: $deliveryManId');

      // Call the correct endpoint: POST /delivery-man/:id/withdraw
      await _dioClient.dio.post(
        '/delivery-man/$deliveryManId/withdraw',
        data: {
          'amount': amount,
          'paymentMethod': paymentMethod,
          'paymentDetails': paymentDetails,
        },
      );

      debugPrint('✅ Withdrawal request submitted successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error requesting withdrawal: $e');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Error processing withdrawal: $e');
      rethrow;
    }
  }

  /// Get delivery man reviews
  Future<Map<String, dynamic>> getReviews({int page = 1, int limit = 20}) async {
    try {
      debugPrint('⭐ Fetching reviews...');

      // First get delivery man profile to get the delivery man ID and rating info
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profileData;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profileData = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profileData = profileResponse.data as Map<String, dynamic>;
      } else {
        debugPrint('⭐ No profile data found');
        return {'reviews': [], 'averageRating': 0.0, 'totalReviews': 0};
      }

      final deliveryManId = profileData['id'];
      if (deliveryManId == null) {
        debugPrint('⭐ No delivery man ID found in profile');
        return {'reviews': [], 'averageRating': 0.0, 'totalReviews': 0};
      }

      debugPrint('⭐ Fetching reviews for delivery man: $deliveryManId');

      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/reviews',
        queryParameters: {
          'page': page,
          'limit': limit,
        },
      );

      debugPrint('⭐ Reviews response: ${response.data}');

      // Backend returns { data: [...reviews...], page, limit }
      // We need to transform to { reviews: [...], averageRating, totalReviews }
      List<dynamic> reviewsList = [];

      if (response.data is Map && response.data['data'] != null) {
        final responseData = response.data['data'];
        if (responseData is List) {
          // Backend returns reviews array in data
          reviewsList = responseData;
        } else if (responseData is Map && responseData['reviews'] != null) {
          // Backend returns { reviews: [...] } in data
          reviewsList = responseData['reviews'] as List? ?? [];
        }
      } else if (response.data is List) {
        reviewsList = response.data as List;
      }

      debugPrint('⭐ Found ${reviewsList.length} reviews');

      // Get rating info from profile
      final averageRating = (profileData['rating'] ?? 0).toDouble();
      final totalReviews = profileData['totalReviews'] ?? reviewsList.length;

      return {
        'reviews': reviewsList,
        'averageRating': averageRating,
        'totalReviews': totalReviews,
      };
    } on DioException catch (e) {
      debugPrint('❌ Error fetching reviews: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get delivery man stats
  Future<Map<String, dynamic>> getStats() async {
    try {
      debugPrint('📊 Fetching stats...');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('📊 Fetching stats for delivery man: $deliveryManId');

      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/stats',
      );

      debugPrint('📊 Stats response: ${response.data}');

      Map<String, dynamic> data;
      if (response.data is Map && response.data['data'] != null) {
        data = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        data = response.data as Map<String, dynamic>;
      } else {
        data = {};
      }

      return data;
    } on DioException catch (e) {
      debugPrint('❌ Error fetching stats: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update availability status
  Future<void> updateAvailability(String status) async {
    try {
      debugPrint('🔄 Updating availability to: $status');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('🔄 Updating availability for delivery man: $deliveryManId');

      await _dioClient.dio.patch(
        '/delivery-man/$deliveryManId/availability',
        data: {'availability': status},
      );

      debugPrint('✅ Availability updated successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error updating availability: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get delivery man profile
  Future<Map<String, dynamic>> getProfile() async {
    try {
      debugPrint('👤 Fetching profile...');

      // Use /delivery-man/me endpoint to get current delivery man profile
      final response = await _dioClient.dio.get('/delivery-man/me');

      debugPrint('👤 Profile response: ${response.data}');

      Map<String, dynamic> data;
      if (response.data is Map && response.data['data'] != null) {
        data = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        data = response.data as Map<String, dynamic>;
      } else {
        data = {};
      }

      return data;
    } on DioException catch (e) {
      debugPrint('❌ Error fetching profile: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update delivery man profile
  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    try {
      debugPrint('👤 Updating profile...');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('👤 Updating profile for delivery man: $deliveryManId');

      // Use PUT /delivery-man/:id to update profile (matches frontend)
      await _dioClient.dio.put(
        '/delivery-man/$deliveryManId',
        data: profileData,
      );

      debugPrint('✅ Profile updated successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error updating profile: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Upload avatar image
  Future<String> uploadAvatar(dynamic imageFile) async {
    try {
      debugPrint('📸 Uploading avatar...');

      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(
          imageFile.path,
          filename: 'avatar.jpg',
        ),
      });

      final response = await _dioClient.dio.post(
        '/auth/upload-avatar',
        data: formData,
      );

      debugPrint('📸 Upload response: ${response.data}');

      String url;
      if (response.data is Map && response.data['url'] != null) {
        url = response.data['url'] as String;
      } else if (response.data is Map && response.data['data'] != null && response.data['data']['url'] != null) {
        url = response.data['data']['url'] as String;
      } else {
        throw Exception('Invalid upload response');
      }

      return url;
    } on DioException catch (e) {
      debugPrint('❌ Error uploading avatar: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Delete delivery man account
  Future<void> deleteAccount() async {
    try {
      debugPrint('🗑️ Deleting account...');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('🗑️ Deleting account for delivery man: $deliveryManId');

      await _dioClient.dio.delete('/delivery-man/$deliveryManId');

      debugPrint('✅ Account deleted successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error deleting account: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get my assigned zone
  Future<Map<String, dynamic>?> getMyZone() async {
    try {
      debugPrint('🗺️ Fetching my zone...');

      // Use /delivery-man/me to get profile with zoneId
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profileData;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profileData = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profileData = profileResponse.data as Map<String, dynamic>;
      } else {
        debugPrint('🗺️ No profile data found');
        return null;
      }

      final zoneId = profileData['zoneId'] ?? profileData['zone_id'];
      debugPrint('🗺️ Zone ID from profile: $zoneId');

      if (zoneId == null) {
        debugPrint('🗺️ No zone assigned to this delivery man');
        return null;
      }

      // Fetch all zones and find the assigned one
      final zonesResponse = await _dioClient.dio.get('/zones');

      List<dynamic> zonesData;
      if (zonesResponse.data is Map && zonesResponse.data['data'] != null) {
        if (zonesResponse.data['data'] is List) {
          zonesData = zonesResponse.data['data'] as List;
        } else if (zonesResponse.data['data'] is Map && zonesResponse.data['data']['data'] != null) {
          zonesData = zonesResponse.data['data']['data'] as List;
        } else {
          zonesData = [];
        }
      } else if (zonesResponse.data is List) {
        zonesData = zonesResponse.data as List;
      } else {
        zonesData = [];
      }

      debugPrint('🗺️ Found ${zonesData.length} zones');

      // Find my assigned zone
      for (final zone in zonesData) {
        if (zone['id'] == zoneId) {
          debugPrint('🗺️ Found assigned zone: ${zone['name']}');
          return zone as Map<String, dynamic>;
        }
      }

      debugPrint('🗺️ Zone ID $zoneId not found in zones list');
      return null;
    } on DioException catch (e) {
      debugPrint('❌ Error fetching my zone: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get preferred zones
  Future<List<Map<String, dynamic>>> getPreferredZones() async {
    try {
      debugPrint('🗺️ Fetching zones...');

      // First get delivery man ID from /me endpoint
      final profileResponse = await _dioClient.dio.get('/delivery-man/me');

      Map<String, dynamic> profile;
      if (profileResponse.data is Map && profileResponse.data['data'] != null) {
        profile = profileResponse.data['data'] as Map<String, dynamic>;
      } else if (profileResponse.data is Map) {
        profile = profileResponse.data as Map<String, dynamic>;
      } else {
        throw Exception('Failed to get delivery man profile');
      }

      final deliveryManId = profile['id'];
      if (deliveryManId == null) {
        throw Exception('Delivery man ID not found');
      }

      debugPrint('🗺️ Fetching zones for delivery man: $deliveryManId');

      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/zones',
      );

      debugPrint('🗺️ Zones response: ${response.data}');

      List<dynamic> zonesData;
      if (response.data is Map && response.data['data'] != null) {
        if (response.data['data'] is List) {
          zonesData = response.data['data'] as List;
        } else if (response.data['data'] is Map && response.data['data']['zones'] != null) {
          zonesData = response.data['data']['zones'] as List;
        } else {
          zonesData = [];
        }
      } else if (response.data is List) {
        zonesData = response.data as List;
      } else {
        zonesData = [];
      }

      return zonesData.cast<Map<String, dynamic>>();
    } on DioException catch (e) {
      debugPrint('❌ Error fetching zones: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get delivery man notifications
  Future<Map<String, dynamic>> getNotifications({
    int page = 1,
    int limit = 20,
    bool? unreadOnly,
  }) async {
    try {
      debugPrint('🔔 Fetching delivery notifications...');

      final deliveryManId = await _getDeliveryManId();
      debugPrint('🔔 Delivery man ID: $deliveryManId');

      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
        if (unreadOnly != null) 'unreadOnly': unreadOnly,
      };

      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/notifications',
        queryParameters: queryParams,
      );

      debugPrint('🔔 Notifications response: ${response.data}');

      List<dynamic> notificationsData = [];
      int total = 0;

      if (response.data is Map && response.data['data'] != null) {
        final data = response.data['data'];
        if (data is List) {
          notificationsData = data;
          total = response.data['total'] ?? notificationsData.length;
        } else if (data is Map && data['data'] != null) {
          notificationsData = data['data'] as List? ?? [];
          total = data['total'] ?? notificationsData.length;
        }
      } else if (response.data is List) {
        notificationsData = response.data as List;
        total = notificationsData.length;
      }

      debugPrint('🔔 Found ${notificationsData.length} notifications');

      // Transform notifications to ensure read field exists
      final notifications = notificationsData.map((n) {
        final notificationMap = Map<String, dynamic>.from(n as Map);
        if (notificationMap['isRead'] != null && notificationMap['read'] == null) {
          notificationMap['read'] = notificationMap['isRead'];
        }
        return notificationMap;
      }).toList();

      return {
        'notifications': notifications,
        'total': total,
        'page': page,
        'totalPages': (total / limit).ceil(),
      };
    } on DioException catch (e) {
      debugPrint('❌ Error fetching notifications: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get delivery man unread notification count
  Future<int> getUnreadNotificationCount() async {
    try {
      debugPrint('🔔 Fetching unread notification count...');

      final deliveryManId = await _getDeliveryManId();

      final response = await _dioClient.dio.get(
        '/delivery-man/$deliveryManId/notifications/unread-count',
      );

      debugPrint('🔔 Unread count response: ${response.data}');

      if (response.data is Map) {
        if (response.data['data'] != null) {
          final data = response.data['data'];
          if (data is Map) {
            return data['count'] ?? 0;
          }
          return data as int? ?? 0;
        }
        return response.data['count'] ?? 0;
      }
      return 0;
    } on DioException catch (e) {
      debugPrint('❌ Error fetching unread count: $e');
      // Return 0 instead of throwing to avoid breaking the UI
      return 0;
    }
  }

  /// Mark delivery notification as read
  Future<void> markNotificationAsRead(String notificationId) async {
    try {
      debugPrint('🔔 Marking notification as read: $notificationId');

      final deliveryManId = await _getDeliveryManId();

      await _dioClient.dio.patch(
        '/delivery-man/$deliveryManId/notifications/$notificationId/read',
      );

      debugPrint('✅ Notification marked as read');
    } on DioException catch (e) {
      debugPrint('❌ Error marking notification as read: $e');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Mark all delivery notifications as read
  Future<void> markAllNotificationsAsRead() async {
    try {
      debugPrint('🔔 Marking all notifications as read...');

      final deliveryManId = await _getDeliveryManId();

      await _dioClient.dio.patch(
        '/delivery-man/$deliveryManId/notifications/read-all',
      );

      debugPrint('✅ All notifications marked as read');
    } on DioException catch (e) {
      debugPrint('❌ Error marking all notifications as read: $e');
      throw ErrorHandler.handleError(e);
    }
  }
}
