import 'package:json_annotation/json_annotation.dart';

part 'vendor_profile_model.g.dart';

@JsonSerializable()
class VendorProfileModel {
  final String id;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final String? address;
  final String? avatar;
  final String? bio;
  final String? createdAt;
  final String? updatedAt;

  VendorProfileModel({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.phone,
    this.address,
    this.avatar,
    this.bio,
    this.createdAt,
    this.updatedAt,
  });

  factory VendorProfileModel.fromJson(Map<String, dynamic> json) =>
      _$VendorProfileModelFromJson(json);

  Map<String, dynamic> toJson() => _$VendorProfileModelToJson(this);

  String get fullName {
    final first = firstName ?? '';
    final last = lastName ?? '';
    final name = '$first $last'.trim();
    return name.isNotEmpty ? name : email;
  }

  String get initials {
    if (firstName != null && firstName!.isNotEmpty) {
      if (lastName != null && lastName!.isNotEmpty) {
        return '${firstName![0]}${lastName![0]}'.toUpperCase();
      }
      return firstName![0].toUpperCase();
    }
    return email.isNotEmpty ? email[0].toUpperCase() : 'V';
  }

  VendorProfileModel copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? phone,
    String? address,
    String? avatar,
    String? bio,
    String? createdAt,
    String? updatedAt,
  }) {
    return VendorProfileModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      address: address ?? this.address,
      avatar: avatar ?? this.avatar,
      bio: bio ?? this.bio,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
