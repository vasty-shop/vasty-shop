import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SubscriptionService } from '../subscription/subscription.service';
import * as crypto from 'crypto';
import {
  EntityType,
  ShopInviteEntity,
  ShopTeamMemberEntity,
  TeamMemberRole,
  InvitationStatus,
} from '../../database/schema';

export interface InviteShopMemberDto {
  email: string;
  role?: TeamMemberRole | string;
  permissions?: string[];
  message?: string;
}

export interface AcceptInvitationDto {
  invitationToken: string;
}

@Injectable()
export class ShopInvitationService {
  private readonly logger = new Logger(ShopInvitationService.name);

  constructor(
    private readonly db: DatabaseService,
    @Inject(forwardRef(() => SubscriptionService))
    private subscriptionService: SubscriptionService,
  ) {}

  /**
   * Send shop invitation using database
   * Handles both registered and unregistered users
   */
  async inviteToShop(
    shopId: string,
    inviteDto: InviteShopMemberDto,
    invitedBy: string,
  ) {
    try {
      this.logger.log(`[inviteToShop] Starting invitation: shopId=${shopId}, email=${inviteDto.email}, invitedBy=${invitedBy}`);

      // Check if shop exists
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);
      this.logger.log(`[inviteToShop] Shop found: ${!!shop}, shop.id=${shop?.id}`);
      if (!shop) {
        throw new NotFoundException('Shop not found');
      }

      // Get shop owner to check team member limit (handle both snake_case and camelCase)
      const ownerId = shop.owner_id || shop.ownerId;
      this.logger.log(`[inviteToShop] Shop owner ID: ${ownerId}`);

      // Check team member limit based on subscription plan
      const teamMemberCheck = await this.subscriptionService.canAddTeamMember(ownerId);
      if (!teamMemberCheck.allowed) {
        throw new ForbiddenException(
          teamMemberCheck.message ||
          `Team member limit reached (${teamMemberCheck.current}/${teamMemberCheck.limit}). Please upgrade your plan to invite more team members.`
        );
      }

      // Check if user is already a team member
      const existingMembers = await this.db.queryEntities(
        EntityType.SHOP_TEAM_MEMBER,
        {
          filters: { shop_id: shopId, is_active: true },
        },
      );

      // Check if email is already a member by looking up users
      if (existingMembers.data) {
        for (const member of existingMembers.data) {
          try {
            // Only fetch user if user_id is defined
            if (member.user_id) {
              const user = await this.db.getUserById(member.user_id);
              if (user?.email?.toLowerCase() === inviteDto.email.toLowerCase()) {
                throw new ConflictException(
                  'User is already a member of this shop',
                );
              }
            }
          } catch (error) {
            if (error instanceof ConflictException) throw error;
            // User might not exist, continue checking
          }
        }
      }

      // Check if there's already a pending invitation
      const existingInvites = await this.db.queryEntities(
        EntityType.SHOP_INVITE,
        {
          filters: {
            shop_id: shopId,
            email: inviteDto.email.toLowerCase(),
            status: InvitationStatus.PENDING,
          },
        },
      );

      if (existingInvites.data && existingInvites.data.length > 0) {
        throw new ConflictException(
          'An invitation has already been sent to this email',
        );
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      // Determine role and permissions
      const role = inviteDto.role || TeamMemberRole.STAFF;
      const permissions =
        inviteDto.permissions || this.getDefaultPermissions(role);

      // Create invitation in database
      const invitation = await this.db.createEntity(
        EntityType.SHOP_INVITE,
        {
          shop_id: shopId,
          email: inviteDto.email.toLowerCase(),
          role,
          permissions,
          invited_by: invitedBy,
          token,
          message: inviteDto.message || null,
          expires_at: expiresAt.toISOString(),
          status: InvitationStatus.PENDING,
          created_at: new Date().toISOString(),
        },
      );

      // Send invitation email
      await this.sendInvitationEmail(
        inviteDto.email,
        token,
        shop.name,
        inviteDto.message,
      );

      this.logger.log(
        `Invitation sent to ${inviteDto.email} for shop ${shopId}`,
      );

      return {
        success: true,
        invitationId: invitation.id,
        email: inviteDto.email,
        status: InvitationStatus.PENDING,
        expiresAt: invitation.expires_at,
        message:
          'Invitation sent successfully. The user will receive an email with instructions.',
      };
    } catch (error) {
      this.logger.error('Failed to send shop invitation');
      this.logger.error(error?.message || error);
      this.logger.error(error?.stack);

      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new BadRequestException(`Failed to send invitation: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * List pending invitations for a shop
   */
  async listPendingInvitations(shopId: string, userId: string) {
    try {
      // Verify user has permission
      await this.verifyShopAdmin(shopId, userId);

      const invitations = await this.db.queryEntities(
        EntityType.SHOP_INVITE,
        {
          filters: { shop_id: shopId, status: InvitationStatus.PENDING },
        },
      );

      // Get inviter details for each invitation
      const invitationsWithDetails = await Promise.all(
        (invitations.data || []).map(async (invite: ShopInviteEntity) => {
          // Handle both snake_case and camelCase field names
          const invitedBy = invite.invited_by || invite.invitedBy;
          const createdAt = invite.created_at || invite.createdAt;
          const expiresAt = invite.expires_at || invite.expiresAt;

          let inviterName = 'Unknown';
          try {
            // Only fetch inviter if invited_by is defined
            if (invitedBy) {
              const inviter = await this.db.getUserById(
                invitedBy,
              );
              inviterName =
                inviter?.name ||
                inviter?.email ||
                'Unknown';
            }
          } catch (error) {
            // Inviter might not exist
          }

          return {
            id: invite.id,
            email: invite.email,
            role: invite.role,
            permissions: invite.permissions,
            status: invite.status,
            invitedBy: inviterName,
            invitedAt: createdAt,
            expiresAt: expiresAt,
            message: invite.message,
          };
        }),
      );

      return {
        success: true,
        invitations: invitationsWithDetails,
      };
    } catch (error) {
      this.logger.error('Failed to list invitations', error);
      throw new BadRequestException('Failed to retrieve invitations');
    }
  }

  /**
   * Get invitation details by token (PUBLIC - for AcceptInvitation page)
   */
  async getInvitationByToken(token: string) {
    try {
      // Find the invitation by token
      const invitations = await this.db.queryEntities(
        EntityType.SHOP_INVITE,
        {
          filters: { token },
          limit: 1,
        },
      );

      const invitation = invitations.data?.[0];
      if (!invitation) {
        throw new NotFoundException('Invalid invitation token');
      }

      // Handle both snake_case and camelCase field names
      const invitationShopId = invitation.shop_id || invitation.shopId;
      const invitedBy = invitation.invited_by || invitation.invitedBy;
      const expiresAt = invitation.expires_at || invitation.expiresAt;
      const createdAt = invitation.created_at || invitation.createdAt;

      // Get shop details
      const shop = await this.db.getEntity(
        EntityType.SHOP,
        invitationShopId,
      );

      // Get inviter details
      let inviterName = 'Unknown';
      try {
        // Only fetch inviter if invited_by is defined
        if (invitedBy) {
          const inviter = await this.db.getUserById(
            invitedBy,
          );
          inviterName =
            inviter?.name ||
            inviter?.email ||
            'Unknown';
        }
      } catch (error) {
        // Inviter might not exist
      }

      // Check if expired
      const isExpired = new Date(expiresAt) < new Date();

      return {
        success: true,
        invitation: {
          id: invitation.id,
          shopId: invitationShopId,
          shopName: shop?.name || 'Unknown Shop',
          shopLogo: shop?.logo || null,
          email: invitation.email,
          role: invitation.role,
          permissions: invitation.permissions,
          status: isExpired ? InvitationStatus.EXPIRED : invitation.status,
          token: invitation.token,
          expiresAt: expiresAt,
          createdAt: createdAt,
          invitedBy: invitedBy,
          invitedByName: inviterName,
          message: invitation.message || '',
          isExpired,
          shop: {
            id: shop?.id,
            name: shop?.name,
            description: shop?.description,
            logo: shop?.logo,
          },
        },
      };
    } catch (error) {
      this.logger.error('Failed to get invitation by token', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to retrieve invitation details');
    }
  }

  /**
   * Decline invitation by token (PUBLIC)
   */
  async declineInvitation(token: string) {
    try {
      // Find the invitation by token
      const invitations = await this.db.queryEntities(
        EntityType.SHOP_INVITE,
        {
          filters: { token },
          limit: 1,
        },
      );

      const invitation = invitations.data?.[0];
      if (!invitation) {
        throw new NotFoundException('Invalid invitation token');
      }

      // Update invitation status to declined
      await this.db.updateEntity(
        EntityType.SHOP_INVITE,
        invitation.id,
        {
          status: InvitationStatus.DECLINED,
                  },
      );

      return {
        success: true,
        message: 'Invitation declined successfully',
      };
    } catch (error) {
      this.logger.error('Failed to decline invitation', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Failed to decline invitation');
    }
  }

  /**
   * Accept a shop invitation
   */
  async acceptInvitation(invitationToken: string, userId: string) {
    try {
      // Find the invitation by token
      const invitations = await this.db.queryEntities(
        EntityType.SHOP_INVITE,
        {
          filters: { token: invitationToken },
          limit: 1,
        },
      );

      const invitation = invitations.data?.[0];
      if (!invitation) {
        throw new NotFoundException('Invalid invitation token');
      }

      // Handle both snake_case and camelCase field names
      const invitationShopId = invitation.shop_id || invitation.shopId;
      const invitedBy = invitation.invited_by || invitation.invitedBy;
      const expiresAt = invitation.expires_at || invitation.expiresAt;
      const createdAt = invitation.created_at || invitation.createdAt;

      // Check if invitation has expired
      if (new Date(expiresAt) < new Date()) {
        throw new BadRequestException('Invitation has expired');
      }

      // Check if already accepted
      if (invitation.status !== InvitationStatus.PENDING) {
        throw new ConflictException(
          'Invitation has already been ' + invitation.status,
        );
      }

      // Check if user is already a member
      const existingMembers = await this.db.queryEntities(
        EntityType.SHOP_TEAM_MEMBER,
        {
          filters: {
            shop_id: invitationShopId,
            user_id: userId,
            is_active: true,
          },
        },
      );

      if (existingMembers.data && existingMembers.data.length > 0) {
        // Update invitation status
        await this.db.updateEntity(
          EntityType.SHOP_INVITE,
          invitation.id,
          {
            status: InvitationStatus.ACCEPTED,
            accepted_at: new Date().toISOString(),
          },
        );

        throw new ConflictException('You are already a member of this shop');
      }

      // Get shop to check owner's team member limit
      const shop = await this.db.getEntity(EntityType.SHOP, invitationShopId);
      if (shop) {
        const ownerId = shop.owner_id || shop.ownerId;
        const teamMemberCheck = await this.subscriptionService.canAddTeamMember(ownerId);
        if (!teamMemberCheck.allowed) {
          throw new ForbiddenException(
            `The shop owner has reached their team member limit (${teamMemberCheck.current}/${teamMemberCheck.limit}). Please contact the shop owner to upgrade their plan.`
          );
        }
      }

      // Add user to shop team
      await this.db.createEntity(EntityType.SHOP_TEAM_MEMBER, {
        shop_id: invitationShopId,
        user_id: userId,
        role: invitation.role,
        permissions: invitation.permissions || [],
        status: 'active',
        is_active: true,
        joined_at: new Date().toISOString(),
        invited_at: createdAt,
        invited_by: invitedBy,
        created_at: new Date().toISOString(),
              });

      // Update invitation status
      await this.db.updateEntity(
        EntityType.SHOP_INVITE,
        invitation.id,
        {
          status: InvitationStatus.ACCEPTED,
          accepted_at: new Date().toISOString(),
        },
      );

      this.logger.log(
        `User ${userId} accepted invitation to shop ${invitationShopId}`,
      );

      return {
        success: true,
        shopId: invitationShopId,
        role: invitation.role,
        message: 'Successfully joined the shop',
      };
    } catch (error) {
      this.logger.error('Failed to accept invitation', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to accept invitation');
    }
  }

  /**
   * Cancel a pending invitation
   */
  async cancelInvitation(
    shopId: string,
    invitationId: string,
    userId: string,
  ) {
    try {
      this.logger.log(`[cancelInvitation] shopId: ${shopId}, invitationId: ${invitationId}, userId: ${userId}`);

      // Verify user has permission
      await this.verifyShopAdmin(shopId, userId);

      // Get invitation
      const invitation = await this.db.getEntity(
        EntityType.SHOP_INVITE,
        invitationId,
      );

      // Handle both snake_case and camelCase field names for compatibility
      const invitationShopId = invitation?.shop_id || invitation?.shopId;

      this.logger.log(`[cancelInvitation] invitation found: ${!!invitation}, invitationShopId: ${invitationShopId}`);

      if (!invitation) {
        throw new NotFoundException(`Invitation ${invitationId} not found in database`);
      }

      // Allow canceling if shop_id matches OR if invitation has no shop_id (broken data cleanup)
      if (invitationShopId && invitationShopId !== shopId) {
        throw new NotFoundException(`Invitation belongs to shop ${invitationShopId}, not ${shopId}`);
      }

      this.logger.log(`[cancelInvitation] invitation.status: "${invitation.status}", expected: "${InvitationStatus.PENDING}"`);

      // If already cancelled, just return success
      const status = (invitation.status || '').toLowerCase();
      if (status === 'cancelled' || status === 'canceled') {
        return {
          success: true,
          message: 'Invitation was already cancelled',
        };
      }

      // Only allow canceling pending invitations
      if (status !== 'pending' && status !== InvitationStatus.PENDING.toLowerCase()) {
        throw new BadRequestException(`Can only cancel pending invitations (current status: ${invitation.status})`);
      }

      // Update invitation status
      await this.db.updateEntity(
        EntityType.SHOP_INVITE,
        invitationId,
        {
          status: InvitationStatus.CANCELLED,
                  },
      );

      return {
        success: true,
        message: 'Invitation cancelled successfully',
      };
    } catch (error) {
      this.logger.error('Failed to cancel invitation', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to cancel invitation');
    }
  }

  /**
   * Resend an invitation email
   */
  async resendInvitation(
    shopId: string,
    invitationId: string,
    userId: string,
  ) {
    try {
      // Verify user has permission
      await this.verifyShopAdmin(shopId, userId);

      // Get the invitation
      const invitation = await this.db.getEntity(
        EntityType.SHOP_INVITE,
        invitationId,
      );

      // Handle both snake_case and camelCase field names
      const invitationShopId = invitation?.shop_id || invitation?.shopId;

      if (!invitation || invitationShopId !== shopId) {
        throw new NotFoundException('Invitation not found');
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new BadRequestException('Can only resend pending invitations');
      }

      // Generate new token and extend expiry
      const newToken = crypto.randomBytes(32).toString('hex');
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7); // 7 days expiry

      // Update invitation with new token and expiry
      await this.db.updateEntity(
        EntityType.SHOP_INVITE,
        invitationId,
        {
          token: newToken,
          expires_at: newExpiresAt.toISOString(),
                  },
      );

      // Get shop details for email
      const shop = await this.db.getEntity(EntityType.SHOP, shopId);

      // Resend invitation email
      await this.sendInvitationEmail(
        invitation.email,
        newToken,
        shop?.name || 'Shop',
        'This is a resent invitation to join our shop team.',
      );

      this.logger.log(
        `Resent invitation to ${invitation.email} for shop ${shopId}`,
      );

      return {
        success: true,
        invitationId: invitation.id,
        message: 'Invitation resent successfully.',
      };
    } catch (error) {
      this.logger.error('Failed to resend invitation', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to resend invitation');
    }
  }

  /**
   * Get available roles for shop team members
   */
  async getAvailableRoles() {
    const roles = [
      {
        name: TeamMemberRole.ADMIN,
        displayName: 'Admin',
        description:
          'Can manage shop settings, products, orders, and team members',
        permissions: [
          'manage_shop',
          'manage_products',
          'manage_orders',
          'manage_team',
          'view_analytics',
          'manage_settings',
        ],
      },
      {
        name: TeamMemberRole.MANAGER,
        displayName: 'Manager',
        description: 'Can manage products and orders, view analytics',
        permissions: ['manage_products', 'manage_orders', 'view_analytics'],
      },
      {
        name: TeamMemberRole.STAFF,
        displayName: 'Staff',
        description: 'Can view and update orders, view products',
        permissions: ['view_products', 'view_orders', 'update_order_status'],
      },
    ];

    return {
      success: true,
      roles,
    };
  }

  /**
   * Verify user is admin/owner of shop
   */
  private async verifyShopAdmin(
    shopId: string,
    userId: string,
  ): Promise<void> {
    // Check shop ownership first
    const shop = await this.db.getEntity(EntityType.SHOP, shopId);
    if (shop?.owner_id === userId) {
      return; // Owner has all permissions
    }

    // Check team membership
    const memberships = await this.db.queryEntities(
      EntityType.SHOP_TEAM_MEMBER,
      {
        filters: {
          shop_id: shopId,
          user_id: userId,
          is_active: true,
        },
        limit: 1,
      },
    );

    const membership = memberships.data?.[0];
    if (
      !membership ||
      (membership.role !== TeamMemberRole.ADMIN &&
        membership.role !== TeamMemberRole.OWNER)
    ) {
      throw new BadRequestException(
        'Insufficient permissions to manage invitations',
      );
    }
  }

  /**
   * Get default permissions for a role
   */
  private getDefaultPermissions(role: TeamMemberRole | string): string[] {
    const permissionMap: Record<string, string[]> = {
      [TeamMemberRole.OWNER]: ['*'],
      [TeamMemberRole.ADMIN]: [
        'manage_shop',
        'manage_products',
        'manage_orders',
        'manage_team',
        'view_analytics',
        'manage_settings',
      ],
      [TeamMemberRole.MANAGER]: [
        'manage_products',
        'manage_orders',
        'view_analytics',
      ],
      [TeamMemberRole.STAFF]: [
        'view_products',
        'view_orders',
        'update_order_status',
      ],
    };

    return permissionMap[role] || permissionMap[TeamMemberRole.STAFF];
  }

  /**
   * Send invitation email
   */
  private async sendInvitationEmail(
    email: string,
    token: string,
    shopName: string,
    message?: string,
  ) {
    try {
      const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/vendor/invite/${token}`;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #8B5CF6;">You've been invited to join ${shopName}</h2>
          <p>${message || "You've been invited to join the shop team."}</p>
          <p>Click the button below to accept the invitation:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteUrl}" style="background-color: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Accept Invitation</a>
          </div>
          <p>Or copy and paste this link: ${inviteUrl}</p>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        </div>
      `;

      await /* TODO: use EmailService */ this.db.sendEmail(
        email,
        `Invitation to join ${shopName}`,
        emailHtml,
        `You've been invited to join ${shopName}. Accept invitation: ${inviteUrl}`,
      );
    } catch (error) {
      this.logger.error('Failed to send invitation email', error);
      // Don't throw - we still want to create the invitation even if email fails
    }
  }
}
