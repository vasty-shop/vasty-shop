import 'package:dio/dio.dart';
import '../../core/network/dio_client.dart';
import '../../core/constants/api_constants.dart';
import '../../core/errors/error_handler.dart';
import '../models/delivery_man_model.dart';

class DeliveryManRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get all delivery men for the shop
  Future<List<DeliveryManModel>> getDeliveryMen({String? shopId}) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      final response = await _dioClient.get(
        ApiConstants.deliveryMen,
        options: options,
      );

      List<dynamic> deliveryMenData;
      if (response.data is Map) {
        if (response.data['data'] != null) {
          deliveryMenData = response.data['data'] as List;
        } else if (response.data['deliveryMen'] != null) {
          deliveryMenData = response.data['deliveryMen'] as List;
        } else {
          deliveryMenData = [];
        }
      } else if (response.data is List) {
        deliveryMenData = response.data as List;
      } else {
        deliveryMenData = [];
      }

      return deliveryMenData
          .map((json) => DeliveryManModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Register a new delivery man
  Future<DeliveryManModel> registerDeliveryMan({
    required String name,
    required String email,
    required String phone,
    required String password,
    String? zoneId,
    String? shopId,
  }) async {
    try {
      final data = {
        'name': name.trim(),
        'email': email.trim(),
        'phone': phone.trim(),
        'password': password,
        'type': 'freelancer',
      };

      // Only add zoneId if provided
      if (zoneId != null && zoneId.isNotEmpty) {
        data['zoneId'] = zoneId;
      }

      final response = await _dioClient.post(
        ApiConstants.registerDeliveryMan,
        data: data,
      );

      final responseData = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      return DeliveryManModel.fromJson(responseData as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Get delivery zones for delivery man assignment
  /// Uses /zones endpoint with shopId (matching frontend fetchDeliveryZones)
  Future<List<DeliveryZoneModel>> getDeliveryZones({String? shopId}) async {
    try {
      final response = await _dioClient.get(
        ApiConstants.deliveryZones,
        queryParameters: shopId != null ? {'shopId': shopId} : null,
        options: shopId != null
            ? Options(headers: {'x-shop-id': shopId})
            : null,
      );

      List<dynamic> zonesData;
      if (response.data is Map) {
        if (response.data['data'] != null) {
          zonesData = response.data['data'] as List;
        } else if (response.data['zones'] != null) {
          zonesData = response.data['zones'] as List;
        } else {
          zonesData = [];
        }
      } else if (response.data is List) {
        zonesData = response.data as List;
      } else {
        zonesData = [];
      }

      return zonesData
          .map((json) => DeliveryZoneModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Assign order to delivery man
  Future<void> assignOrderToDeliveryMan({
    required String orderId,
    required String deliveryManId,
    String? shopId,
    String? notes,
  }) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      await _dioClient.post(
        ApiConstants.assignOrderToDeliveryMan,
        data: {
          'orderId': orderId,
          'deliveryManId': deliveryManId,
          if (notes != null) 'note': notes,
        },
        options: options,
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update delivery man zone assignment
  Future<DeliveryManModel> updateDeliveryManZone({
    required String deliveryManId,
    String? zoneId,
    String? shopId,
  }) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      final response = await _dioClient.put(
        '${ApiConstants.deliveryMen}/$deliveryManId',
        data: {
          'zoneId': zoneId,
        },
        options: options,
      );

      final responseData = response.data is Map
          ? (response.data['data'] ?? response.data)
          : response.data;

      return DeliveryManModel.fromJson(responseData as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }

  /// Delete/Remove delivery man
  Future<void> deleteDeliveryMan(String deliveryManId, {String? shopId}) async {
    try {
      final options = shopId != null
          ? Options(headers: {'x-shop-id': shopId})
          : null;

      await _dioClient.delete(
        '${ApiConstants.deliveryMen}/$deliveryManId',
        options: options,
      );
    } on DioException catch (e) {
      throw ErrorHandler.handleError(e);
    }
  }
}
