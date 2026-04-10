import React from 'react';
import { useVendorAuthStore } from '@/stores/useVendorAuthStore';
import { Package, ShoppingCart, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * Vendor Dashboard Page
 * Main dashboard view for vendors
 */
export const VendorDashboardPage: React.FC = () => {
  const { vendor, shop } = useVendorAuthStore();

  const stats = [
    {
      name: 'Total Products',
      value: shop?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Total Orders',
      value: shop?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Sales',
      value: `$${shop?.totalSales?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Shop Rating',
      value: shop?.rating?.toFixed(1) || '0.0',
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {vendor?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with {shop?.name} today.
        </p>
      </div>

      {/* Shop Status Alert */}
      {shop?.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Shop Pending Approval</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Your shop is currently under review. You'll be able to start selling once approved by our team.
            </p>
          </div>
        </div>
      )}

      {shop?.status === 'suspended' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Shop Suspended</h3>
            <p className="text-sm text-red-800 mt-1">
              Your shop has been suspended. Please contact support for more information.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-lime hover:bg-primary-lime/5 transition-colors text-left">
            <Package className="w-6 h-6 text-primary-lime mb-2" />
            <h3 className="font-semibold text-gray-900">Add Product</h3>
            <p className="text-sm text-gray-600">Create a new product listing</p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-lime hover:bg-primary-lime/5 transition-colors text-left">
            <ShoppingCart className="w-6 h-6 text-primary-lime mb-2" />
            <h3 className="font-semibold text-gray-900">View Orders</h3>
            <p className="text-sm text-gray-600">Manage your customer orders</p>
          </button>

          <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-lime hover:bg-primary-lime/5 transition-colors text-left">
            <TrendingUp className="w-6 h-6 text-primary-lime mb-2" />
            <h3 className="font-semibold text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-600">Check your shop performance</p>
          </button>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboardPage;
