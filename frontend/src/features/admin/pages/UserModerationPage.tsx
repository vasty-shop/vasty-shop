import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Shield,
  X,
  User as UserIcon,
  Edit,
  Ban,
  CheckCircle,
  Trash2,
  Store,
  Star,
  Loader2,
  AlertCircle,
  UserCog,
  Activity,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { api, User } from '../../../lib/api';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

interface UserWithDetails extends User {
  totalOrders?: number;
  totalSpent?: number;
  reviewsCount?: number;
  shopsCount?: number;
  status?: 'active' | 'suspended' | 'banned';
  lastLoginAt?: string;
  isSuspended?: boolean;
  isDeleted?: boolean;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  customers: number;
  vendors: number;
  admins: number;
  suspendedUsers: number;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
}

interface ShopSummary {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export const UserModerationPage: React.FC = () => {
  const { t } = useTranslation();
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'email'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Data
  const [users, setUsers] = useState<UserWithDetails[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    customers: 0,
    vendors: 0,
    admins: 0,
    suspendedUsers: 0
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null);
  const [userOrders, setUserOrders] = useState<OrderSummary[]>([]);
  const [userShops, setUserShops] = useState<ShopSummary[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'warning'
  });

  // Bulk actions
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  const roles = ['all', 'customer', 'vendor', 'admin'];
  const statuses = ['all', 'active', 'suspended', 'banned'];

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedRole, selectedStatus, page, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: any = {
        page,
        limit,
        sortBy,
        sortOrder
      };

      if (searchQuery) params.search = searchQuery;
      if (selectedRole !== 'all') params.role = selectedRole;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const response = await api.getAdminUsers(params);

      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);

      // Calculate stats from response or use provided stats
      if (response.stats) {
        setStats(response.stats);
      } else {
        calculateStats(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to fetch users');
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (usersData: UserWithDetails[]) => {
    const stats: UserStats = {
      totalUsers: usersData.length,
      activeUsers: usersData.filter(u => u.status === 'active' || u.isActive).length,
      customers: usersData.filter(u => u.role === 'customer').length,
      vendors: usersData.filter(u => u.role === 'vendor').length,
      admins: usersData.filter(u => u.role === 'admin').length,
      suspendedUsers: usersData.filter(u => u.status === 'suspended' || u.isSuspended).length
    };
    setStats(stats);
  };

  const handleViewDetails = async (user: UserWithDetails) => {
    setSelectedUser(user);
    setUserOrders([]);
    setUserShops([]);
    setShowDetailsModal(true);
    setLoadingDetails(true);

    try {
      // Fetch user's orders
      if (user.role === 'customer' || user.role === 'vendor') {
        const ordersResponse = await api.getAdminUserOrders(user.id);
        setUserOrders(ordersResponse.data?.slice(0, 5) || []);
      }

      // Fetch user's shops if vendor
      if (user.role === 'vendor') {
        const shopsResponse = await api.getAdminUserShops(user.id);
        setUserShops(shopsResponse.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleChangeRole = (userId: string, currentRole: string) => {
    const newRole = currentRole === 'customer' ? 'vendor' : 'customer';

    setConfirmDialog({
      isOpen: true,
      title: t('admin.users.changeUserRole'),
      message: t('admin.users.changeRoleConfirm', { from: currentRole, to: newRole }),
      variant: 'info',
      onConfirm: async () => {
        try {
          await api.updateAdminUserRole(userId, newRole);
          toast.success(t('admin.users.roleChanged', { role: newRole }));
          fetchUsers();
          if (selectedUser?.id === userId) {
            setShowDetailsModal(false);
          }
        } catch (err: any) {
          console.error('Failed to change user role:', err);
          toast.error(err.response?.data?.message || t('admin.users.failedChangeRole'));
        }
      }
    });
  };

  const handleSuspendUser = (userId: string, isSuspended: boolean) => {
    const action = isSuspended ? 'activate' : 'suspend';

    setConfirmDialog({
      isOpen: true,
      title: action === 'suspend' ? t('admin.users.suspendUserTitle') : t('admin.users.activateUserTitle'),
      message: action === 'suspend' ? t('admin.users.suspendConfirm') : t('admin.users.activateConfirm'),
      variant: action === 'suspend' ? 'warning' : 'info',
      onConfirm: async () => {
        try {
          await api.updateAdminUserStatus(userId, isSuspended ? 'active' : 'suspended');
          toast.success(action === 'suspend' ? t('admin.users.userSuspended') : t('admin.users.userActivated'));
          fetchUsers();
          if (selectedUser?.id === userId) {
            setShowDetailsModal(false);
          }
        } catch (err: any) {
          console.error(`Failed to ${action} user:`, err);
          toast.error(err.response?.data?.message || (action === 'suspend' ? t('admin.users.failedSuspend') : t('admin.users.failedActivate')));
        }
      }
    });
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: t('admin.users.deleteUserTitle'),
      message: t('admin.users.deleteConfirm', { name: userName }),
      variant: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAdminUser(userId);
          toast.success(t('admin.users.userDeleted'));
          fetchUsers();
          if (selectedUser?.id === userId) {
            setShowDetailsModal(false);
          }
        } catch (err: any) {
          console.error('Failed to delete user:', err);
          toast.error(err.response?.data?.message || t('admin.users.failedDelete'));
        }
      }
    });
  };

  const handleBulkAction = (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedUserIds.size === 0) {
      toast.error(t('admin.users.selectFirst'));
      return;
    }

    const actionText = action === 'delete' ? 'delete' : action;

    setConfirmDialog({
      isOpen: true,
      title: t('admin.users.bulkAction', { action: actionText.charAt(0).toUpperCase() + actionText.slice(1) }),
      message: t('admin.users.bulkConfirm', { action: actionText, count: selectedUserIds.size }),
      variant: action === 'delete' ? 'danger' : 'warning',
      onConfirm: async () => {
        try {
          await api.bulkActionAdminUsers(Array.from(selectedUserIds), action);
          toast.success(t('admin.users.bulkSuccess', { action: actionText, count: selectedUserIds.size }));
          setSelectedUserIds(new Set());
          fetchUsers();
        } catch (err: any) {
          console.error('Failed to perform bulk action:', err);
          toast.error(err.response?.data?.message || t('admin.users.failedBulk'));
        }
      }
    });
  };

  const handleExportUsers = async () => {
    try {
      const blob = await api.exportAdminUsers({
        role: selectedRole !== 'all' ? selectedRole : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        search: searchQuery || undefined
      });

      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(t('admin.users.exportSuccess'));
    } catch (err) {
      console.error('Failed to export users:', err);
      toast.error(t('admin.users.exportFailed'));
    }
  };

  const handleSelectAll = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    }
  };

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const getStatusColor = (user: UserWithDetails) => {
    const status = user.status || (user.isActive ? 'active' : 'inactive');
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-100';
      case 'banned':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-indigo-600 bg-indigo-100';
      case 'vendor':
        return 'text-blue-600 bg-blue-100';
      case 'customer':
        return 'text-cyan-600 bg-cyan-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'vendor':
        return <Store className="w-4 h-4" />;
      case 'customer':
        return <UserIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('admin.users.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('admin.users.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedUserIds.size > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl transition-all flex items-center space-x-2"
              >
                <Ban className="w-4 h-4" />
                <span>{t('admin.users.suspendUser')} ({selectedUserIds.size})</span>
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl transition-all flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('admin.users.deleteUser')} ({selectedUserIds.size})</span>
              </button>
            </>
          )}
          <button
            onClick={handleExportUsers}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all flex items-center space-x-2 text-gray-700"
          >
            <Download className="w-5 h-5" />
            <span>{t('admin.common.export')}</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <UserIcon className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500">{t('admin.users.totalUsers')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-xs text-gray-500">{t('admin.users.active')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <UserIcon className="w-8 h-8 text-cyan-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.customers}</p>
              <p className="text-xs text-gray-500">{t('admin.users.customers')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.vendors}</p>
              <p className="text-xs text-gray-500">{t('admin.users.vendors')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              <p className="text-xs text-gray-500">{t('admin.users.admins')}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-white border border-gray-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <Ban className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.suspendedUsers}</p>
              <p className="text-xs text-gray-500">{t('admin.users.suspended')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.users.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {roles.map((role) => (
                <option key={role} value={role} className="bg-white">
                  {t(`admin.users.${role}`)}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {statuses.map((status) => (
                <option key={status} value={status} className="bg-white">
                  {t(`admin.users.${status}`)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="createdAt" className="bg-white">{t('admin.users.sortByDate')}</option>
              <option value="name" className="bg-white">{t('admin.users.sortByName')}</option>
              <option value="email" className="bg-white">{t('admin.users.sortByEmail')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-center text-center">
            <div className="space-y-3">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <p className="text-gray-900 font-medium">{t('admin.users.failedToLoad')}</p>
              <p className="text-gray-500 text-sm">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700"
              >
                {t('admin.users.retry')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl p-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && users.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12">
          <div className="flex items-center justify-center text-center">
            <div className="space-y-3">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-gray-900 font-medium">{t('admin.users.noUsers')}</p>
              <p className="text-gray-500 text-sm">
                {searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
                  ? t('admin.users.tryAdjusting')
                  : t('admin.users.noUsersAvailable')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !error && users.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUserIds.size === users.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 bg-white text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.users.userName')}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.users.email')}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.users.role')}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.users.status')}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.users.totalOrders')}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.users.joinDate')}</th>
                  <th className="text-left p-4 text-sm text-gray-500 font-medium">{t('admin.common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUserIds.has(user.id)}
                        onChange={() => handleToggleUser(user.id)}
                        className="w-4 h-4 rounded border-gray-300 bg-white text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name || t('admin.users.unnamedUser')}</p>
                          <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(user)}`}>
                        {user.status || (user.isActive ? 'active' : 'inactive')}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-sm text-gray-600">
                        {user.totalOrders !== undefined && (
                          <div className="flex items-center space-x-1">
                            <ShoppingBag className="w-3 h-3" />
                            <span>{user.totalOrders} {t('admin.users.orders')}</span>
                          </div>
                        )}
                        {user.reviewsCount !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{user.reviewsCount} {t('admin.users.reviews')}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                          title={t('admin.users.viewDetails')}
                        >
                          <Eye className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => handleChangeRole(user.id, user.role)}
                          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                          title={t('admin.users.changeRole')}
                        >
                          <UserCog className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleSuspendUser(user.id, user.status === 'suspended' || user.isSuspended || false)}
                          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                          title={user.status === 'suspended' ? t('admin.users.activate') : t('admin.users.suspend')}
                        >
                          {user.status === 'suspended' || user.isSuspended ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Ban className="w-4 h-4 text-yellow-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                          title={t('admin.users.deleteUser')}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500">
                {t('admin.users.pageOf', { current: page, total: totalPages })}
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDetailsModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl">
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                        {selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name || t('admin.users.unnamedUser')}</h2>
                        <p className="text-gray-500">{selectedUser.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium capitalize ${getRoleColor(selectedUser.role)}`}>
                            {getRoleIcon(selectedUser.role)}
                            <span>{selectedUser.role}</span>
                          </span>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${getStatusColor(selectedUser)}`}>
                            {selectedUser.status || (selectedUser.isActive ? 'active' : 'inactive')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-gray-500 mb-2">
                        <ShoppingBag className="w-4 h-4" />
                        <span className="text-sm">{t('admin.users.totalOrders')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedUser.totalOrders || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-gray-500 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-sm">{t('admin.users.totalSpent')}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ${selectedUser.totalSpent?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-gray-500 mb-2">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">{t('common.reviews')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedUser.reviewsCount || 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-gray-500 mb-2">
                        <Store className="w-4 h-4" />
                        <span className="text-sm">{t('admin.users.shops')}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{selectedUser.shopsCount || userShops.length || 0}</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.users.contactInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <Mail className="w-5 h-5 text-indigo-600" />
                        <div>
                          <p className="text-xs text-gray-500">{t('admin.users.email')}</p>
                          <p className="text-gray-900">{selectedUser.email}</p>
                        </div>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Phone className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-500">{t('admin.users.phone')}</p>
                            <p className="text-gray-900">{selectedUser.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-500">{t('admin.users.joined')}</p>
                          <p className="text-gray-900">
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {selectedUser.lastLoginAt && (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Activity className="w-5 h-5 text-cyan-600" />
                          <div>
                            <p className="text-xs text-gray-500">{t('admin.users.lastLogin')}</p>
                            <p className="text-gray-900">
                              {new Date(selectedUser.lastLoginAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Shops (if vendor) */}
                  {selectedUser.role === 'vendor' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.users.shops')}</h3>
                      <div className="space-y-3">
                        {loadingDetails ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          </div>
                        ) : userShops.length === 0 ? (
                          <div className="p-4 bg-gray-50 rounded-xl text-center">
                            <Store className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">{t('admin.users.noShopsFound')}</p>
                          </div>
                        ) : (
                          userShops.map((shop) => (
                            <div key={shop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                              <div className="flex items-center space-x-3">
                                <Store className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{shop.name}</p>
                                  <p className="text-xs text-gray-500">{shop.slug}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                                shop.status === 'active' ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                              }`}>
                                {shop.status}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Orders */}
                  {(selectedUser.role === 'customer' || selectedUser.role === 'vendor') && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('admin.users.recentOrders')}</h3>
                      <div className="space-y-3">
                        {loadingDetails ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                          </div>
                        ) : userOrders.length === 0 ? (
                          <div className="p-4 bg-gray-50 rounded-xl text-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">{t('admin.users.noOrdersFound')}</p>
                          </div>
                        ) : (
                          userOrders.map((order) => (
                            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                              <div className="flex items-center space-x-3">
                                <ShoppingBag className="w-5 h-5 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                                <p className={`text-xs capitalize ${
                                  order.status === 'completed' || order.status === 'delivered'
                                    ? 'text-green-600'
                                    : order.status === 'cancelled'
                                    ? 'text-red-600'
                                    : 'text-yellow-600'
                                }`}>
                                  {order.status}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleChangeRole(selectedUser.id, selectedUser.role)}
                      className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <UserCog className="w-4 h-4" />
                      <span>{t('admin.users.changeRole')}</span>
                    </button>
                    <button
                      onClick={() => handleSuspendUser(selectedUser.id, selectedUser.status === 'suspended' || selectedUser.isSuspended || false)}
                      className={`flex-1 px-4 py-2 rounded-xl transition-all flex items-center justify-center space-x-2 ${
                        selectedUser.status === 'suspended' || selectedUser.isSuspended
                          ? 'bg-green-50 hover:bg-green-100 border border-green-200 text-green-600'
                          : 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-600'
                      }`}
                    >
                      {selectedUser.status === 'suspended' || selectedUser.isSuspended ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>{t('admin.users.activate')}</span>
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" />
                          <span>{t('admin.users.suspend')}</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(selectedUser.id, selectedUser.name || selectedUser.email)}
                      className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl transition-all flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{t('admin.users.delete')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={t('admin.users.confirm')}
        cancelText={t('admin.users.cancel')}
      />
    </motion.div>
  );
};
