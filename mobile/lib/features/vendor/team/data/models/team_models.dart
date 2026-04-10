/// Team member role enum
enum TeamRole {
  owner,
  admin,
  manager,
  staff;

  String get displayName {
    switch (this) {
      case TeamRole.owner:
        return 'Owner';
      case TeamRole.admin:
        return 'Admin';
      case TeamRole.manager:
        return 'Manager';
      case TeamRole.staff:
        return 'Staff';
    }
  }

  String get description {
    switch (this) {
      case TeamRole.owner:
        return 'Full access to all features';
      case TeamRole.admin:
        return 'Administrative access';
      case TeamRole.manager:
        return 'Management access';
      case TeamRole.staff:
        return 'Basic staff access';
    }
  }

  static TeamRole fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'owner':
        return TeamRole.owner;
      case 'admin':
        return TeamRole.admin;
      case 'manager':
        return TeamRole.manager;
      case 'staff':
        return TeamRole.staff;
      default:
        return TeamRole.staff;
    }
  }

  String toApiString() {
    switch (this) {
      case TeamRole.owner:
        return 'owner';
      case TeamRole.admin:
        return 'admin';
      case TeamRole.manager:
        return 'manager';
      case TeamRole.staff:
        return 'staff';
    }
  }
}

/// Invitation status enum
enum InvitationStatus {
  pending,
  accepted,
  declined,
  cancelled,
  expired;

  String get displayName {
    switch (this) {
      case InvitationStatus.pending:
        return 'Pending';
      case InvitationStatus.accepted:
        return 'Accepted';
      case InvitationStatus.declined:
        return 'Declined';
      case InvitationStatus.cancelled:
        return 'Cancelled';
      case InvitationStatus.expired:
        return 'Expired';
    }
  }

  static InvitationStatus fromString(String? value) {
    switch (value?.toLowerCase()) {
      case 'pending':
        return InvitationStatus.pending;
      case 'accepted':
        return InvitationStatus.accepted;
      case 'declined':
        return InvitationStatus.declined;
      case 'cancelled':
        return InvitationStatus.cancelled;
      case 'expired':
        return InvitationStatus.expired;
      default:
        return InvitationStatus.pending;
    }
  }
}

/// Team permission model
class TeamPermission {
  final String key;
  final String displayName;
  final String description;

  const TeamPermission({
    required this.key,
    required this.displayName,
    required this.description,
  });

  static const List<TeamPermission> allPermissions = [
    TeamPermission(
      key: 'manage_products',
      displayName: 'Manage Products',
      description: 'Create, edit, and delete products',
    ),
    TeamPermission(
      key: 'manage_orders',
      displayName: 'Manage Orders',
      description: 'View and process orders',
    ),
    TeamPermission(
      key: 'view_orders',
      displayName: 'View Orders',
      description: 'View order details',
    ),
    TeamPermission(
      key: 'update_order_status',
      displayName: 'Update Order Status',
      description: 'Change order status',
    ),
    TeamPermission(
      key: 'view_analytics',
      displayName: 'View Analytics',
      description: 'Access analytics and reports',
    ),
    TeamPermission(
      key: 'manage_settings',
      displayName: 'Manage Settings',
      description: 'Modify shop settings',
    ),
    TeamPermission(
      key: 'manage_team',
      displayName: 'Manage Team',
      description: 'Add and remove team members',
    ),
    TeamPermission(
      key: 'manage_shop',
      displayName: 'Manage Shop',
      description: 'Full shop management access',
    ),
  ];
}

/// Team member user info
class TeamMemberUser {
  final String id;
  final String? email;
  final String? name;
  final String? avatar;

  TeamMemberUser({
    required this.id,
    this.email,
    this.name,
    this.avatar,
  });

  factory TeamMemberUser.fromJson(Map<String, dynamic> json) {
    return TeamMemberUser(
      id: json['id'] ?? '',
      email: json['email'],
      name: json['name'],
      avatar: json['avatar'],
    );
  }

  String get displayName => name ?? email ?? 'Unknown';
  String get initials {
    if (name != null && name!.isNotEmpty) {
      final parts = name!.split(' ');
      if (parts.length >= 2) {
        return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
      }
      return name![0].toUpperCase();
    }
    if (email != null && email!.isNotEmpty) {
      return email![0].toUpperCase();
    }
    return '?';
  }
}

/// Team member model
class TeamMember {
  final String id;
  final String shopId;
  final String userId;
  final TeamRole role;
  final List<String> permissions;
  final String status;
  final bool isActive;
  final DateTime? joinedAt;
  final String? invitedBy;
  final DateTime? invitedAt;
  final DateTime createdAt;
  final DateTime updatedAt;
  final TeamMemberUser user;

  TeamMember({
    required this.id,
    required this.shopId,
    required this.userId,
    required this.role,
    required this.permissions,
    required this.status,
    required this.isActive,
    this.joinedAt,
    this.invitedBy,
    this.invitedAt,
    required this.createdAt,
    required this.updatedAt,
    required this.user,
  });

  factory TeamMember.fromJson(Map<String, dynamic> json) {
    return TeamMember(
      id: json['id'] ?? '',
      shopId: json['shopId'] ?? '',
      userId: json['userId'] ?? '',
      role: TeamRole.fromString(json['role']),
      permissions: json['permissions'] != null
          ? List<String>.from(json['permissions'])
          : [],
      status: json['status'] ?? 'active',
      isActive: json['isActive'] ?? true,
      joinedAt: json['joinedAt'] != null
          ? DateTime.tryParse(json['joinedAt'])
          : null,
      invitedBy: json['invitedBy'],
      invitedAt: json['invitedAt'] != null
          ? DateTime.tryParse(json['invitedAt'])
          : null,
      createdAt: DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt'] ?? '') ?? DateTime.now(),
      user: json['user'] != null
          ? TeamMemberUser.fromJson(json['user'])
          : TeamMemberUser(id: json['userId'] ?? ''),
    );
  }

  bool get hasFullAccess => permissions.contains('*');

  String get permissionSummary {
    if (hasFullAccess) return 'Full Access';
    if (permissions.isEmpty) return 'No Permissions';
    return '${permissions.length} Permissions';
  }

  bool get isOwner => role == TeamRole.owner;
}

/// Team invitation model
class TeamInvitation {
  final String id;
  final String email;
  final TeamRole role;
  final List<String> permissions;
  final InvitationStatus status;
  final String invitedBy;
  final DateTime invitedAt;
  final DateTime expiresAt;
  final String? message;

  TeamInvitation({
    required this.id,
    required this.email,
    required this.role,
    required this.permissions,
    required this.status,
    required this.invitedBy,
    required this.invitedAt,
    required this.expiresAt,
    this.message,
  });

  factory TeamInvitation.fromJson(Map<String, dynamic> json) {
    return TeamInvitation(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      role: TeamRole.fromString(json['role']),
      permissions: json['permissions'] != null
          ? List<String>.from(json['permissions'])
          : [],
      status: InvitationStatus.fromString(json['status']),
      invitedBy: json['invitedBy'] ?? '',
      invitedAt: DateTime.tryParse(json['invitedAt'] ?? '') ?? DateTime.now(),
      expiresAt: DateTime.tryParse(json['expiresAt'] ?? '') ?? DateTime.now().add(const Duration(days: 7)),
      message: json['message'],
    );
  }

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get isPending => status == InvitationStatus.pending && !isExpired;
}

/// Team statistics
class TeamStatistics {
  final int totalMembers;
  final int activeMembers;
  final int pendingInvitations;
  final int adminCount;

  TeamStatistics({
    required this.totalMembers,
    required this.activeMembers,
    required this.pendingInvitations,
    required this.adminCount,
  });

  factory TeamStatistics.empty() {
    return TeamStatistics(
      totalMembers: 0,
      activeMembers: 0,
      pendingInvitations: 0,
      adminCount: 0,
    );
  }

  factory TeamStatistics.fromData(List<TeamMember> members, List<TeamInvitation> invitations) {
    final activeCount = members.where((m) => m.isActive).length;
    final pendingCount = invitations.where((i) => i.isPending).length;
    final admins = members.where((m) =>
      m.role == TeamRole.owner || m.role == TeamRole.admin
    ).length;

    return TeamStatistics(
      totalMembers: members.length,
      activeMembers: activeCount,
      pendingInvitations: pendingCount,
      adminCount: admins,
    );
  }
}

/// Invite team member request
class InviteTeamMemberRequest {
  final String email;
  final TeamRole role;
  final List<String> permissions;
  final String? message;

  InviteTeamMemberRequest({
    required this.email,
    required this.role,
    required this.permissions,
    this.message,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'role': role.toApiString(),
      'permissions': permissions,
      if (message != null && message!.isNotEmpty) 'message': message,
    };
  }
}

/// Update member role request
class UpdateMemberRoleRequest {
  final TeamRole role;
  final List<String> permissions;

  UpdateMemberRoleRequest({
    required this.role,
    required this.permissions,
  });

  Map<String, dynamic> toJson() {
    return {
      'role': role.toApiString(),
      'permissions': permissions,
    };
  }
}
