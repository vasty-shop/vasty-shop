// ============================================
// Delivery Man Types
// ============================================

export type DeliveryManStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED';
export type AvailabilityStatus = 'ONLINE' | 'ON_DELIVERY';
export type DeliveryOrderStatus = 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';

export interface DeliveryMan {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  status: DeliveryManStatus;
  availability: AvailabilityStatus;
  currentLocation?: {
    lat: number;
    lng: number;
    address?: string;
  };
  zoneId?: string;
  zoneName?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  identityType?: string;
  identityNumber?: string;
  identityImages?: string[];
  rating: number;
  totalReviews: number;
  totalDeliveries: number;
  totalEarnings: number;
  pendingEarnings: number;
  cashInHand: number;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOrder {
  id: string;
  orderId: string;
  orderNumber: string;
  deliveryManId: string;
  status: DeliveryOrderStatus;
  pickupAddress: {
    address: string;
    lat: number;
    lng: number;
    shopName?: string;
    contactPhone?: string;
  };
  deliveryAddress: {
    address: string;
    lat: number;
    lng: number;
    customerName: string;
    customerPhone: string;
  };
  distance?: number;
  estimatedTime?: number;
  deliveryFee: number;
  tip?: number;
  notes?: string;
  proofOfDelivery?: string;
  assignedAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  pendingEarnings: number;
  withdrawnAmount?: number;
  cashInHand: number;
  todayEarnings?: number;
  weekEarnings?: number;
  monthEarnings?: number;
  totalDeliveries?: number;
  todayDeliveries?: number;
  averagePerDelivery?: number;
  // From API response
  periodEarnings?: number;
  periodDeliveries?: number;
  recentWithdrawals?: any[];
}

export interface EarningsTransaction {
  id: string;
  type: 'DELIVERY_FEE' | 'TIP' | 'BONUS' | 'WITHDRAWAL' | 'ADJUSTMENT';
  amount: number;
  orderId?: string;
  orderNumber?: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface DeliveryReview {
  id: string;
  deliveryManId: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface DeliveryStats {
  totalDeliveries: number;
  todayDeliveries: number;
  weekDeliveries: number;
  completedDeliveries: number;
  cancelledDeliveries: number;
  averageDeliveryTime: number;
  averageRating: number;
  totalEarnings: number;
  todayEarnings: number;
  pendingOrders: number;
  ongoingOrders: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'EARNING' | 'SYSTEM' | 'PROMOTION';
  read: boolean;
  createdAt: string;
  data?: Record<string, any>;
}

export interface DeliverySettings {
  autoAcceptOrders: boolean;
  maxOrdersPerTime: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  preferredZones: string[];
  workingHours: {
    start: string;
    end: string;
  };
}
