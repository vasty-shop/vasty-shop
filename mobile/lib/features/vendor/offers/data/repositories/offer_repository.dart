import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/errors/error_handler.dart';
import '../../../../../core/constants/app_constants.dart';
import '../models/offer_models.dart';

class OfferRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get shop offers
  Future<List<Offer>> getOffers({String? shopId, String? status}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('🎫 Fetching shop offers...');
      debugPrint('   Shop ID: $effectiveShopId');

      final queryParams = <String, dynamic>{
        if (status != null && status != 'all') 'status': status,
      };

      final response = await _dioClient.get(
        '/offers/shop',
        queryParameters: queryParams,
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Offers fetched successfully');

      // Handle response format
      List<dynamic> offersData;
      if (response.data is Map && response.data['data'] != null) {
        offersData = response.data['data'] as List<dynamic>;
      } else if (response.data is List) {
        offersData = response.data as List<dynamic>;
      } else {
        offersData = [];
      }

      return offersData.map((json) => Offer.fromJson(json)).toList();
    } on DioException catch (e) {
      debugPrint('❌ Error fetching offers: ${e.response?.statusCode}');
      debugPrint('   Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('❌ Unexpected error: $e');
      rethrow;
    }
  }

  /// Create a new offer
  Future<Offer> createOffer(Offer offer, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('➕ Creating offer...');
      debugPrint('   Offer: ${offer.name}');

      final response = await _dioClient.post(
        '/offers',
        data: offer.toJson(),
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Offer created successfully');

      Map<String, dynamic> offerData;
      if (response.data is Map && response.data['data'] != null) {
        offerData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        offerData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid offer response format');
      }

      return Offer.fromJson(offerData);
    } on DioException catch (e) {
      debugPrint('❌ Error creating offer: ${e.response?.statusCode}');
      debugPrint('   Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update an existing offer
  Future<Offer> updateOffer(String offerId, Offer offer, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('✏️ Updating offer: $offerId');

      final response = await _dioClient.put(
        '/offers/$offerId',
        data: offer.toJson(),
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Offer updated successfully');

      Map<String, dynamic> offerData;
      if (response.data is Map && response.data['data'] != null) {
        offerData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        offerData = response.data as Map<String, dynamic>;
      } else {
        return offer.copyWith(id: offerId);
      }

      return Offer.fromJson(offerData);
    } on DioException catch (e) {
      debugPrint('❌ Error updating offer: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Delete an offer
  Future<void> deleteOffer(String offerId, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('🗑️ Deleting offer: $offerId');

      await _dioClient.delete(
        '/offers/$offerId',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Offer deleted successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error deleting offer: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Toggle offer status (active/disabled)
  Future<void> changeOfferStatus(String offerId, String status, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('🔄 Changing offer status: $offerId -> $status');

      await _dioClient.patch(
        '/offers/$offerId/status',
        data: {'status': status},
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('✅ Offer status changed successfully');
    } on DioException catch (e) {
      debugPrint('❌ Error changing offer status: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }
}
