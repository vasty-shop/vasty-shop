import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';
import 'shop_model.dart';


part 'auth_response_model.g.dart';

@JsonSerializable()
class AuthResponseModel {
  final UserModel user;
  @JsonKey(name: 'accessToken')
  final String? token;
  @JsonKey(name: 'refreshToken')
  final String? refreshToken;
  final ShopModel? shop; // Single shop from vendor login
  final List<ShopModel>? shops; // Multiple shops from customer

  AuthResponseModel({
    required this.user,
    this.token,
    this.refreshToken,
    this.shop,
    this.shops,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    final response = _$AuthResponseModelFromJson(json);

    // If vendor login returns a single shop, set role to vendor and add shopId to metadata
    if (response.shop != null) {
      // Add shop ID to user metadata for easy access
      final updatedMetadata = Map<String, dynamic>.from(response.user.metadata ?? {});
      updatedMetadata['shopId'] = response.shop!.id;
      updatedMetadata['role'] = 'vendor'; // Also set in metadata for consistency

      final updatedUser = UserModel(
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        phone: response.user.phone,
        avatar: response.user.avatar,
        role: 'vendor', // Set role to vendor when shop is present
        metadata: updatedMetadata,
        isActive: response.user.isActive,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      );

      return AuthResponseModel(
        user: updatedUser,
        token: response.token,
        refreshToken: response.refreshToken,
        shop: response.shop,
        shops: response.shops,
      );
    }

    // If user has multiple shops (shops array), also treat as vendor
    if (response.shops != null && response.shops!.isNotEmpty) {
      final updatedMetadata = Map<String, dynamic>.from(response.user.metadata ?? {});
      updatedMetadata['shopId'] = response.shops!.first.id;
      updatedMetadata['role'] = 'vendor';

      final updatedUser = UserModel(
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        phone: response.user.phone,
        avatar: response.user.avatar,
        role: 'vendor', // Set role to vendor when shops exist
        metadata: updatedMetadata,
        isActive: response.user.isActive,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      );

      return AuthResponseModel(
        user: updatedUser,
        token: response.token,
        refreshToken: response.refreshToken,
        shop: response.shops!.first,
        shops: response.shops,
      );
    }

    return response;
  }

  Map<String, dynamic> toJson() => _$AuthResponseModelToJson(this);
}
