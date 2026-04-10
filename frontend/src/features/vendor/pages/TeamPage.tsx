import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  Mail,
  Shield,
  ShieldCheck,
  Crown,
  User,
  Check,
  X,
  Clock,
  Ban,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle,
  Send
} from 'lucide-react';
import { GlassCard, StatCard } from '../components/GlassCard';
import { toast } from 'sonner';
import { useDialog } from '../../../hooks/useDialog';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { AlertDialog } from '../../../components/ui/AlertDialog';
import {
  getVendorTeam,
  getTeamInvitations,
  getAvailableRoles,
  inviteTeamMember,
  updateTeamMemberRole,
  removeTeamMember,
  resendInvitation,
  cancelInvitation
} from '../api/vendorApi';
import type { TeamMember, TeamInvitation, TeamRole } from '@/lib/api';
import { api } from '@/lib/api';
import { useActiveShop } from '@/hooks/useActiveShop';

const getPermissions = (t: (key: string, options?: { defaultValue: string }) => string) => [
  { id: 'manage_products', label: t('vendor.team.permissions.manageProducts', { defaultValue: 'Manage Products' }), description: t('vendor.team.permissions.manageProductsDesc', { defaultValue: 'Create, edit, and delete products' }) },
  { id: 'manage_orders', label: t('vendor.team.permissions.manageOrders', { defaultValue: 'Manage Orders' }), description: t('vendor.team.permissions.manageOrdersDesc', { defaultValue: 'View and process orders' }) },
  { id: 'view_orders', label: t('vendor.team.permissions.viewOrders', { defaultValue: 'View Orders' }), description: t('vendor.team.permissions.viewOrdersDesc', { defaultValue: 'View order details' }) },
  { id: 'update_order_status', label: t('vendor.team.permissions.updateOrderStatus', { defaultValue: 'Update Order Status' }), description: t('vendor.team.permissions.updateOrderStatusDesc', { defaultValue: 'Change order status' }) },
  { id: 'view_analytics', label: t('vendor.team.permissions.viewAnalytics', { defaultValue: 'View Analytics' }), description: t('vendor.team.permissions.viewAnalyticsDesc', { defaultValue: 'Access analytics and reports' }) },
  { id: 'manage_settings', label: t('vendor.team.permissions.shopSettings', { defaultValue: 'Shop Settings' }), description: t('vendor.team.permissions.shopSettingsDesc', { defaultValue: 'Modify shop settings' }) },
  { id: 'manage_team', label: t('vendor.team.permissions.manageTeam', { defaultValue: 'Manage Team' }), description: t('vendor.team.permissions.manageTeamDesc', { defaultValue: 'Add and remove team members' }) },
  { id: 'manage_shop', label: t('vendor.team.permissions.manageShop', { defaultValue: 'Manage Shop' }), description: t('vendor.team.permissions.manageShopDesc', { defaultValue: 'Full shop management access' }) }
];

export const TeamPage: React.FC = () => {
  const { t } = useTranslation();
  const dialog = useDialog();

  // Get active shop context
  const { shop, shopId, isLoading: shopsLoading } = useActiveShop();

  // Set shop context in API client
  useEffect(() => {
    if (shopId) {
      api.setShopId(shopId);
    }
  }, [shopId]);

  // Get translated permissions
  const allPermissions = getPermissions(t);

  // Translate role names
  const getRoleDisplayName = (roleName: string): string => {
    const roleTranslations: Record<string, string> = {
      admin: t('vendor.team.roles.admin', { defaultValue: 'Admin' }),
      manager: t('vendor.team.roles.manager', { defaultValue: 'Manager' }),
      staff: t('vendor.team.roles.staff', { defaultValue: 'Staff' }),
      owner: t('vendor.team.roles.owner', { defaultValue: 'Owner' })
    };
    return roleTranslations[roleName.toLowerCase()] || roleName;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Data states
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [availableRoles, setAvailableRoles] = useState<TeamRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'staff',
    permissions: [] as string[],
    message: ''
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Fetch team data
  const fetchTeamData = useCallback(async () => {
    if (!shopId) {
      setError('Shop context not found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Ensure shop ID is set before making requests
      api.setShopId(shopId);

      const [membersData, invitationsData, rolesData] = await Promise.all([
        getVendorTeam(),
        getTeamInvitations(),
        getAvailableRoles()
      ]);

      setMembers(membersData);
      setInvitations(invitationsData);
      setAvailableRoles(rolesData);
    } catch (err: any) {
      console.error('Error fetching team data:', err);
      setError(err.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId && !shopsLoading) {
      fetchTeamData();
    }
  }, [fetchTeamData, shopId, shopsLoading]);

  const filteredMembers = members.filter((member) =>
    (member.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (member.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  );

  const filteredInvitations = invitations.filter((inv) =>
    inv.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.isActive).length;
  const pendingInvitations = invitations.length;
  const adminCount = members.filter(m => m.role === 'owner' || m.role === 'admin').length;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-5 h-5" />;
      case 'admin':
        return <ShieldCheck className="w-5 h-5" />;
      case 'manager':
        return <Shield className="w-5 h-5" />;
      case 'staff':
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'from-yellow-500 to-orange-500';
      case 'admin':
        return 'from-purple-500 to-pink-500';
      case 'manager':
        return 'from-blue-500 to-cyan-500';
      case 'staff':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'suspended':
      case 'inactive':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await inviteTeamMember({
        email: inviteForm.email,
        role: inviteForm.role,
        permissions: inviteForm.permissions,
        message: inviteForm.message || undefined
      });
      toast.success('Invitation sent successfully');
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'staff', permissions: [], message: '' });
      await fetchTeamData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    const confirmed = await dialog.showConfirm({
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${member.user?.name || member.user?.email} from the team? This action cannot be undone.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await removeTeamMember(member.id);
        toast.success('Team member removed');
        await fetchTeamData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to remove team member');
      }
    }
  };

  const handleCancelInvitation = async (invitation: TeamInvitation) => {
    const confirmed = await dialog.showConfirm({
      title: 'Cancel Invitation',
      message: `Are you sure you want to cancel the invitation to ${invitation.email}?`,
      confirmText: 'Cancel Invitation',
      cancelText: 'Keep',
      variant: 'danger'
    });

    if (confirmed) {
      try {
        await cancelInvitation(invitation.id);
        toast.success('Invitation cancelled');
        await fetchTeamData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to cancel invitation');
      }
    }
  };

  const handleResendInvitation = async (invitation: TeamInvitation) => {
    try {
      await resendInvitation(invitation.id);
      toast.success('Invitation resent successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend invitation');
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedMember) return;

    try {
      setSubmitting(true);
      await updateTeamMemberRole(selectedMember.id, {
        role: selectedMember.role,
        permissions: selectedPermissions
      });
      toast.success('Permissions updated successfully');
      setShowPermissionsModal(false);
      await fetchTeamData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update permissions');
    } finally {
      setSubmitting(false);
    }
  };

  const openPermissionsModal = (member: TeamMember) => {
    setSelectedMember(member);
    setSelectedPermissions(member.permissions || []);
    setShowPermissionsModal(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading || shopsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-lime animate-spin" />
      </div>
    );
  }

  // No shop context
  if (!shop?.id && !shopsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-yellow-400" />
        <p className="text-gray-500">{t('vendor.team.shopNotFound', { defaultValue: 'Shop not found. Please select a shop or create one.' })}</p>
        <button
          onClick={() => window.location.href = '/vendor/create-shop'}
          className="px-4 py-2 bg-primary-lime/10 hover:bg-primary-lime/20 rounded-lg text-primary-lime"
        >
          {t('vendor.team.createShop', { defaultValue: 'Create Shop' })}
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-500">{error}</p>
        <button
          onClick={fetchTeamData}
          className="px-4 py-2 bg-primary-lime/10 hover:bg-primary-lime/20 rounded-lg text-primary-lime flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('vendor.team.pageTitle', { defaultValue: 'Team Members' })}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('vendor.team.pageSubtitle', { defaultValue: 'Manage your team and permissions' })}
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-2 bg-primary-lime text-white rounded-xl font-medium hover:bg-primary-lime/90 transition-all shadow-lg flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{t('vendor.team.inviteMember', { defaultValue: 'Invite Member' })}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t('vendor.team.totalMembers', { defaultValue: 'Total Members' })}
          value={String(totalMembers)}
          icon={<User />}
          color="from-purple-400 to-pink-500"
        />
        <StatCard
          title={t('vendor.team.active', { defaultValue: 'Active' })}
          value={String(activeMembers)}
          icon={<Check />}
          color="from-green-400 to-emerald-500"
        />
        <StatCard
          title={t('vendor.team.pending', { defaultValue: 'Pending' })}
          value={String(pendingInvitations)}
          icon={<Clock />}
          color="from-yellow-400 to-orange-500"
        />
        <StatCard
          title={t('vendor.team.admins', { defaultValue: 'Admins' })}
          value={String(adminCount)}
          icon={<ShieldCheck />}
          color="from-blue-400 to-cyan-500"
        />
      </div>

      {/* Search */}
      <GlassCard hover={false}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('vendor.placeholders.searchTeamMembers')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 transition-all"
          />
        </div>
      </GlassCard>

      {/* Pending Invitations */}
      {filteredInvitations.length > 0 && (
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Mail className="w-5 h-5 text-yellow-400" />
            <span>{t('vendor.team.pendingInvitations', { defaultValue: 'Pending Invitations' })}</span>
          </h3>
          <div className="space-y-3">
            {filteredInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50"
              >
                <div>
                  <p className="text-gray-900 font-medium">{invitation.email}</p>
                  <p className="text-sm text-gray-500">
                    Role: <span className="capitalize">{invitation.role}</span> |
                    Expires: {formatDate(invitation.expiresAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleResendInvitation(invitation)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    title="Resend invitation"
                  >
                    <Send className="w-4 h-4 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleCancelInvitation(invitation)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    title="Cancel invitation"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard hover={true}>
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {member.user?.avatar ? (
                        <img
                          src={member.user.avatar}
                          alt={member.user?.name || 'Team member'}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">
                            {(member.user?.name || member.user?.email || 'U').charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${getRoleColor(member.role)} shadow-lg`}>
                        {getRoleIcon(member.role)}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.user?.name || member.user?.email?.split('@')[0] || 'Unknown'}
                      </h3>
                      <p className="text-xs text-gray-400">{member.user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.isActive ? 'active' : 'inactive'}
                  </span>
                </div>

                {/* Role Badge */}
                <div className={`p-3 rounded-xl bg-gradient-to-br ${getRoleColor(member.role)} bg-opacity-10`}>
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getRoleColor(member.role)}`}>
                      {getRoleIcon(member.role)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{member.role}</p>
                      <p className="text-xs text-gray-500">
                        {member.permissions?.includes('*') ? 'Full Access' : `${member.permissions?.length || 0} permissions`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Joined</p>
                    <p className="text-gray-900">{formatDate(member.joinedAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Updated</p>
                    <p className="text-gray-900">{formatDate(member.updatedAt)}</p>
                  </div>
                </div>

                {/* Permissions Preview */}
                {member.role !== 'owner' && !member.permissions?.includes('*') && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-2">
                      {(member.permissions || []).slice(0, 3).map((perm) => (
                        <span key={perm} className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {(member.permissions?.length || 0) > 3 && (
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-600">
                          +{(member.permissions?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {member.role !== 'owner' && (
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => openPermissionsModal(member)}
                      className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-700">Permissions</span>
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {filteredMembers.length === 0 && !loading && (
        <GlassCard hover={false}>
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No team members found</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="mt-4 px-4 py-2 bg-primary-lime/10 hover:bg-primary-lime/20 rounded-lg text-primary-lime"
            >
              Invite your first team member
            </button>
          </div>
        </GlassCard>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowInviteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard hover={false}>
                <form onSubmit={handleInvite} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{t('vendor.team.inviteTeamMember', { defaultValue: 'Invite Team Member' })}</h2>
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.team.emailAddressLabel', { defaultValue: 'Email Address *' })}</label>
                    <input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50"
                      placeholder={t('vendor.placeholders.teamMemberEmail')}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.team.roleLabel', { defaultValue: 'Role *' })}</label>
                    <div className="grid grid-cols-3 gap-3">
                      {availableRoles.map((role) => (
                        <button
                          key={role.name}
                          type="button"
                          onClick={() => setInviteForm({ ...inviteForm, role: role.name })}
                          className={`p-4 bg-gray-100 rounded-xl transition-all flex flex-col items-center space-y-2 ${
                            inviteForm.role === role.name ? 'bg-primary-lime/10 border-primary-lime/30 ring-2 ring-primary-lime/50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${getRoleColor(role.name)}`}>
                            {getRoleIcon(role.name)}
                          </div>
                          <span className="text-gray-900 capitalize">{getRoleDisplayName(role.name)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.team.permissionsLabel', { defaultValue: 'Permissions' })}</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {allPermissions.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-start space-x-3 p-3 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={inviteForm.permissions.includes(perm.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setInviteForm({
                                  ...inviteForm,
                                  permissions: [...inviteForm.permissions, perm.id]
                                });
                              } else {
                                setInviteForm({
                                  ...inviteForm,
                                  permissions: inviteForm.permissions.filter((p) => p !== perm.id)
                                });
                              }
                            }}
                            className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 mt-0.5 accent-primary-lime"
                          />
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium">{perm.label}</p>
                            <p className="text-xs text-gray-500">{perm.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 mb-2 block">{t('vendor.team.personalMessage', { defaultValue: 'Personal Message (optional)' })}</label>
                    <textarea
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-lime/50 resize-none"
                      placeholder={t('vendor.placeholders.invitationMessage')}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                      disabled={submitting}
                    >
                      {t('vendor.team.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-primary-lime text-white rounded-xl font-medium hover:bg-primary-lime/90 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Mail className="w-5 h-5" />
                      )}
                      <span>{submitting ? t('vendor.team.sending', { defaultValue: 'Sending...' }) : t('vendor.team.sendInvitation', { defaultValue: 'Send Invitation' })}</span>
                    </button>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Permissions Modal */}
      <AnimatePresence>
        {showPermissionsModal && selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowPermissionsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard hover={false}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Manage Permissions</h2>
                      <p className="text-gray-500 mt-1">
                        {selectedMember.user?.name || selectedMember.user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPermissionsModal(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {allPermissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex items-start space-x-3 p-4 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-all"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPermissions([...selectedPermissions, perm.id]);
                            } else {
                              setSelectedPermissions(selectedPermissions.filter(p => p !== perm.id));
                            }
                          }}
                          className="w-5 h-5 rounded bg-gray-100 border-2 border-gray-300 mt-0.5 accent-primary-lime"
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">{perm.label}</p>
                          <p className="text-xs text-gray-500">{perm.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowPermissionsModal(false)}
                      className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all"
                      disabled={submitting}
                    >
                      {t('vendor.team.cancel', { defaultValue: 'Cancel' })}
                    </button>
                    <button
                      onClick={handleUpdatePermissions}
                      disabled={submitting}
                      className="px-6 py-2 bg-primary-lime text-white rounded-xl font-medium hover:bg-primary-lime/90 transition-all shadow-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      <span>{submitting ? t('vendor.team.updating', { defaultValue: 'Updating...' }) : t('vendor.team.updatePermissions', { defaultValue: 'Update Permissions' })}</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dialog Components */}
      <ConfirmDialog {...dialog.confirmDialog} />
      <AlertDialog {...dialog.alertDialog} />
    </motion.div>
  );
};
