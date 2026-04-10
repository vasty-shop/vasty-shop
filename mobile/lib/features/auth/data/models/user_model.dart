import 'package:json_annotation/json_annotation.dart';


part 'user_model.g.dart';

@JsonSerializable()
class UserModel {
  final String id;
  final String email;
  final String name;
  final String? phone;
  final String? avatar;
  final String role; // customer, vendor, admin, delivery_man
  final Map<String, dynamic>? metadata;
  final bool? isActive;
  final String? createdAt;
  final String? updatedAt;

  UserModel({
    required this.id,
    required this.email,
    required this.name,
    this.phone,
    this.avatar,
    required this.role,
    this.metadata,
    this.isActive,
    this.createdAt,
    this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    // Handle role - check metadata.role if main role is 'user'
    String role = json['role'] as String? ?? 'user';
    if (role == 'user' && json['metadata'] != null) {
      final metadata = json['metadata'] as Map<String, dynamic>;
      if (metadata['role'] != null) {
        role = metadata['role'] as String;
      }
    }

    // Handle name - use fullName or metadata.full_name if available
    String name = json['name'] as String? ??
                  json['fullName'] as String? ??
                  '';
    if (name.isEmpty && json['metadata'] != null) {
      final metadata = json['metadata'] as Map<String, dynamic>;
      name = metadata['full_name'] as String? ??
             '${metadata['firstName'] ?? ''} ${metadata['lastName'] ?? ''}'.trim();
    }

    // Handle phone from metadata if not in main object
    String? phone = json['phone'] as String?;
    if (phone == null && json['metadata'] != null) {
      final metadata = json['metadata'] as Map<String, dynamic>;
      phone = metadata['phone'] as String?;
    }

    // Handle isActive - check both isActive and emailVerified
    bool? isActive;
    if (json['isActive'] != null) {
      isActive = json['isActive'] as bool;
    } else if (json['emailVerified'] != null) {
      isActive = json['emailVerified'] as bool;
    } else {
      isActive = true;
    }

    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: name.isNotEmpty ? name : json['email'] as String,
      phone: phone,
      avatar: json['avatar'] as String?,
      role: role,
      metadata: json['metadata'] as Map<String, dynamic>?,
      isActive: isActive,
      createdAt: json['createdAt'] as String?,
      updatedAt: json['updatedAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() => _$UserModelToJson(this);

  // Helper methods
  bool get isCustomer => role == 'customer';
  bool get isVendor => role == 'vendor';
  bool get isAdmin => role == 'admin';
  bool get isDeliveryMan => role == 'delivery_man';

  String get displayName => name;
  String get initials {
    final parts = name.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}
