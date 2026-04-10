class DeliveryManModel {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String countryCode;
  final String? zoneId;
  final String? zoneName;
  final String status; // 'active', 'pending', 'inactive'
  final DateTime? createdAt;

  DeliveryManModel({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.countryCode,
    this.zoneId,
    this.zoneName,
    this.status = 'pending',
    this.createdAt,
  });

  factory DeliveryManModel.fromJson(Map<String, dynamic> json) {
    // Handle phone number parsing - extract country code if included
    String phone = json['phone'] as String? ?? '';
    String countryCode = json['countryCode'] as String? ?? '+880';

    // If phone starts with +, extract country code
    if (phone.startsWith('+')) {
      // Common country codes (1-4 digits)
      final codeMatch = RegExp(r'^\+(\d{1,4})').firstMatch(phone);
      if (codeMatch != null) {
        countryCode = '+${codeMatch.group(1)}';
        phone = phone.substring(codeMatch.group(0)!.length);
      }
    }

    return DeliveryManModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? json['fullName'] as String? ?? 'Unknown',
      email: json['email'] as String? ?? '',
      phone: phone,
      countryCode: countryCode,
      zoneId: json['zoneId'] as String?,
      zoneName: json['zoneName'] as String? ?? json['zone']?['name'] as String?,
      status: json['status'] as String? ?? 'pending',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': '$countryCode$phone',
      'countryCode': countryCode,
      if (zoneId != null) 'zoneId': zoneId,
      'status': status,
    };
  }

  String get fullPhone => '$countryCode$phone';

  String get initials {
    final names = name.split(' ');
    if (names.length >= 2) {
      return '${names[0][0]}${names[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'D';
  }

  String get statusLabel {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  }
}

class DeliveryZoneModel {
  final String id;
  final String name;
  final String? description;

  DeliveryZoneModel({
    required this.id,
    required this.name,
    this.description,
  });

  factory DeliveryZoneModel.fromJson(Map<String, dynamic> json) {
    return DeliveryZoneModel(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      if (description != null) 'description': description,
    };
  }
}
