import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/team_models.dart';
import '../../data/repositories/team_repository.dart';

/// Team state
class TeamState {
  final List<TeamMember> members;
  final List<TeamInvitation> invitations;
  final TeamStatistics statistics;
  final bool isLoading;
  final String? error;
  final String searchQuery;

  TeamState({
    this.members = const [],
    this.invitations = const [],
    TeamStatistics? statistics,
    this.isLoading = false,
    this.error,
    this.searchQuery = '',
  }) : statistics = statistics ?? TeamStatistics.empty();

  TeamState copyWith({
    List<TeamMember>? members,
    List<TeamInvitation>? invitations,
    TeamStatistics? statistics,
    bool? isLoading,
    String? error,
    String? searchQuery,
  }) {
    return TeamState(
      members: members ?? this.members,
      invitations: invitations ?? this.invitations,
      statistics: statistics ?? this.statistics,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }

  /// Get filtered members based on search query
  List<TeamMember> get filteredMembers {
    if (searchQuery.isEmpty) return members;
    final query = searchQuery.toLowerCase();
    return members.where((member) {
      return member.user.displayName.toLowerCase().contains(query) ||
          (member.user.email?.toLowerCase().contains(query) ?? false);
    }).toList();
  }

  /// Get filtered invitations based on search query
  List<TeamInvitation> get filteredInvitations {
    if (searchQuery.isEmpty) return invitations.where((i) => i.isPending).toList();
    final query = searchQuery.toLowerCase();
    return invitations
        .where((i) => i.isPending && i.email.toLowerCase().contains(query))
        .toList();
  }

  /// Get pending invitations count
  int get pendingCount => invitations.where((i) => i.isPending).length;
}

/// Team notifier
class TeamNotifier extends StateNotifier<TeamState> {
  final TeamRepository _repository;

  TeamNotifier(this._repository) : super(TeamState());

  /// Load team data (members and invitations)
  Future<void> loadTeam() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      debugPrint('Loading team data...');

      // Load members and invitations in parallel
      final results = await Future.wait([
        _repository.getTeamMembers(),
        _repository.getInvitations(),
      ]);

      final members = results[0] as List<TeamMember>;
      final invitations = results[1] as List<TeamInvitation>;

      final statistics = TeamStatistics.fromData(members, invitations);

      state = TeamState(
        members: members,
        invitations: invitations,
        statistics: statistics,
        isLoading: false,
        searchQuery: state.searchQuery,
      );

      debugPrint('Team loaded: ${members.length} members, ${invitations.length} invitations');
    } catch (e) {
      debugPrint('Error loading team: $e');
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Set search query
  void setSearchQuery(String query) {
    state = state.copyWith(searchQuery: query);
  }

  /// Invite a team member
  Future<bool> inviteMember(InviteTeamMemberRequest request) async {
    try {
      debugPrint('Inviting member: ${request.email}');
      final invitation = await _repository.inviteMember(request);

      // Update local state
      final updatedInvitations = [invitation, ...state.invitations];
      state = state.copyWith(
        invitations: updatedInvitations,
        statistics: TeamStatistics.fromData(state.members, updatedInvitations),
      );

      return true;
    } catch (e) {
      debugPrint('Error inviting member: $e');
      return false;
    }
  }

  /// Update member role and permissions
  Future<bool> updateMemberRole(String memberId, UpdateMemberRoleRequest request) async {
    try {
      debugPrint('Updating member role: $memberId');
      final updatedMember = await _repository.updateMemberRole(memberId, request);

      // Update local state
      final updatedMembers = state.members.map((m) {
        if (m.id == memberId) {
          return updatedMember;
        }
        return m;
      }).toList();

      state = state.copyWith(
        members: updatedMembers,
        statistics: TeamStatistics.fromData(updatedMembers, state.invitations),
      );

      return true;
    } catch (e) {
      debugPrint('Error updating member role: $e');
      return false;
    }
  }

  /// Remove team member
  Future<bool> removeMember(String memberId) async {
    try {
      debugPrint('Removing member: $memberId');
      await _repository.removeMember(memberId);

      // Update local state
      final updatedMembers = state.members.where((m) => m.id != memberId).toList();
      state = state.copyWith(
        members: updatedMembers,
        statistics: TeamStatistics.fromData(updatedMembers, state.invitations),
      );

      return true;
    } catch (e) {
      debugPrint('Error removing member: $e');
      return false;
    }
  }

  /// Resend invitation
  Future<bool> resendInvitation(String invitationId) async {
    try {
      debugPrint('Resending invitation: $invitationId');
      await _repository.resendInvitation(invitationId);
      return true;
    } catch (e) {
      debugPrint('Error resending invitation: $e');
      return false;
    }
  }

  /// Cancel invitation
  Future<bool> cancelInvitation(String invitationId) async {
    try {
      debugPrint('Cancelling invitation: $invitationId');
      await _repository.cancelInvitation(invitationId);

      // Update local state
      final updatedInvitations = state.invitations
          .where((i) => i.id != invitationId)
          .toList();
      state = state.copyWith(
        invitations: updatedInvitations,
        statistics: TeamStatistics.fromData(state.members, updatedInvitations),
      );

      return true;
    } catch (e) {
      debugPrint('Error cancelling invitation: $e');
      return false;
    }
  }

  /// Refresh team data
  Future<void> refresh() async {
    await loadTeam();
  }
}

/// Provider
final teamProvider = StateNotifierProvider<TeamNotifier, TeamState>(
  (ref) => TeamNotifier(TeamRepository()),
);
