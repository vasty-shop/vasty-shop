import 'package:json_annotation/json_annotation.dart';

part 'shop_model.g.dart';

@JsonSerializable()
class ShopModel {
  final String id;
  final String name;
  final String slug;
  final String? logo;
  final String? banner;
  final String status; // pending, active, suspended, closed
  final bool? isVerified;

  ShopModel({
    required this.id,
    required this.name,
    required this.slug,
    this.logo,
    this.banner,
    required this.status,
    this.isVerified,
  });

  factory ShopModel.fromJson(Map<String, dynamic> json) => _$ShopModelFromJson(json);
  Map<String, dynamic> toJson() => _$ShopModelToJson(this);

  bool get isActive => status == 'active';
  bool get isPending => status == 'pending';
  bool get isSuspended => status == 'suspended';
  bool get isClosed => status == 'closed';
}
