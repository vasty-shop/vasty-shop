import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// ENUMS
// ============================================

export enum DeliveryManStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum DeliveryManType {
  FREELANCER = 'freelancer',
  SALARIED = 'salaried',
}

export enum VehicleType {
  BICYCLE = 'bicycle',
  MOTORCYCLE = 'motorcycle',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck',
  SCOOTER = 'scooter',
  WALK = 'walk',
}

export enum DeliveryManAvailability {
  ONLINE = 'online',
  ON_DELIVERY = 'on_delivery',
}

// ============================================
// DTOs
// ============================================

export class RegisterDeliveryManDto {
  @ApiProperty({ description: 'Full name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email address' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Password for account' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ enum: DeliveryManType })
  @IsEnum(DeliveryManType)
  @IsOptional()
  type?: DeliveryManType;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

  @ApiPropertyOptional({ description: 'Vehicle number/plate' })
  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Identity type (passport, license, etc)' })
  @IsString()
  @IsOptional()
  identityType?: string;

  @ApiPropertyOptional({ description: 'Identity number' })
  @IsString()
  @IsOptional()
  identityNumber?: string;

  @ApiPropertyOptional({ description: 'Identity document images' })
  @IsArray()
  @IsOptional()
  identityImages?: string[];

  @ApiPropertyOptional({ description: 'Zone ID to operate in' })
  @IsString()
  @IsOptional()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsObject()
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export class UpdateDeliveryManDto {
  @ApiPropertyOptional({ description: 'Full name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: DeliveryManType })
  @IsEnum(DeliveryManType)
  @IsOptional()
  type?: DeliveryManType;

  @ApiPropertyOptional({ enum: VehicleType })
  @IsEnum(VehicleType)
  @IsOptional()
  vehicleType?: VehicleType;

  @ApiPropertyOptional({ description: 'Vehicle number/plate' })
  @IsString()
  @IsOptional()
  vehicleNumber?: string;

  @ApiPropertyOptional({ description: 'Profile image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Zone ID' })
  @IsString()
  @IsOptional()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Minimum delivery distance (km)' })
  @IsNumber()
  @IsOptional()
  minDeliveryDistance?: number;

  @ApiPropertyOptional({ description: 'Maximum delivery distance (km)' })
  @IsNumber()
  @IsOptional()
  maxDeliveryDistance?: number;

  @ApiPropertyOptional({ description: 'Address' })
  @IsObject()
  @IsOptional()
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export class UpdateDeliveryManStatusDto {
  @ApiProperty({ enum: DeliveryManStatus })
  @IsEnum(DeliveryManStatus)
  status: DeliveryManStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateAvailabilityDto {
  @ApiProperty({ enum: DeliveryManAvailability })
  @IsEnum(DeliveryManAvailability)
  availability: DeliveryManAvailability;

  @ApiPropertyOptional({ description: 'Current location' })
  @IsObject()
  @IsOptional()
  location?: {
    lat: number;
    lng: number;
  };
}

export class UpdateLocationDto {
  @ApiProperty({ description: 'Latitude' })
  @IsNumber()
  lat: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNumber()
  lng: number;

  @ApiPropertyOptional({ description: 'Heading/direction (0-360)' })
  @IsNumber()
  @IsOptional()
  heading?: number;

  @ApiPropertyOptional({ description: 'Speed in km/h' })
  @IsNumber()
  @IsOptional()
  speed?: number;
}

export class AssignOrderDto {
  @ApiProperty({ description: 'Order ID to assign' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Delivery man ID' })
  @IsString()
  deliveryManId: string;

  @ApiPropertyOptional({ description: 'Assignment note' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Delivery fee for this order (paid to delivery person)', example: 5.00 })
  @IsNumber()
  @IsOptional()
  deliveryFee?: number;
}

export class AcceptOrderDto {
  @ApiProperty({ description: 'Order ID to accept' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'Estimated pickup time (minutes)' })
  @IsNumber()
  @IsOptional()
  estimatedPickupTime?: number;
}

export class RejectOrderDto {
  @ApiProperty({ description: 'Order ID to reject' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: 'Reason for rejection' })
  @IsString()
  reason: string;
}

export class CompleteDeliveryDto {
  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: 'Delivery proof image URL' })
  @IsString()
  @IsOptional()
  proofImageUrl?: string;

  @ApiPropertyOptional({ description: 'Customer signature URL' })
  @IsString()
  @IsOptional()
  signatureUrl?: string;

  @ApiPropertyOptional({ description: 'Delivery notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Recipient name if different' })
  @IsString()
  @IsOptional()
  recipientName?: string;
}

export class ConfigureDeliveryManSettingsDto {
  @ApiPropertyOptional({ description: 'Allow self registration' })
  @IsBoolean()
  @IsOptional()
  allowSelfRegistration?: boolean;

  @ApiPropertyOptional({ description: 'Require admin approval' })
  @IsBoolean()
  @IsOptional()
  requireApproval?: boolean;

  @ApiPropertyOptional({ description: 'Default commission per delivery (%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  defaultCommissionPercent?: number;

  @ApiPropertyOptional({ description: 'Fixed commission per delivery' })
  @IsNumber()
  @IsOptional()
  fixedCommissionAmount?: number;

  @ApiPropertyOptional({ description: 'Minimum cash in hand before collection' })
  @IsNumber()
  @IsOptional()
  minCashInHand?: number;

  @ApiPropertyOptional({ description: 'Auto-assign orders to nearest delivery man' })
  @IsBoolean()
  @IsOptional()
  autoAssign?: boolean;

  @ApiPropertyOptional({ description: 'Maximum auto-assign distance (km)' })
  @IsNumber()
  @IsOptional()
  maxAutoAssignDistance?: number;

  @ApiPropertyOptional({ description: 'Order acceptance timeout (seconds)' })
  @IsNumber()
  @IsOptional()
  acceptanceTimeout?: number;
}

export class DeliveryManReviewDto {
  @ApiProperty({ description: 'Rating (1-5)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Review comment' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'Order ID' })
  @IsString()
  orderId: string;
}

export class WithdrawEarningsDto {
  @ApiProperty({ description: 'Amount to withdraw' })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Payment method' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Payment details' })
  @IsObject()
  @IsOptional()
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    routingNumber?: string;
  };
}

export class QueryDeliveryMenDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: DeliveryManStatus })
  @IsEnum(DeliveryManStatus)
  @IsOptional()
  status?: DeliveryManStatus;

  @ApiPropertyOptional({ enum: DeliveryManAvailability })
  @IsEnum(DeliveryManAvailability)
  @IsOptional()
  availability?: DeliveryManAvailability;

  @ApiPropertyOptional({ enum: DeliveryManType })
  @IsEnum(DeliveryManType)
  @IsOptional()
  type?: DeliveryManType;

  @ApiPropertyOptional({ description: 'Zone ID' })
  @IsString()
  @IsOptional()
  zoneId?: string;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsString()
  @IsOptional()
  search?: string;
}
