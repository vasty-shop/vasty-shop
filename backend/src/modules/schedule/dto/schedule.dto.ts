import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, ValidateNested, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum HolidayType {
  CLOSED = 'closed',
  SPECIAL_HOURS = 'special_hours',
}

// ============================================
// TIME SLOT DTOs
// ============================================

export class TimeSlotDto {
  @ApiProperty({ description: 'Opening time (HH:mm)' })
  @IsString()
  openTime: string;

  @ApiProperty({ description: 'Closing time (HH:mm)' })
  @IsString()
  closeTime: string;
}

export class DayScheduleDto {
  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @ApiProperty({ description: 'Is shop open this day' })
  @IsBoolean()
  isOpen: boolean;

  @ApiPropertyOptional({ description: 'Time slots (supports split hours)' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots?: TimeSlotDto[];
}

// ============================================
// SCHEDULE DTOs
// ============================================

export class CreateScheduleDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty({ type: [DayScheduleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedule: DayScheduleDto[];

  @ApiPropertyOptional({ description: 'Shop timezone (e.g., America/New_York)' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Accept orders before opening' })
  @IsOptional()
  @IsBoolean()
  acceptPreOrders?: boolean;

  @ApiPropertyOptional({ description: 'Pre-order lead time in minutes' })
  @IsOptional()
  @IsNumber()
  preOrderLeadTime?: number;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ type: [DayScheduleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedule?: DayScheduleDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptPreOrders?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  preOrderLeadTime?: number;
}

export class UpdateDayScheduleDto {
  @ApiProperty({ enum: DayOfWeek })
  @IsEnum(DayOfWeek)
  day: DayOfWeek;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  slots?: TimeSlotDto[];
}

// ============================================
// HOLIDAY DTOs
// ============================================

export class CreateHolidayDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Holiday date (YYYY-MM-DD)' })
  @IsString()
  date: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: HolidayType })
  @IsEnum(HolidayType)
  type: HolidayType;

  @ApiPropertyOptional({ description: 'Special hours if type is special_hours' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  specialHours?: TimeSlotDto[];

  @ApiPropertyOptional({ description: 'Recurring annually' })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

export class UpdateHolidayDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: HolidayType })
  @IsOptional()
  @IsEnum(HolidayType)
  type?: HolidayType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  specialHours?: TimeSlotDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

// ============================================
// TEMPORARY CLOSURE DTOs
// ============================================

export class CreateTemporaryClosureDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Start datetime (ISO)' })
  @IsString()
  startTime: string;

  @ApiProperty({ description: 'End datetime (ISO)' })
  @IsString()
  endTime: string;

  @ApiProperty()
  @IsString()
  reason: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}

// ============================================
// QUERY DTOs
// ============================================

export class CheckAvailabilityDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiPropertyOptional({ description: 'Check at specific datetime (ISO)' })
  @IsOptional()
  @IsString()
  datetime?: string;
}

export class GetAvailableSlotsDto {
  @ApiProperty()
  @IsString()
  shopId: string;

  @ApiProperty({ description: 'Date (YYYY-MM-DD)' })
  @IsString()
  date: string;

  @ApiPropertyOptional({ description: 'Slot duration in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(120)
  slotDuration?: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class ScheduleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  schedule: DayScheduleDto[];

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  acceptPreOrders: boolean;

  @ApiProperty()
  preOrderLeadTime: number | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class HolidayResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  shopId: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  specialHours: TimeSlotDto[] | null;

  @ApiProperty()
  isRecurring: boolean;
}

export class AvailabilityResponseDto {
  @ApiProperty()
  isOpen: boolean;

  @ApiProperty()
  currentStatus: string;

  @ApiProperty()
  nextOpenTime: string | null;

  @ApiProperty()
  todayHours: TimeSlotDto[];

  @ApiProperty()
  message: string;
}

export class TimeSlotResponseDto {
  @ApiProperty()
  startTime: string;

  @ApiProperty()
  endTime: string;

  @ApiProperty()
  available: boolean;
}
