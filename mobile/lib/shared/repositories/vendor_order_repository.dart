import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../models/order_model.dart';

class VendorOrderRepository {
  final DioClient _dioClient = DioClient.instance;

  Future<List<OrderModel>> getVendorOrders({
    required String shopId,
    String? status,
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      if (status != null) queryParams['status'] = status;
      if (limit != null) queryParams['limit'] = limit;

      final response = await _dioClient.get(
        ApiConstants.vendorOrders,
        queryParameters: queryParams,
        options: Options(
          headers: {'x-shop-id': shopId},
        ),
      );

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

  Future<void> acceptOrder(String orderId, String shopId) async {
    try {
      await _dioClient.post(
        '${ApiConstants.vendorAcceptOrder}/$orderId/accept',
        data: {},
        options: Options(
          headers: {'x-shop-id': shopId},
        ),
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<void> markAsShipped(String orderId, String shopId, {String? trackingNumber, String? carrier}) async {
    try {
      await _dioClient.post(
        '${ApiConstants.vendorMarkShipped}/$orderId/ship',
        data: {
          if (trackingNumber != null) 'trackingNumber': trackingNumber,
          if (carrier != null) 'carrier': carrier,
        },
        options: Options(
          headers: {'x-shop-id': shopId},
        ),
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  Future<void> cancelOrder(String orderId, String shopId, String reason) async {
    try {
      await _dioClient.post(
        '${ApiConstants.vendorCancelOrder}/$orderId/cancel',
        data: {
          'reason': reason,
          'cancelledBy': 'vendor',
        },
        options: Options(
          headers: {'x-shop-id': shopId},
        ),
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
