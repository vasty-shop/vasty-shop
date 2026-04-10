import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:easy_localization/easy_localization.dart';
import '../../data/models/team_models.dart';
import '../providers/team_provider.dart';

class VendorTeamPage extends ConsumerStatefulWidget {
  const VendorTeamPage({super.key});

  @override
  ConsumerState<VendorTeamPage> createState() => _VendorTeamPageState();
}

class _VendorTeamPageState extends ConsumerState<VendorTeamPage> {
  final _searchController = TextEditingController();
  bool _showInvitations = true;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(teamProvider.notifier).loadTeam();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final teamState = ref.watch(teamProvider);
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text('vendorTeam.title'.tr()),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.read(teamProvider.notifier).refresh(),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showInviteSheet(),
        icon: const Icon(Icons.person_add),
        label: Text('vendorTeam.inviteMember'.tr()),
      ),
      body: teamState.isLoading
          ? const Center(child: CircularProgressIndicator())
          : teamState.error != null
              ? _buildErrorView(teamState.error!)
              : RefreshIndicator(
                  onRefresh: () => ref.read(teamProvider.notifier).refresh(),
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildStatsCards(teamState.statistics),
                        const SizedBox(height: 20),
                        _buildSearchBar(),
                        const SizedBox(height: 16),
                        _buildMembersSection(teamState),
                        if (teamState.pendingCount > 0) ...[
                          const SizedBox(height: 24),
                          _buildInvitationsSection(teamState),
                        ],
                        const SizedBox(height: 80), // Space for FAB
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildErrorView(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'vendorTeam.failedToLoad'.tr(),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[500]),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => ref.read(teamProvider.notifier).loadTeam(),
              icon: const Icon(Icons.refresh),
              label: Text('common.retry'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCards(TeamStatistics stats) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.6,
      children: [
        _StatCard(
          title: 'vendorTeam.totalMembers'.tr(),
          value: stats.totalMembers.toString(),
          icon: Icons.people,
          color: Colors.blue,
        ),
        _StatCard(
          title: 'vendorTeam.active'.tr(),
          value: stats.activeMembers.toString(),
          icon: Icons.check_circle,
          color: Colors.green,
        ),
        _StatCard(
          title: 'vendorTeam.pending'.tr(),
          value: stats.pendingInvitations.toString(),
          icon: Icons.schedule,
          color: Colors.orange,
        ),
        _StatCard(
          title: 'vendorTeam.admins'.tr(),
          value: stats.adminCount.toString(),
          icon: Icons.admin_panel_settings,
          color: Colors.purple,
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return TextField(
      controller: _searchController,
      decoration: InputDecoration(
        hintText: 'vendorTeam.searchPlaceholder'.tr(),
        prefixIcon: const Icon(Icons.search),
        suffixIcon: _searchController.text.isNotEmpty
            ? IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  _searchController.clear();
                  ref.read(teamProvider.notifier).setSearchQuery('');
                },
              )
            : null,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey[300]!),
        ),
        filled: true,
        fillColor: Colors.grey[50],
      ),
      onChanged: (value) {
        ref.read(teamProvider.notifier).setSearchQuery(value);
      },
    );
  }

  Widget _buildMembersSection(TeamState teamState) {
    final members = teamState.filteredMembers;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'vendorTeam.teamMembers'.tr(),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            Text(
              '${members.length} ${'vendorTeam.members'.tr()}',
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (members.isEmpty)
          _buildEmptyState(
            icon: Icons.people_outline,
            title: 'vendorTeam.noMembers'.tr(),
            subtitle: 'vendorTeam.noMembersDesc'.tr(),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: members.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) => _MemberCard(
              member: members[index],
              onEditPermissions: () => _showPermissionsSheet(members[index]),
              onRemove: () => _confirmRemoveMember(members[index]),
            ),
          ),
      ],
    );
  }

  Widget _buildInvitationsSection(TeamState teamState) {
    final invitations = teamState.filteredInvitations;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        InkWell(
          onTap: () => setState(() => _showInvitations = !_showInvitations),
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                Text(
                  'vendorTeam.pendingInvitations'.tr(),
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.orange[100],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    invitations.length.toString(),
                    style: TextStyle(
                      color: Colors.orange[800],
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
                const Spacer(),
                Icon(
                  _showInvitations
                      ? Icons.keyboard_arrow_up
                      : Icons.keyboard_arrow_down,
                  color: Colors.grey[600],
                ),
              ],
            ),
          ),
        ),
        if (_showInvitations) ...[
          const SizedBox(height: 12),
          if (invitations.isEmpty)
            _buildEmptyState(
              icon: Icons.mail_outline,
              title: 'vendorTeam.noInvitations'.tr(),
              subtitle: 'vendorTeam.noInvitationsDesc'.tr(),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: invitations.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) => _InvitationCard(
                invitation: invitations[index],
                onResend: () => _resendInvitation(invitations[index]),
                onCancel: () => _confirmCancelInvitation(invitations[index]),
              ),
            ),
        ],
      ],
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
          ),
        ],
      ),
    );
  }

  void _showInviteSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => InviteMemberSheet(
        onInvite: (request) async {
          final success = await ref.read(teamProvider.notifier).inviteMember(request);
          if (mounted && sheetContext.mounted) {
            Navigator.pop(sheetContext);
            ScaffoldMessenger.of(sheetContext).showSnackBar(
              SnackBar(
                content: Text(
                  success
                      ? 'vendorTeam.invitationSent'.tr()
                      : 'vendorTeam.invitationFailed'.tr(),
                ),
                backgroundColor: success ? Colors.green : Colors.red,
              ),
            );
          }
        },
      ),
    );
  }

  void _showPermissionsSheet(TeamMember member) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) => PermissionsSheet(
        member: member,
        onUpdate: (request) async {
          final success = await ref.read(teamProvider.notifier).updateMemberRole(member.id, request);
          if (mounted && sheetContext.mounted) {
            Navigator.pop(sheetContext);
            ScaffoldMessenger.of(sheetContext).showSnackBar(
              SnackBar(
                content: Text(
                  success
                      ? 'vendorTeam.permissionsUpdated'.tr()
                      : 'vendorTeam.updateFailed'.tr(),
                ),
                backgroundColor: success ? Colors.green : Colors.red,
              ),
            );
          }
        },
      ),
    );
  }

  void _confirmRemoveMember(TeamMember member) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('vendorTeam.removeMember'.tr()),
        content: Text(
          'vendorTeam.removeConfirm'.tr(args: [member.user.displayName]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              final success = await ref.read(teamProvider.notifier).removeMember(member.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success
                          ? 'vendorTeam.memberRemoved'.tr()
                          : 'vendorTeam.removeFailed'.tr(),
                    ),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('common.remove'.tr()),
          ),
        ],
      ),
    );
  }

  Future<void> _resendInvitation(TeamInvitation invitation) async {
    final success = await ref.read(teamProvider.notifier).resendInvitation(invitation.id);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            success
                ? 'vendorTeam.invitationResent'.tr()
                : 'vendorTeam.resendFailed'.tr(),
          ),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  void _confirmCancelInvitation(TeamInvitation invitation) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: Text('vendorTeam.cancelInvitation'.tr()),
        content: Text(
          'vendorTeam.cancelConfirm'.tr(args: [invitation.email]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: Text('common.cancel'.tr()),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(dialogContext);
              final success = await ref.read(teamProvider.notifier).cancelInvitation(invitation.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      success
                          ? 'vendorTeam.invitationCancelled'.tr()
                          : 'vendorTeam.cancelFailed'.tr(),
                    ),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: Text('vendorTeam.cancelInvitation'.tr()),
          ),
        ],
      ),
    );
  }
}

// Stats Card Widget
class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const Spacer(),
              Text(
                value,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }
}

// Member Card Widget
class _MemberCard extends StatelessWidget {
  final TeamMember member;
  final VoidCallback onEditPermissions;
  final VoidCallback onRemove;

  const _MemberCard({
    required this.member,
    required this.onEditPermissions,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Avatar with role badge
              Stack(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: _getRoleColor(member.role).withValues(alpha: 0.1),
                    backgroundImage: member.user.avatar != null
                        ? NetworkImage(member.user.avatar!)
                        : null,
                    child: member.user.avatar == null
                        ? Text(
                            member.user.initials,
                            style: TextStyle(
                              color: _getRoleColor(member.role),
                              fontWeight: FontWeight.bold,
                            ),
                          )
                        : null,
                  ),
                  Positioned(
                    right: -2,
                    bottom: -2,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: _getRoleColor(member.role),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: Icon(
                        _getRoleIcon(member.role),
                        size: 10,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 12),
              // Member info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          member.user.displayName,
                          style: const TextStyle(
                            fontWeight: FontWeight.w600,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: _getRoleColor(member.role).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            member.role.displayName,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: _getRoleColor(member.role),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      member.user.email ?? '',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              // Status badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: member.isActive ? Colors.green[50] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: member.isActive ? Colors.green : Colors.grey,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      member.isActive
                          ? 'vendorTeam.active'.tr()
                          : 'vendorTeam.inactive'.tr(),
                      style: TextStyle(
                        fontSize: 11,
                        color: member.isActive ? Colors.green[700] : Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Permissions summary
          Row(
            children: [
              Icon(Icons.security, size: 14, color: Colors.grey[500]),
              const SizedBox(width: 4),
              Text(
                member.permissionSummary,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              const Spacer(),
              if (member.joinedAt != null)
                Text(
                  '${'vendorTeam.joined'.tr()} ${DateFormat('MMM d, y').format(member.joinedAt!)}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey[500],
                  ),
                ),
            ],
          ),
          if (!member.isOwner) ...[
            const Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onEditPermissions,
                    icon: const Icon(Icons.settings, size: 16),
                    label: Text('vendorTeam.permissions'.tr()),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.blue,
                      side: const BorderSide(color: Colors.blue),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                OutlinedButton.icon(
                  onPressed: onRemove,
                  icon: const Icon(Icons.person_remove, size: 16),
                  label: Text('common.remove'.tr()),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _getRoleColor(TeamRole role) {
    switch (role) {
      case TeamRole.owner:
        return Colors.amber[700]!;
      case TeamRole.admin:
        return Colors.purple;
      case TeamRole.manager:
        return Colors.blue;
      case TeamRole.staff:
        return Colors.teal;
    }
  }

  IconData _getRoleIcon(TeamRole role) {
    switch (role) {
      case TeamRole.owner:
        return Icons.star;
      case TeamRole.admin:
        return Icons.shield;
      case TeamRole.manager:
        return Icons.verified_user;
      case TeamRole.staff:
        return Icons.person;
    }
  }
}

// Invitation Card Widget
class _InvitationCard extends StatelessWidget {
  final TeamInvitation invitation;
  final VoidCallback onResend;
  final VoidCallback onCancel;

  const _InvitationCard({
    required this.invitation,
    required this.onResend,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    final isExpiringSoon = invitation.expiresAt.difference(DateTime.now()).inDays < 2;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: invitation.isExpired ? Colors.red[200]! : Colors.orange[200]!,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: Colors.orange[100],
                child: Icon(Icons.mail_outline, color: Colors.orange[700], size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      invitation.email,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            invitation.role.displayName,
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey[700],
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          Icons.schedule,
                          size: 12,
                          color: isExpiringSoon ? Colors.orange : Colors.grey[500],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${'vendorTeam.expires'.tr()} ${DateFormat('MMM d').format(invitation.expiresAt)}',
                          style: TextStyle(
                            fontSize: 11,
                            color: isExpiringSoon ? Colors.orange : Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onResend,
                  icon: const Icon(Icons.send, size: 16),
                  label: Text('vendorTeam.resend'.tr()),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.blue,
                    side: const BorderSide(color: Colors.blue),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: onCancel,
                  icon: const Icon(Icons.close, size: 16),
                  label: Text('common.cancel'.tr()),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.red,
                    side: const BorderSide(color: Colors.red),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Invite Member Sheet
class InviteMemberSheet extends StatefulWidget {
  final Function(InviteTeamMemberRequest) onInvite;

  const InviteMemberSheet({super.key, required this.onInvite});

  @override
  State<InviteMemberSheet> createState() => _InviteMemberSheetState();
}

class _InviteMemberSheetState extends State<InviteMemberSheet> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _messageController = TextEditingController();
  TeamRole _selectedRole = TeamRole.staff;
  final Set<String> _selectedPermissions = {};
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              Row(
                children: [
                  Text(
                    'vendorTeam.inviteMember'.tr(),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Email field
              Text(
                'vendorTeam.email'.tr(),
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  hintText: 'vendorTeam.emailPlaceholder'.tr(),
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'vendorTeam.enterEmail'.tr();
                  }
                  if (!value.contains('@')) {
                    return 'vendorTeam.invalidEmail'.tr();
                  }
                  return null;
                },
              ),
              const SizedBox(height: 20),

              // Role selection
              Text(
                'vendorTeam.role'.tr(),
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  for (final role in [TeamRole.staff, TeamRole.manager, TeamRole.admin])
                    Expanded(
                      child: Padding(
                        padding: EdgeInsets.only(
                          right: role != TeamRole.admin ? 8 : 0,
                        ),
                        child: _RoleButton(
                          role: role,
                          isSelected: _selectedRole == role,
                          onTap: () => setState(() => _selectedRole = role),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 20),

              // Permissions
              Text(
                'vendorTeam.permissions'.tr(),
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: TeamPermission.allPermissions.map((permission) {
                  final isSelected = _selectedPermissions.contains(permission.key);
                  return FilterChip(
                    label: Text(permission.displayName),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _selectedPermissions.add(permission.key);
                        } else {
                          _selectedPermissions.remove(permission.key);
                        }
                      });
                    },
                    selectedColor: Colors.blue[100],
                    checkmarkColor: Colors.blue[700],
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // Personal message
              Text(
                'vendorTeam.message'.tr(),
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              TextFormField(
                controller: _messageController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: 'vendorTeam.messagePlaceholder'.tr(),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Submit button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : Text('vendorTeam.sendInvitation'.tr()),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      setState(() => _isLoading = true);
      widget.onInvite(InviteTeamMemberRequest(
        email: _emailController.text.trim(),
        role: _selectedRole,
        permissions: _selectedPermissions.toList(),
        message: _messageController.text.trim(),
      ));
    }
  }
}

// Role Button Widget
class _RoleButton extends StatelessWidget {
  final TeamRole role;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleButton({
    required this.role,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.grey[100],
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Colors.blue : Colors.grey[300]!,
          ),
        ),
        child: Column(
          children: [
            Icon(
              _getIcon(),
              color: isSelected ? Colors.white : Colors.grey[600],
              size: 20,
            ),
            const SizedBox(height: 4),
            Text(
              role.displayName,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: isSelected ? Colors.white : Colors.grey[700],
              ),
            ),
          ],
        ),
      ),
    );
  }

  IconData _getIcon() {
    switch (role) {
      case TeamRole.owner:
        return Icons.star;
      case TeamRole.admin:
        return Icons.shield;
      case TeamRole.manager:
        return Icons.verified_user;
      case TeamRole.staff:
        return Icons.person;
    }
  }
}

// Permissions Sheet
class PermissionsSheet extends StatefulWidget {
  final TeamMember member;
  final Function(UpdateMemberRoleRequest) onUpdate;

  const PermissionsSheet({
    super.key,
    required this.member,
    required this.onUpdate,
  });

  @override
  State<PermissionsSheet> createState() => _PermissionsSheetState();
}

class _PermissionsSheetState extends State<PermissionsSheet> {
  late TeamRole _selectedRole;
  late Set<String> _selectedPermissions;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.member.role;
    _selectedPermissions = Set.from(widget.member.permissions);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              children: [
                Text(
                  'vendorTeam.managePermissions'.tr(),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              widget.member.user.displayName,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
            const SizedBox(height: 20),

            // Role selection
            Text(
              'vendorTeam.role'.tr(),
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                for (final role in [TeamRole.staff, TeamRole.manager, TeamRole.admin])
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(
                        right: role != TeamRole.admin ? 8 : 0,
                      ),
                      child: _RoleButton(
                        role: role,
                        isSelected: _selectedRole == role,
                        onTap: () => setState(() => _selectedRole = role),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 20),

            // Permissions
            Text(
              'vendorTeam.permissions'.tr(),
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
            const SizedBox(height: 8),
            ...TeamPermission.allPermissions.map((permission) {
              final isSelected = _selectedPermissions.contains(permission.key);
              return CheckboxListTile(
                value: isSelected,
                onChanged: (value) {
                  setState(() {
                    if (value == true) {
                      _selectedPermissions.add(permission.key);
                    } else {
                      _selectedPermissions.remove(permission.key);
                    }
                  });
                },
                title: Text(permission.displayName),
                subtitle: Text(
                  permission.description,
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
              );
            }),
            const SizedBox(height: 24),

            // Submit button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text('vendorTeam.updatePermissions'.tr()),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _submit() {
    setState(() => _isLoading = true);
    widget.onUpdate(UpdateMemberRoleRequest(
      role: _selectedRole,
      permissions: _selectedPermissions.toList(),
    ));
  }
}
