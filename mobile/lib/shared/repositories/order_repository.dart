import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../models/order_model.dart';


import 'package:easy_localization/easy_localization.dart';class OrderRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get all orders for the current user
  Future<List<OrderModel>> getOrders({
    String? status,
    int? limit,
    int? offset,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;
      if (limit != null) queryParams['limit'] = limit;
      if (offset != null) queryParams['offset'] = offset;

      final response = await _dioClient.get(
        ApiConstants.orders,
        queryParameters: queryParams,
      );

      // Handle different response formats
      List<dynamic> ordersData;
      if (response.data is Map) {
        if (response.data['data'] != null) {
          ordersData = response.data['data'] as List;
        } else if (response.data['orders'] != null) {
          ordersData = response.data['orders'] as List;
        } else {
          ordersData = [];
        }
      } else if (response.data is List) {
        ordersData = response.data as List;
      } else {
        ordersData = [];
      }

      return ordersData
          .map((json) => OrderModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get single order by ID
  Future<OrderModel> getOrderById(String orderId) async {
    try {
      final response = await _dioClient.get('${ApiConstants.orderDetail}/$orderId');

      Map<String, dynamic> orderData;
      if (response.data is Map && response.data['data'] != null) {
        orderData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        orderData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid order data format');
      }

      return OrderModel.fromJson(orderData);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Cancel an order (only allowed before vendor accepts)
  Future<void> cancelOrder(String orderId, {String? reason}) async {
    try {
      await _dioClient.post(
        '${ApiConstants.orders}/$orderId/cancel',
        data: reason != null ? {'reason': reason} : {},
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Request return for an order
  Future<void> requestReturn(String orderId, String reason) async {
    try {
      await _dioClient.post(
        '${ApiConstants.orders}/$orderId/return',
        data: {'reason': reason},
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
