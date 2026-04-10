import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../../../../../core/network/dio_client.dart';
import '../../../../../core/errors/error_handler.dart';
import '../../../../../core/constants/app_constants.dart';
import '../models/team_models.dart';

class TeamRepository {
  final DioClient _dioClient = DioClient.instance;

  /// Get team members
  Future<List<TeamMember>> getTeamMembers({String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('Getting team members...');

      final response = await _dioClient.get(
        '/shops/current/team',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('Team members fetched successfully');

      List<dynamic> membersData;
      if (response.data is Map && response.data['data'] != null) {
        membersData = response.data['data'] as List<dynamic>;
      } else if (response.data is List) {
        membersData = response.data as List<dynamic>;
      } else {
        membersData = [];
      }

      return membersData.map((json) => TeamMember.fromJson(json)).toList();
    } on DioException catch (e) {
      debugPrint('Error fetching team members: ${e.response?.statusCode}');
      debugPrint('Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('Unexpected error: $e');
      rethrow;
    }
  }

  /// Get pending invitations
  Future<List<TeamInvitation>> getInvitations({String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('Getting team invitations...');

      final response = await _dioClient.get(
        '/shops/current/team/invitations',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('Invitations fetched successfully');

      List<dynamic> invitationsData;
      if (response.data is Map && response.data['data'] != null) {
        invitationsData = response.data['data'] as List<dynamic>;
      } else if (response.data is List) {
        invitationsData = response.data as List<dynamic>;
      } else {
        invitationsData = [];
      }

      return invitationsData.map((json) => TeamInvitation.fromJson(json)).toList();
    } on DioException catch (e) {
      debugPrint('Error fetching invitations: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    } catch (e) {
      debugPrint('Unexpected error: $e');
      rethrow;
    }
  }

  /// Invite a team member
  Future<TeamInvitation> inviteMember(InviteTeamMemberRequest request, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('Inviting team member: ${request.email}');

      final response = await _dioClient.post(
        '/shops/current/team/invite',
        data: request.toJson(),
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('Invitation sent successfully');

      Map<String, dynamic> invitationData;
      if (response.data is Map && response.data['data'] != null) {
        invitationData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        invitationData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid invitation response format');
      }

      return TeamInvitation.fromJson(invitationData);
    } on DioException catch (e) {
      debugPrint('Error inviting member: ${e.response?.statusCode}');
      debugPrint('Error: ${e.response?.data}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Update member role and permissions
  Future<TeamMember> updateMemberRole(
    String memberId,
    UpdateMemberRoleRequest request,
    {String? shopId}
  ) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('Updating member role: $memberId');

      final response = await _dioClient.patch(
        '/shops/current/team/$memberId/role',
        data: request.toJson(),
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('Member role updated successfully');

      Map<String, dynamic> memberData;
      if (response.data is Map && response.data['data'] != null) {
        memberData = response.data['data'] as Map<String, dynamic>;
      } else if (response.data is Map) {
        memberData = response.data as Map<String, dynamic>;
      } else {
        throw Exception('Invalid member response format');
      }

      return TeamMember.fromJson(memberData);
    } on DioException catch (e) {
      debugPrint('Error updating member role: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Remove team member
  Future<void> removeMember(String memberId, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('Removing team member: $memberId');

      await _dioClient.delete(
        '/shops/current/team/$memberId',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('Team member removed successfully');
    } on DioException catch (e) {
      debugPrint('Error removing member: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Resend invitation
  Future<void> resendInvitation(String invitationId, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('Resending invitation: $invitationId');

      await _dioClient.post(
        '/shops/current/team/invitations/$invitationId/resend',
        data: {},
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('Invitation resent successfully');
    } on DioException catch (e) {
      debugPrint('Error resending invitation: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }

  /// Cancel invitation
  Future<void> cancelInvitation(String invitationId, {String? shopId}) async {
    try {
      final effectiveShopId = shopId ?? AppConstants.shopId;
      debugPrint('Cancelling invitation: $invitationId');

      await _dioClient.delete(
        '/shops/current/team/invitations/$invitationId',
        options: Options(headers: {'x-shop-id': effectiveShopId}),
      );

      debugPrint('Invitation cancelled successfully');
    } on DioException catch (e) {
      debugPrint('Error cancelling invitation: ${e.response?.statusCode}');
      throw ErrorHandler.handleError(e);
    }
  }
}
