import 'package:json_annotation/json_annotation.dart';
import 'product_model.dart';


part 'cart_item_model.g.dart';

@JsonSerializable()
class CartItemModel {
  final String id;
  final ProductModel product;
  final String size;
  final int quantity;
  final String? color;

  CartItemModel({
    required this.id,
    required this.product,
    required this.size,
    required this.quantity,
    this.color,
  });

  factory CartItemModel.fromJson(Map<String, dynamic> json) =>
      _$CartItemModelFromJson(json);
  Map<String, dynamic> toJson() => _$CartItemModelToJson(this);

  // Helper methods
  double get subtotal => product.effectivePrice * quantity;

  CartItemModel copyWith({
    String? id,
    ProductModel? product,
    String? size,
    int? quantity,
    String? color,
  }) {
    return CartItemModel(
      id: id ?? this.id,
      product: product ?? this.product,
      size: size ?? this.size,
      quantity: quantity ?? this.quantity,
      color: color ?? this.color,
    );
  }
}
