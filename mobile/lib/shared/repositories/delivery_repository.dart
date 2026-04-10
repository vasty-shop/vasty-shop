import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../models/delivery_method_model.dart';

class DeliveryRepository {
  final DioClient _dioClient = DioClient.instance;

  // ==================== Delivery Methods ====================

  Future<List<DeliveryMethodModel>> getDeliveryMethods({String? shopId}) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      final response = await _dioClient.get(
        ApiConstants.deliveryMethods,
        options: options,
      );

      final List<dynamic> data = response.data is List
          ? response.data
          : (response.data['data'] ?? response.data['methods'] ?? []);

      return data.map((json) => DeliveryMethodModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<DeliveryMethodModel> createDeliveryMethod({
    required String type,
    required String name,
    required double baseCost,
    required String estimatedDays,
    required String description,
    bool isActive = true,
    String? carrier,
    bool trackingEnabled = true,
    List<String> zones = const ['domestic'],
    String? shopId,
  }) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      final response = await _dioClient.post(
        ApiConstants.deliveryMethods,
        data: {
          'type': type,
          'name': name,
          'baseCost': baseCost,
          'estimatedDays': estimatedDays,
          'description': description,
          'isActive': isActive,
          if (carrier != null) 'carrier': carrier,
          'trackingEnabled': trackingEnabled,
          'zones': zones,
        },
        options: options,
      );

      final data = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      return DeliveryMethodModel.fromJson(data);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<DeliveryMethodModel> updateDeliveryMethod({
    required String id,
    required String type,
    required String name,
    required double baseCost,
    required String estimatedDays,
    required String description,
    required bool isActive,
    String? carrier,
    required bool trackingEnabled,
    required List<String> zones,
    String? shopId,
  }) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      final response = await _dioClient.put(
        '${ApiConstants.deliveryMethods}/$id',
        data: {
          'type': type,
          'name': name,
          'baseCost': baseCost,
          'estimatedDays': estimatedDays,
          'description': description,
          'isActive': isActive,
          if (carrier != null) 'carrier': carrier,
          'trackingEnabled': trackingEnabled,
          'zones': zones,
        },
        options: options,
      );

      final data = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      return DeliveryMethodModel.fromJson(data);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<void> deleteDeliveryMethod(String id, {String? shopId}) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      await _dioClient.delete(
        '${ApiConstants.deliveryMethods}/$id',
        options: options,
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  // ==================== Shipping Zones ====================

  Future<List<ShippingZoneModel>> getShippingZones({String? shopId}) async {
    try {
      // Use /zones endpoint with includeInactive=true (matching frontend fetchVendorDeliveryZones)
      final queryParams = <String, dynamic>{
        'includeInactive': true,
      };
      if (shopId != null) {
        queryParams['shopId'] = shopId;
      }

      final response = await _dioClient.get(
        ApiConstants.deliveryZones,
        queryParameters: queryParams,
        options: shopId != null
            ? Options(headers: {'x-shop-id': shopId})
            : null,
      );

      final List<dynamic> data = response.data is List
          ? response.data
          : (response.data['data'] ?? response.data['zones'] ?? []);

      return data.map((json) => ShippingZoneModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<ShippingZoneModel> createShippingZone({
    required String name,
    String? description,
    String type = 'city',
    double? radius,
    String? city,
    String? state,
    String? country,
    bool isActive = true,
    List<String> countries = const [],
    List<String> regions = const [],
    required String shopId,
  }) async {
    try {
      // Frontend sends shopId in request body, not just headers
      final data = <String, dynamic>{
        'shopId': shopId,
        'name': name,
        'type': type,
        'isActive': isActive,
      };

      if (description != null && description.isNotEmpty) {
        data['description'] = description;
      }
      if (type == 'circle' && radius != null) {
        data['radius'] = radius;
      }
      if (city != null && city.isNotEmpty) {
        data['city'] = city;
      }
      if (state != null && state.isNotEmpty) {
        data['state'] = state;
      }
      if (country != null && country.isNotEmpty) {
        data['country'] = country;
      }
      if (countries.isNotEmpty) {
        data['countries'] = countries;
      }
      if (regions.isNotEmpty) {
        data['regions'] = regions;
      }

      // Use /zones endpoint (matching frontend DeliveryPage.tsx line 682)
      final response = await _dioClient.post(
        ApiConstants.deliveryZones,
        data: data,
      );

      final responseData = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      return ShippingZoneModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<ShippingZoneModel> updateShippingZone({
    required String id,
    required String name,
    String? description,
    double? radius,
    bool isActive = true,
    String? shopId,
  }) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      // Note: API only allows updating name, description, isActive, and radius
      // type, city, state, country cannot be updated
      final data = <String, dynamic>{
        'name': name,
        'isActive': isActive,
      };

      if (description != null && description.isNotEmpty) {
        data['description'] = description;
      }
      if (radius != null) {
        data['radius'] = radius;
      }

      // Use /zones endpoint (matching frontend DeliveryPage.tsx line 679)
      final response = await _dioClient.put(
        '${ApiConstants.deliveryZones}/$id',
        data: data,
        options: options,
      );

      final responseData = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      return ShippingZoneModel.fromJson(responseData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<void> deleteShippingZone(String id, {String? shopId}) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      // Use /zones endpoint (matching frontend DeliveryPage.tsx line 1071)
      await _dioClient.delete(
        '${ApiConstants.deliveryZones}/$id',
        options: options,
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  // ==================== Shipments / Tracking ====================

  Future<List<ShipmentModel>> getShipments({String? shopId}) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      // Get shop orders and filter those with tracking numbers
      final response = await _dioClient.get(
        ApiConstants.shopOrders,
        queryParameters: {'limit': 100},
        options: options,
      );

      final List<dynamic> ordersData = response.data is List
          ? response.data
          : (response.data['data'] ?? []);

      // Filter orders that have tracking numbers
      final shipments = ordersData
          .where((order) => order['trackingNumber'] != null && order['trackingNumber'].toString().isNotEmpty)
          .map((order) {
            return {
              'id': order['id'],
              'orderId': order['id'],
              'orderNumber': order['orderNumber'] ?? order['id'],
              'customer': order['customer']?['name'] ??
                         order['shippingAddress']?['fullName'] ??
                         order['shippingAddress']?['name'] ??
                         'Unknown',
              'method': order['deliveryMethod'] ?? order['method'] ?? 'Standard',
              'carrier': order['carrier'] ?? '',
              'trackingNumber': order['trackingNumber'] ?? '',
              'status': order['status'] ?? 'pending',
              'shippedDate': order['shippedDate'] ?? order['createdAt'],
              'estimatedDelivery': order['estimatedDelivery'] ?? order['estimatedDeliveryDate'],
            };
          })
          .toList();

      return shipments.map((json) => ShipmentModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<ShipmentModel> createShipment({
    required String orderId,
    required String method,
    required String carrier,
    required String trackingNumber,
    required String status,
    DateTime? estimatedDelivery,
    String? deliveryManId,
    String? deliveryManName,
    String? shopId,
  }) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      // Update order with tracking information
      final updateData = {
        'carrier': carrier,
        'trackingNumber': trackingNumber,
        if (estimatedDelivery != null)
          'estimatedDelivery': estimatedDelivery.toIso8601String(),
        'deliveryMethod': method,
        if (deliveryManName != null) 'deliveryManName': deliveryManName,
      };

      // Only include status if explicitly set to shipped
      if (status == 'shipped') {
        updateData['status'] = 'shipped';
      }

      final response = await _dioClient.patch(
        '${ApiConstants.orders}/$orderId/status',
        data: updateData,
        options: options,
      );

      final data = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      // Convert order response to shipment format
      return ShipmentModel.fromJson({
        'id': data['id'],
        'orderId': data['id'],
        'orderNumber': data['orderNumber'] ?? data['id'],
        'customer': data['customer']?['name'] ??
                   data['shippingAddress']?['fullName'] ??
                   'Unknown',
        'method': data['deliveryMethod'] ?? method,
        'carrier': data['carrier'] ?? carrier,
        'trackingNumber': data['trackingNumber'] ?? trackingNumber,
        'status': data['status'] ?? status,
        'shippedDate': data['shippedDate'] ?? data['updatedAt'],
        'estimatedDelivery': data['estimatedDelivery'],
      });
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<ShipmentModel> updateShipment({
    required String orderId,
    String? trackingNumber,
    String? status,
    String? carrier,
    DateTime? estimatedDelivery,
    String? shopId,
  }) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      // Update order status with tracking info
      final response = await _dioClient.patch(
        '${ApiConstants.orders}/$orderId/status',
        data: {
          if (status != null) 'status': status,
          if (carrier != null) 'carrier': carrier,
          if (trackingNumber != null) 'trackingNumber': trackingNumber,
          if (estimatedDelivery != null)
            'estimatedDelivery': estimatedDelivery.toIso8601String(),
        },
        options: options,
      );

      final data = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      // Convert order response to shipment format
      return ShipmentModel.fromJson({
        'id': data['id'],
        'orderId': data['id'],
        'orderNumber': data['orderNumber'] ?? data['id'],
        'customer': data['customer']?['name'] ??
                   data['shippingAddress']?['fullName'] ??
                   'Unknown',
        'method': data['deliveryMethod'] ?? 'Standard',
        'carrier': data['carrier'] ?? '',
        'trackingNumber': data['trackingNumber'] ?? '',
        'status': data['status'] ?? 'pending',
        'shippedDate': data['shippedDate'] ?? data['updatedAt'],
        'estimatedDelivery': data['estimatedDelivery'],
      });
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
