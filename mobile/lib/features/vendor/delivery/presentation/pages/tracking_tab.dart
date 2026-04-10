import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../../../../shared/models/delivery_method_model.dart';
import '../../../../../shared/models/delivery_man_model.dart';
import '../../../../../shared/models/order_model.dart';
import '../../../../../shared/repositories/delivery_repository.dart';
import '../../../../../shared/repositories/delivery_man_repository.dart';
import '../../../../../shared/repositories/vendor_order_repository.dart';

final shipmentsProvider = FutureProvider.family<List<ShipmentModel>, String?>((ref, shopId) async {
  final repository = DeliveryRepository();
  return repository.getShipments(shopId: shopId);
});

class TrackingTab extends ConsumerWidget {
  final String? shopId;

  const TrackingTab({super.key, this.shopId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final shipmentsAsync = ref.watch(shipmentsProvider(shopId));

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddTrackingDialog(context, ref),
        icon: const Icon(Icons.add),
        label: Text('vendorDelivery.addTracking'.tr()),
      ),
      body: shipmentsAsync.when(
        data: (shipments) => RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(shipmentsProvider(shopId));
          },
          child: shipments.isEmpty
              ? ListView(
                  children: [
                    SizedBox(height: MediaQuery.of(context).size.height * 0.2),
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.local_shipping_outlined, size: 100, color: Colors.grey.shade300),
                          const SizedBox(height: 16),
                          Text('vendorDelivery.noShipments'.tr(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 32),
                            child: Text(
                              'vendorDelivery.shipmentTrackingDescription'.tr(),
                              style: TextStyle(color: Colors.grey.shade600),
                              textAlign: TextAlign.center,
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton.icon(
                            onPressed: () => _showAddTrackingDialog(context, ref),
                            icon: const Icon(Icons.add),
                            label: Text('vendorDelivery.addTracking'.tr()),
                          ),
                        ],
                      ),
                    ),
                  ],
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: shipments.length,
                  itemBuilder: (context, index) {
                    final shipment = shipments[index];
                    final statusColor = _getStatusColor(shipment.status);
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                        side: BorderSide(color: Colors.grey.shade200),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Header with icon
                            Row(
                              children: [
                                // Gradient Icon
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [statusColor.withValues(alpha: 0.7), statusColor],
                                      begin: Alignment.topLeft,
                                      end: Alignment.bottomRight,
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      BoxShadow(
                                        color: statusColor.withValues(alpha: 0.3),
                                        blurRadius: 8,
                                        offset: const Offset(0, 4),
                                      ),
                                    ],
                                  ),
                                  child: const Icon(Icons.local_shipping, color: Colors.white, size: 20),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '#${shipment.orderNumber}',
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        shipment.customer,
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: Colors.grey.shade600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                // Status Badge
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: statusColor.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    shipment.statusLabel,
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: statusColor,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // Tracking Info Box
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Column(
                                children: [
                                  Row(
                                    children: [
                                      Icon(Icons.qr_code, size: 16, color: Colors.grey.shade600),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          shipment.trackingNumber,
                                          style: const TextStyle(
                                            fontSize: 14,
                                            fontWeight: FontWeight.w600,
                                            fontFamily: 'monospace',
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildCompactInfo(
                                          Icons.local_shipping_outlined,
                                          'vendorDelivery.method'.tr(),
                                          shipment.method,
                                        ),
                                      ),
                                      Container(
                                        width: 1,
                                        height: 32,
                                        color: Colors.grey.shade300,
                                      ),
                                      Expanded(
                                        child: _buildCompactInfo(
                                          Icons.business,
                                          'vendorDelivery.carrier'.tr(),
                                          shipment.carrier.isNotEmpty ? shipment.carrier : '-',
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            // Estimated Delivery
                            if (shipment.estimatedDelivery != null) ...[
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Icon(Icons.calendar_today, size: 16, color: Colors.grey.shade600),
                                  const SizedBox(width: 8),
                                  Text(
                                    'vendorDelivery.estimatedDelivery'.tr(),
                                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    DateFormat('MMM dd, yyyy').format(shipment.estimatedDelivery!),
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  },
                ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text('Error: $error')),
      ),
    );
  }

  void _showAddTrackingDialog(BuildContext context, WidgetRef ref) {
    final trackingNumberController = TextEditingController();
    final carrierController = TextEditingController();
    final deliveryFeeController = TextEditingController(text: '5.00');
    final formKey = GlobalKey<FormState>();
    String selectedMethod = 'standard';
    OrderModel? selectedOrder;
    ShippingZoneModel? selectedZone;
    DeliveryManModel? selectedDeliveryMan;
    DateTime? estimatedDelivery;
    bool isLoading = false;
    List<OrderModel> availableOrders = [];
    List<ShippingZoneModel> availableZones = [];
    List<DeliveryManModel> availableDeliveryMen = [];
    bool loadingOrders = true;
    bool loadingZones = true;
    bool loadingDeliveryMen = true;

    // Load available orders
    void loadOrders(StateSetter setState) async {
      if (shopId == null) return;
      try {
        final orders = await VendorOrderRepository().getVendorOrders(
          shopId: shopId!,
          limit: 50,
        );
        // Filter trackable orders (matching frontend: pending, processing, confirmed, shipped)
        final trackable = orders.where((o) =>
          ['pending', 'processing', 'confirmed', 'shipped'].contains(o.status.toLowerCase())
        ).toList();
        setState(() {
          availableOrders = trackable;
          loadingOrders = false;
        });
      } catch (e) {
        setState(() => loadingOrders = false);
      }
    }

    // Load shipping zones
    void loadZones(StateSetter setState) async {
      if (shopId == null) return;
      try {
        final zones = await DeliveryRepository().getShippingZones(shopId: shopId);
        setState(() {
          availableZones = zones.where((z) => z.isActive).toList();
          loadingZones = false;
        });
      } catch (e) {
        setState(() => loadingZones = false);
      }
    }

    // Load delivery men
    void loadDeliveryMen(StateSetter setState) async {
      if (shopId == null) return;
      try {
        final men = await DeliveryManRepository().getDeliveryMen(shopId: shopId);
        setState(() {
          availableDeliveryMen = men;
          loadingDeliveryMen = false;
        });
      } catch (e) {
        setState(() => loadingDeliveryMen = false);
      }
    }

    // Generate tracking number
    String generateTrackingNumber() {
      final prefix = 'ODM';
      final timestamp = DateTime.now().millisecondsSinceEpoch.toRadixString(36).toUpperCase();
      final random = (DateTime.now().microsecond % 10000).toRadixString(36).toUpperCase().padLeft(4, '0');
      return '$prefix-$timestamp-$random';
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          // Load data on first build
          if (loadingOrders && availableOrders.isEmpty) {
            loadOrders(setState);
          }
          if (loadingZones && availableZones.isEmpty) {
            loadZones(setState);
          }
          if (loadingDeliveryMen && availableDeliveryMen.isEmpty) {
            loadDeliveryMen(setState);
          }

          final isOwnDelivery = selectedMethod == 'own_delivery_man';

          return Container(
            height: MediaQuery.of(context).size.height * 0.9,
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              children: [
                // Handle bar
                Container(
                  margin: const EdgeInsets.only(top: 12),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                // Header
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Icon(Icons.local_shipping, color: Theme.of(context).colorScheme.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'vendorDelivery.addTracking'.tr(),
                          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
                // Form
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(16),
                    child: Form(
                      key: formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Order Selection
                          Text(
                            '${'vendorDelivery.selectOrder'.tr()} *',
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 8),
                          if (loadingOrders)
                            const Center(child: CircularProgressIndicator())
                          else if (availableOrders.isEmpty)
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.orange.shade50,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.orange.shade200),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.info_outline, color: Colors.orange.shade700),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'vendorDelivery.noOrdersForTracking'.tr(),
                                      style: TextStyle(color: Colors.orange.shade700),
                                    ),
                                  ),
                                ],
                              ),
                            )
                          else
                            DropdownButtonFormField<OrderModel>(
                              value: selectedOrder,
                              decoration: InputDecoration(
                                border: const OutlineInputBorder(),
                                hintText: 'vendorDelivery.selectOrderHint'.tr(),
                                prefixIcon: const Icon(Icons.shopping_bag),
                              ),
                              items: availableOrders.map((order) {
                                return DropdownMenuItem(
                                  value: order,
                                  child: Text(
                                    '#${order.orderNumber} - ${order.shippingAddress.fullName.isNotEmpty ? order.shippingAddress.fullName : 'Customer'}',
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() => selectedOrder = value);
                              },
                              validator: (value) {
                                if (value == null) {
                                  return 'vendorDelivery.orderRequired'.tr();
                                }
                                return null;
                              },
                            ),
                          const SizedBox(height: 16),

                          // Customer Info (auto-filled from order)
                          if (selectedOrder != null) ...[
                            // Customer Name
                            TextFormField(
                              initialValue: selectedOrder!.shippingAddress.fullName,
                              decoration: InputDecoration(
                                labelText: 'vendorDelivery.customerName'.tr(),
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.person),
                                filled: true,
                                fillColor: Colors.grey.shade100,
                              ),
                              readOnly: true,
                            ),
                            const SizedBox(height: 12),

                            // Customer Phone
                            TextFormField(
                              initialValue: selectedOrder!.shippingAddress.phone,
                              decoration: InputDecoration(
                                labelText: 'vendorDelivery.customerPhone'.tr(),
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.phone),
                                filled: true,
                                fillColor: Colors.grey.shade100,
                              ),
                              readOnly: true,
                            ),
                            const SizedBox(height: 12),

                            // Delivery Address
                            TextFormField(
                              initialValue: selectedOrder!.shippingAddress.fullAddress,
                              maxLines: 2,
                              decoration: InputDecoration(
                                labelText: 'vendorDelivery.deliveryAddress'.tr(),
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.location_on),
                                filled: true,
                                fillColor: Colors.grey.shade100,
                              ),
                              readOnly: true,
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Delivery Zone
                          DropdownButtonFormField<ShippingZoneModel>(
                            value: selectedZone,
                            decoration: InputDecoration(
                              labelText: '${'vendorDelivery.deliveryZone'.tr()} *',
                              border: const OutlineInputBorder(),
                              prefixIcon: const Icon(Icons.map),
                            ),
                            items: loadingZones
                                ? []
                                : availableZones.map((zone) {
                                    return DropdownMenuItem(
                                      value: zone,
                                      child: Text(zone.name),
                                    );
                                  }).toList(),
                            onChanged: (value) {
                              setState(() => selectedZone = value);
                            },
                            validator: (value) {
                              if (value == null) {
                                return 'vendorDelivery.zoneRequired'.tr();
                              }
                              return null;
                            },
                          ),
                          if (availableZones.isEmpty && !loadingZones)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                'vendorDelivery.noZonesAvailable'.tr(),
                                style: TextStyle(fontSize: 12, color: Colors.orange.shade700),
                              ),
                            ),
                          const SizedBox(height: 16),

                          // Delivery Method
                          DropdownButtonFormField<String>(
                            value: selectedMethod,
                            decoration: InputDecoration(
                              labelText: '${'vendorDelivery.deliveryMethod'.tr()} *',
                              border: const OutlineInputBorder(),
                              prefixIcon: const Icon(Icons.local_shipping),
                            ),
                            items: [
                              DropdownMenuItem(value: 'standard', child: Text('vendorDelivery.standardShipping'.tr())),
                              DropdownMenuItem(value: 'express', child: Text('vendorDelivery.express'.tr())),
                              DropdownMenuItem(value: 'own_delivery_man', child: Text('vendorDelivery.ownDeliveryMan'.tr())),
                              DropdownMenuItem(value: 'local_pickup', child: Text('vendorDelivery.localPickup'.tr())),
                            ],
                            onChanged: (value) {
                              setState(() {
                                selectedMethod = value ?? 'standard';
                                if (selectedMethod == 'own_delivery_man') {
                                  trackingNumberController.text = generateTrackingNumber();
                                  carrierController.text = 'Own Delivery Man';
                                } else {
                                  carrierController.text = '';
                                  selectedDeliveryMan = null;
                                }
                              });
                            },
                          ),
                          const SizedBox(height: 16),

                          // Delivery Man Selection (only for own delivery)
                          if (isOwnDelivery) ...[
                            DropdownButtonFormField<DeliveryManModel>(
                              value: selectedDeliveryMan,
                              decoration: InputDecoration(
                                labelText: '${'vendorDelivery.selectDeliveryMan'.tr()} *',
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.person_pin),
                              ),
                              items: loadingDeliveryMen
                                  ? []
                                  : availableDeliveryMen.map((dm) {
                                      return DropdownMenuItem(
                                        value: dm,
                                        child: Text('${dm.name} (${dm.phone})'),
                                      );
                                    }).toList(),
                              onChanged: (value) {
                                setState(() => selectedDeliveryMan = value);
                              },
                              validator: (value) {
                                if (isOwnDelivery && value == null) {
                                  return 'vendorDelivery.deliveryManRequired'.tr();
                                }
                                return null;
                              },
                            ),
                            if (availableDeliveryMen.isEmpty && !loadingDeliveryMen)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  'vendorDelivery.noDeliveryMenAvailable'.tr(),
                                  style: TextStyle(fontSize: 12, color: Colors.orange.shade700),
                                ),
                              ),
                            const SizedBox(height: 16),

                            // Delivery Fee
                            TextFormField(
                              controller: deliveryFeeController,
                              keyboardType: const TextInputType.numberWithOptions(decimal: true),
                              decoration: InputDecoration(
                                labelText: '${'vendorDelivery.deliveryFee'.tr()} *',
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.attach_money),
                                hintText: '5.00',
                              ),
                              validator: (value) {
                                if (isOwnDelivery) {
                                  if (value == null || value.isEmpty) {
                                    return 'vendorDelivery.deliveryFeeRequired'.tr();
                                  }
                                  final fee = double.tryParse(value);
                                  if (fee == null || fee < 0) {
                                    return 'vendorDelivery.invalidDeliveryFee'.tr();
                                  }
                                }
                                return null;
                              },
                            ),
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                'vendorDelivery.deliveryFeeHint'.tr(),
                                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Carrier (not for own delivery)
                          if (!isOwnDelivery) ...[
                            TextFormField(
                              controller: carrierController,
                              decoration: InputDecoration(
                                labelText: 'vendorDelivery.carrier'.tr(),
                                hintText: 'e.g., FedEx, UPS, DHL',
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.business),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // Tracking Number
                          TextFormField(
                            controller: trackingNumberController,
                            readOnly: isOwnDelivery,
                            decoration: InputDecoration(
                              labelText: '${'vendorDelivery.trackingNumber'.tr()} *',
                              hintText: isOwnDelivery
                                  ? 'vendorDelivery.autoGenerated'.tr()
                                  : 'vendorDelivery.trackingNumberHint'.tr(),
                              border: const OutlineInputBorder(),
                              prefixIcon: const Icon(Icons.qr_code),
                              filled: isOwnDelivery,
                              fillColor: isOwnDelivery ? Colors.grey.shade100 : null,
                              suffixIcon: isOwnDelivery
                                  ? IconButton(
                                      onPressed: () {
                                        trackingNumberController.text = generateTrackingNumber();
                                      },
                                      icon: const Icon(Icons.refresh),
                                      tooltip: 'vendorDelivery.regenerate'.tr(),
                                    )
                                  : null,
                            ),
                            validator: (value) {
                              if (value == null || value.trim().isEmpty) {
                                return 'vendorDelivery.trackingNumberRequired'.tr();
                              }
                              return null;
                            },
                          ),
                          if (isOwnDelivery)
                            Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                'vendorDelivery.trackingAutoHint'.tr(),
                                style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                              ),
                            ),
                          const SizedBox(height: 16),

                          // Estimated Delivery Date
                          InkWell(
                            onTap: () async {
                              final date = await showDatePicker(
                                context: context,
                                initialDate: estimatedDelivery ?? DateTime.now().add(const Duration(days: 3)),
                                firstDate: DateTime.now(),
                                lastDate: DateTime.now().add(const Duration(days: 90)),
                              );
                              if (date != null) {
                                setState(() => estimatedDelivery = date);
                              }
                            },
                            child: InputDecorator(
                              decoration: InputDecoration(
                                labelText: 'vendorDelivery.estDelivery'.tr(),
                                border: const OutlineInputBorder(),
                                prefixIcon: const Icon(Icons.calendar_today),
                              ),
                              child: Text(
                                estimatedDelivery != null
                                    ? DateFormat('MMM dd, yyyy').format(estimatedDelivery!)
                                    : 'vendorDelivery.selectDate'.tr(),
                                style: TextStyle(
                                  color: estimatedDelivery != null ? Colors.black : Colors.grey,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                        ],
                      ),
                    ),
                  ),
                ),
                // Actions
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: Colors.grey.shade200)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: isLoading ? null : () => Navigator.pop(context),
                          child: Text('common.cancel'.tr()),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: isLoading || selectedOrder == null
                              ? null
                              : () async {
                                  if (!formKey.currentState!.validate()) return;

                                  setState(() => isLoading = true);

                                  try {
                                    await DeliveryRepository().createShipment(
                                      orderId: selectedOrder!.id,
                                      method: selectedMethod,
                                      carrier: carrierController.text.trim(),
                                      trackingNumber: trackingNumberController.text.trim(),
                                      status: 'shipped',
                                      estimatedDelivery: estimatedDelivery,
                                      deliveryManId: selectedDeliveryMan?.id,
                                      deliveryManName: selectedDeliveryMan?.name,
                                      shopId: shopId,
                                    );

                                    ref.invalidate(shipmentsProvider(shopId));

                                    if (context.mounted) {
                                      Navigator.pop(context);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('vendorDelivery.trackingCreated'.tr()),
                                          backgroundColor: Colors.green,
                                        ),
                                      );
                                    }
                                  } catch (e) {
                                    setState(() => isLoading = false);
                                    if (context.mounted) {
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(
                                          content: Text('Error: $e'),
                                          backgroundColor: Colors.red,
                                        ),
                                      );
                                    }
                                  }
                                },
                          child: isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Text('vendorDelivery.createTracking'.tr()),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildCompactInfo(IconData _, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return Colors.orange;
      case 'processing':
        return Colors.blue;
      case 'shipped':
      case 'in_transit':
        return Colors.purple;
      case 'delivered':
        return Colors.green;
      case 'cancelled':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
