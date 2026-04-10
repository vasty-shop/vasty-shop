import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';

// ============================================
// ENUMS
// ============================================

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  BICYCLE = 'bicycle',
  SCOOTER = 'scooter',
  TRUCK = 'truck',
  VAN = 'van',
  BUS = 'bus',
  BOAT = 'boat',
  OTHER = 'other',
}

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  CNG = 'cng',
  LPG = 'lpg',
  NONE = 'none', // For bicycles, etc.
}

export enum TransmissionType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  SEMI_AUTOMATIC = 'semi_automatic',
  CVT = 'cvt',
  NONE = 'none',
}

export enum RentalType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum RentalStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
  UNAVAILABLE = 'unavailable',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
  EXTENDED = 'extended',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum TripStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// ============================================
// VEHICLE DTOs
// ============================================

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsEnum(TransmissionType)
  transmission: TransmissionType;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsNumber()
  doors?: number;

  @IsOptional()
  @IsNumber()
  engineCapacity?: number; // in CC or kW for electric

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsArray()
  features?: string[]; // AC, GPS, Bluetooth, etc.

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsString()
  shopId: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  // Pricing
  @IsNumber()
  @Min(0)
  hourlyRate: number;

  @IsNumber()
  @Min(0)
  dailyRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weeklyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  securityDeposit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  kmLimit?: number; // Daily km limit

  @IsOptional()
  @IsNumber()
  @Min(0)
  extraKmCharge?: number; // Per extra km

  // Insurance
  @IsOptional()
  @IsBoolean()
  insuranceIncluded?: boolean;

  @IsOptional()
  @IsNumber()
  insurancePrice?: number;

  // Requirements
  @IsOptional()
  @IsNumber()
  minAge?: number;

  @IsOptional()
  @IsNumber()
  minDrivingExperience?: number; // In years

  @IsOptional()
  @IsBoolean()
  requiresLicense?: boolean;

  @IsOptional()
  @IsArray()
  requiredDocuments?: string[];

  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @IsOptional()
  @IsNumber()
  dailyRate?: number;

  @IsOptional()
  @IsNumber()
  weeklyRate?: number;

  @IsOptional()
  @IsNumber()
  monthlyRate?: number;

  @IsOptional()
  @IsNumber()
  securityDeposit?: number;

  @IsOptional()
  @IsNumber()
  kmLimit?: number;

  @IsOptional()
  @IsNumber()
  extraKmCharge?: number;

  @IsOptional()
  @IsBoolean()
  insuranceIncluded?: boolean;

  @IsOptional()
  @IsNumber()
  insurancePrice?: number;

  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;
}

export class VehicleFilterDto {
  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsEnum(FuelType)
  fuelType?: FuelType;

  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @IsOptional()
  @IsNumber()
  minSeats?: number;

  @IsOptional()
  @IsNumber()
  maxSeats?: number;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsString()
  zoneId?: string;

  @IsOptional()
  @IsEnum(RentalStatus)
  status?: RentalStatus;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableTo?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// BOOKING DTOs
// ============================================

export class CreateBookingDto {
  @IsString()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  startTime?: string; // For hourly rentals

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsEnum(RentalType)
  rentalType: RentalType;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @IsOptional()
  @IsBoolean()
  withInsurance?: boolean;

  @IsOptional()
  @IsArray()
  addons?: BookingAddonDto[];

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // Driver details (if self-drive)
  @IsOptional()
  @IsString()
  driverLicenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string;

  @IsOptional()
  @IsString()
  licenseImage?: string;
}

export class BookingAddonDto {
  @IsString()
  addonId: string;

  @IsNumber()
  quantity: number;
}

export class UpdateBookingDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @IsOptional()
  @IsBoolean()
  withInsurance?: boolean;

  @IsOptional()
  @IsArray()
  addons?: BookingAddonDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ExtendBookingDto {
  @IsDateString()
  newEndDate: string;

  @IsOptional()
  @IsString()
  newEndTime?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BookingFilterDto {
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ============================================
// TRIP DTOs
// ============================================

export class StartTripDto {
  @IsString()
  bookingId: string;

  @IsOptional()
  @IsNumber()
  startMileage?: number;

  @IsOptional()
  @IsString()
  startLocation?: string;

  @IsOptional()
  @IsNumber()
  startLatitude?: number;

  @IsOptional()
  @IsNumber()
  startLongitude?: number;

  @IsOptional()
  @IsArray()
  vehicleConditionImages?: string[];

  @IsOptional()
  @IsString()
  vehicleConditionNotes?: string;
}

export class EndTripDto {
  @IsString()
  tripId: string;

  @IsOptional()
  @IsNumber()
  endMileage?: number;

  @IsOptional()
  @IsString()
  endLocation?: string;

  @IsOptional()
  @IsNumber()
  endLatitude?: number;

  @IsOptional()
  @IsNumber()
  endLongitude?: number;

  @IsOptional()
  @IsArray()
  vehicleConditionImages?: string[];

  @IsOptional()
  @IsString()
  vehicleConditionNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fuelLevel?: number; // Percentage

  @IsOptional()
  @IsArray()
  damages?: TripDamageDto[];
}

export class TripDamageDto {
  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;
}

export class UpdateTripLocationDto {
  @IsString()
  tripId: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsNumber()
  speed?: number;

  @IsOptional()
  @IsNumber()
  heading?: number;
}

// ============================================
// ADDON DTOs
// ============================================

export class CreateAddonDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RentalType)
  pricingType: RentalType;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  maxQuantity?: number;
}

export class UpdateAddonDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  maxQuantity?: number;
}

// ============================================
// MAINTENANCE DTOs
// ============================================

export class CreateMaintenanceDto {
  @IsString()
  vehicleId: string;

  @IsString()
  type: string; // oil_change, tire_rotation, inspection, repair, etc.

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  scheduledDate: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  mileageAtService?: number;

  @IsOptional()
  @IsString()
  serviceProvider?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateMaintenanceDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @IsOptional()
  @IsString()
  status?: string; // scheduled, in_progress, completed, cancelled

  @IsOptional()
  @IsString()
  notes?: string;
}

// ============================================
// PRICING DTOs
// ============================================

export class CalculateRentalPriceDto {
  @IsString()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsEnum(RentalType)
  rentalType: RentalType;

  @IsOptional()
  @IsBoolean()
  withDriver?: boolean;

  @IsOptional()
  @IsBoolean()
  withInsurance?: boolean;

  @IsOptional()
  @IsArray()
  addons?: BookingAddonDto[];

  @IsOptional()
  @IsString()
  couponCode?: string;
}

export class SetDynamicPricingDto {
  @IsString()
  vehicleId: string;

  @IsOptional()
  @IsArray()
  seasonalPricing?: SeasonalPriceDto[];

  @IsOptional()
  @IsArray()
  dayOfWeekPricing?: DayOfWeekPriceDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  demandMultiplierMax?: number; // Max percentage increase based on demand
}

export class SeasonalPriceDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  priceMultiplier: number; // 1.0 = normal, 1.5 = 50% more, etc.
}

export class DayOfWeekPriceDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday

  @IsNumber()
  priceMultiplier: number;
}

// ============================================
// REVIEW DTOs
// ============================================

export class CreateRentalReviewDto {
  @IsString()
  bookingId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  vehicleConditionRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  serviceRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  valueForMoneyRating?: number;

  @IsOptional()
  @IsArray()
  images?: string[];
}

// ============================================
// PROVIDER DTOs
// ============================================

export class ProviderDashboardDto {
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ProviderEarningsDto {
  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;
}

// ============================================
// AVAILABILITY DTOs
// ============================================

export class SetAvailabilityDto {
  @IsString()
  vehicleId: string;

  @IsArray()
  unavailableDates: UnavailableDateDto[];
}

export class UnavailableDateDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CheckAvailabilityDto {
  @IsString()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}
