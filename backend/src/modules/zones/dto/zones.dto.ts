import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, Min, Max, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ZoneType {
  POLYGON = 'polygon',
  CIRCLE = 'circle',
  CITY = 'city',
  POSTAL_CODE = 'postal_code',
}

export enum DeliveryType {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  SCHEDULED = 'scheduled',
  PICKUP = 'pickup',
}

// ============================================
// COORDINATE DTOs
// ============================================

export class CoordinateDto {
  @ApiProperty()
  @IsNumber()
  lat: number;

  @ApiProperty()
  @IsNumber()
  lng: number;
}

// ============================================
// ZONE DTOs
// ============================================

export class CreateZoneDto {
  @ApiPropertyOptional({ description: 'Shop ID for vendor-specific zones (null for platform-wide)' })
  @IsOptional()
  @IsString()
  shopId?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ZoneType })
  @IsEnum(ZoneType)
  type: ZoneType;

  @ApiPropertyOptional({ description: 'Polygon coordinates (for polygon type)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinateDto)
  coordinates?: CoordinateDto[];

  @ApiPropertyOptional({ description: 'Center point (for circle type)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinateDto)
  center?: CoordinateDto;

  @ApiPropertyOptional({ description: 'Radius in km (for circle type)' })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  radius?: number;

  @ApiPropertyOptional({ description: 'City name (for city type)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Postal codes (for postal_code type)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postalCodes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class UpdateZoneDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoordinateDto)
  coordinates?: CoordinateDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinateDto)
  center?: CoordinateDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  radius?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  postalCodes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

// ============================================
// DELIVERY OPTION DTOs
// ============================================

export class CreateDeliveryOptionDto {
  @ApiProperty()
  @IsString()
  zoneId: string;

  @ApiProperty({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Base delivery fee' })
  @IsNumber()
  @Min(0)
  baseFee: number;

  @ApiPropertyOptional({ description: 'Fee per km' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  perKmFee?: number;

  @ApiPropertyOptional({ description: 'Minimum order for free delivery' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryMinimum?: number;

  @ApiPropertyOptional({ description: 'Minimum delivery time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minDeliveryTime?: number;

  @ApiPropertyOptional({ description: 'Maximum delivery time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDeliveryTime?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateDeliveryOptionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  baseFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  perKmFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  freeDeliveryMinimum?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  minDeliveryTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxDeliveryTime?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// ============================================
// SHOP ZONE DTOs
// ============================================

export class AssignZoneToShopDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty()
  @IsString()
  zoneId: string;

  @ApiPropertyOptional({ description: 'Override base fee for this shop' })
  @IsOptional()
  @IsNumber()
  baseFeeOverride?: number;

  @ApiPropertyOptional({ description: 'Override min delivery time' })
  @IsOptional()
  @IsNumber()
  minDeliveryTimeOverride?: number;

  @ApiPropertyOptional({ description: 'Override max delivery time' })
  @IsOptional()
  @IsNumber()
  maxDeliveryTimeOverride?: number;
}

// ============================================
// CHECK AVAILABILITY DTOs
// ============================================

export class CheckDeliveryAvailabilityDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CoordinateDto)
  location: CoordinateDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shopId?: string;
}

export class CalculateDeliveryFeeDto {
  @ApiProperty()
  @IsString()
  zoneId: string;

  @ApiProperty({ enum: DeliveryType })
  @IsEnum(DeliveryType)
  deliveryType: DeliveryType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  orderAmount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  distance?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shopId?: string;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class ZoneResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  coordinates: CoordinateDto[] | null;

  @ApiProperty()
  center: CoordinateDto | null;

  @ApiProperty()
  radius: number | null;

  @ApiProperty()
  city: string | null;

  @ApiProperty()
  postalCodes: string[] | null;

  @ApiProperty()
  country: string | null;

  @ApiProperty()
  state: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: string;
}

export class DeliveryOptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  zoneId: string;

  @ApiProperty()
  deliveryType: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  baseFee: number;

  @ApiProperty()
  perKmFee: number | null;

  @ApiProperty()
  freeDeliveryMinimum: number | null;

  @ApiProperty()
  minDeliveryTime: number | null;

  @ApiProperty()
  maxDeliveryTime: number | null;

  @ApiProperty()
  isActive: boolean;
}

export class DeliveryAvailabilityResponseDto {
  @ApiProperty()
  available: boolean;

  @ApiProperty()
  zone: ZoneResponseDto | null;

  @ApiProperty()
  deliveryOptions: DeliveryOptionResponseDto[];

  @ApiProperty()
  message: string;
}

export class DeliveryFeeResponseDto {
  @ApiProperty()
  baseFee: number;

  @ApiProperty()
  distanceFee: number;

  @ApiProperty()
  totalFee: number;

  @ApiProperty()
  freeDelivery: boolean;

  @ApiProperty()
  freeDeliveryMinimum: number | null;

  @ApiProperty()
  estimatedTime: string;
}
