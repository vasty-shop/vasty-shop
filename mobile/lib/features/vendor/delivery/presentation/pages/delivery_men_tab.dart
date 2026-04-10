import 'package:flutter/material.dart';
import 'delivery_men_page.dart';

class DeliveryMenTab extends StatelessWidget {
  final String? shopId;

  const DeliveryMenTab({super.key, this.shopId});

  @override
  Widget build(BuildContext context) {
    return DeliveryMenPage(shopId: shopId);
  }
}
