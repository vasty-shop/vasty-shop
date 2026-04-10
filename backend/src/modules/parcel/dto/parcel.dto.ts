import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsObject, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================
// ENUMS
// ============================================

export enum ParcelStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  FAILED = 'failed',
}

export enum ParcelCategory {
  DOCUMENT = 'document',
  SMALL_PACKAGE = 'small_package',
  MEDIUM_PACKAGE = 'medium_package',
  LARGE_PACKAGE = 'large_package',
  FRAGILE = 'fragile',
  ELECTRONICS = 'electronics',
  FOOD = 'food',
  MEDICINE = 'medicine',
  OTHER = 'other',
}

export enum DeliveryType {
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day',
  EXPRESS = 'express',
  STANDARD = 'standard',
  SCHEDULED = 'scheduled',
}

export enum PaymentMethod {
  PREPAID = 'prepaid',
  COD = 'cod', // Cash on delivery
  SENDER_PAYS = 'sender_pays',
  RECEIVER_PAYS = 'receiver_pays',
}

// ============================================
// DTOs
// ============================================

export class AddressDto {
  @ApiProperty({ description: 'Contact name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ description: 'Street address' })
  @IsString()
  street: string;

  @ApiPropertyOptional({ description: 'Apartment/Unit' })
  @IsString()
  @IsOptional()
  apartment?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Latitude' })
  @IsNumber()
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ description: 'Longitude' })
  @IsNumber()
  @IsOptional()
  lng?: number;

  @ApiPropertyOptional({ description: 'Delivery instructions' })
  @IsString()
  @IsOptional()
  instructions?: string;
}

export class CreateParcelDto {
  @ApiProperty({ description: 'Sender address', type: AddressDto })
  @IsObject()
  senderAddress: AddressDto;

  @ApiProperty({ description: 'Receiver address', type: AddressDto })
  @IsObject()
  receiverAddress: AddressDto;

  @ApiProperty({ enum: ParcelCategory })
  @IsEnum(ParcelCategory)
  category: ParcelCategory;

  @ApiPropertyOptional({ description: 'Parcel description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Weight in kg' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Dimensions (cm)' })
  @IsObject()
  @IsOptional()
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiPropertyOptional({ description: 'Declared value for insurance' })
  @IsNumber()
  @IsOptional()
  declaredValue?: number;

  @ApiProperty({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiPropertyOptional({ description: 'Scheduled pickup time' })
  @IsString()
  @IsOptional()
  scheduledPickupTime?: string;

  @ApiPropertyOptional({ description: 'Scheduled delivery time' })
  @IsString()
  @IsOptional()
  scheduledDeliveryTime?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'COD amount if payment is COD' })
  @IsNumber()
  @IsOptional()
  codAmount?: number;

  @ApiPropertyOptional({ description: 'Special instructions' })
  @IsString()
  @IsOptional()
  specialInstructions?: string;

  @ApiPropertyOptional({ description: 'Is fragile' })
  @IsBoolean()
  @IsOptional()
  isFragile?: boolean;

  @ApiPropertyOptional({ description: 'Requires signature' })
  @IsBoolean()
  @IsOptional()
  requiresSignature?: boolean;

  @ApiPropertyOptional({ description: 'Insurance required' })
  @IsBoolean()
  @IsOptional()
  insuranceRequired?: boolean;
}

export class UpdateParcelStatusDto {
  @ApiProperty({ enum: ParcelStatus })
  @IsEnum(ParcelStatus)
  status: ParcelStatus;

  @ApiPropertyOptional({ description: 'Status note' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiPropertyOptional({ description: 'Location of status update' })
  @IsObject()
  @IsOptional()
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };

  @ApiPropertyOptional({ description: 'Proof image URL' })
  @IsString()
  @IsOptional()
  proofImageUrl?: string;

  @ApiPropertyOptional({ description: 'Signature URL' })
  @IsString()
  @IsOptional()
  signatureUrl?: string;

  @ApiPropertyOptional({ description: 'Recipient name if delivered' })
  @IsString()
  @IsOptional()
  recipientName?: string;
}

export class CalculateShippingDto {
  @ApiProperty({ description: 'Origin postal code or coordinates' })
  @IsObject()
  origin: {
    postalCode?: string;
    lat?: number;
    lng?: number;
  };

  @ApiProperty({ description: 'Destination postal code or coordinates' })
  @IsObject()
  destination: {
    postalCode?: string;
    lat?: number;
    lng?: number;
  };

  @ApiPropertyOptional({ description: 'Weight in kg' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Dimensions (cm)' })
  @IsObject()
  @IsOptional()
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiPropertyOptional({ enum: ParcelCategory })
  @IsEnum(ParcelCategory)
  @IsOptional()
  category?: ParcelCategory;
}

export class ConfigureParcelCategoryDto {
  @ApiProperty({ enum: ParcelCategory })
  @IsEnum(ParcelCategory)
  category: ParcelCategory;

  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Base price' })
  @IsNumber()
  @IsOptional()
  basePrice?: number;

  @ApiPropertyOptional({ description: 'Price per kg' })
  @IsNumber()
  @IsOptional()
  pricePerKg?: number;

  @ApiPropertyOptional({ description: 'Price per km' })
  @IsNumber()
  @IsOptional()
  pricePerKm?: number;

  @ApiPropertyOptional({ description: 'Maximum weight (kg)' })
  @IsNumber()
  @IsOptional()
  maxWeight?: number;

  @ApiPropertyOptional({ description: 'Maximum dimensions (cm)' })
  @IsObject()
  @IsOptional()
  maxDimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ConfigureDeliveryTypeDto {
  @ApiProperty({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Estimated delivery time (hours)' })
  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @ApiPropertyOptional({ description: 'Additional price multiplier' })
  @IsNumber()
  @IsOptional()
  priceMultiplier?: number;

  @ApiPropertyOptional({ description: 'Fixed additional fee' })
  @IsNumber()
  @IsOptional()
  additionalFee?: number;

  @ApiPropertyOptional({ description: 'Is available' })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: 'Available hours (e.g., "09:00-21:00")' })
  @IsString()
  @IsOptional()
  availableHours?: string;
}

export class QueryParcelsDto {
  @ApiPropertyOptional({ description: 'Page number' })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ enum: ParcelStatus })
  @IsEnum(ParcelStatus)
  @IsOptional()
  status?: ParcelStatus;

  @ApiPropertyOptional({ enum: ParcelCategory })
  @IsEnum(ParcelCategory)
  @IsOptional()
  category?: ParcelCategory;

  @ApiPropertyOptional({ description: 'User ID (sender)' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Delivery man ID' })
  @IsString()
  @IsOptional()
  deliveryManId?: string;

  @ApiPropertyOptional({ description: 'Search by tracking number' })
  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsString()
  @IsOptional()
  endDate?: string;
}

export class BulkStatusUpdateDto {
  @ApiProperty({ description: 'Parcel IDs' })
  @IsArray()
  parcelIds: string[];

  @ApiProperty({ enum: ParcelStatus })
  @IsEnum(ParcelStatus)
  status: ParcelStatus;

  @ApiPropertyOptional({ description: 'Status note' })
  @IsString()
  @IsOptional()
  note?: string;
}
