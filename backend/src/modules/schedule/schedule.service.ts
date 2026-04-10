import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  DayOfWeek,
  HolidayType,
  CreateScheduleDto,
  UpdateScheduleDto,
  UpdateDayScheduleDto,
  CreateHolidayDto,
  UpdateHolidayDto,
  CreateTemporaryClosureDto,
  CheckAvailabilityDto,
  GetAvailableSlotsDto,
  DayScheduleDto,
  TimeSlotDto,
} from './dto/schedule.dto';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // SCHEDULE MANAGEMENT
  // ============================================

  /**
   * Get shop schedule
   */
  async getSchedule(shopId: string): Promise<any> {
    const schedules = await /* TODO: replace client call */ this.db.client.query
      .from('shop_schedules')
      .select('*')
      .where('shop_id', shopId)
      .get();

    if (!schedules || schedules.length === 0) {
      return this.getDefaultSchedule(shopId);
    }

    return this.transformSchedule(schedules[0]);
  }

  /**
   * Create or update shop schedule
   */
  async setSchedule(dto: CreateScheduleDto): Promise<any> {
    const existing = await /* TODO: replace client call */ this.db.client.query
      .from('shop_schedules')
      .select('id')
      .where('shop_id', dto.shopId)
      .get();

    const scheduleData = {
      shop_id: dto.shopId,
      schedule: JSON.stringify(dto.schedule),
      timezone: dto.timezone || 'UTC',
      accept_pre_orders: dto.acceptPreOrders || false,
      pre_order_lead_time: dto.preOrderLeadTime || null,
      updated_at: new Date().toISOString(),
    };

    if (existing && existing.length > 0) {
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_schedules')
        .where('id', existing[0].id)
        .update(scheduleData)
        .execute();
    } else {
      await /* TODO: replace client call */ this.db.client.query
        .from('shop_schedules')
        .insert({
          ...scheduleData,
          created_at: new Date().toISOString(),
        })
        .execute();
    }

    return this.getSchedule(dto.shopId);
  }

  /**
   * Update schedule settings
   */
  async updateSchedule(shopId: string, dto: UpdateScheduleDto): Promise<any> {
    const schedule = await this.getSchedule(shopId);

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.schedule !== undefined) updateData.schedule = JSON.stringify(dto.schedule);
    if (dto.timezone !== undefined) updateData.timezone = dto.timezone;
    if (dto.acceptPreOrders !== undefined) updateData.accept_pre_orders = dto.acceptPreOrders;
    if (dto.preOrderLeadTime !== undefined) updateData.pre_order_lead_time = dto.preOrderLeadTime;

    await /* TODO: replace client call */ this.db.client.query
      .from('shop_schedules')
      .where('shop_id', shopId)
      .update(updateData)
      .execute();

    return this.getSchedule(shopId);
  }

  /**
   * Update single day schedule
   */
  async updateDaySchedule(shopId: string, dto: UpdateDayScheduleDto): Promise<any> {
    const schedule = await this.getSchedule(shopId);
    const currentSchedule = schedule.schedule || this.getDefaultWeekSchedule();

    const dayIndex = currentSchedule.findIndex((d: DayScheduleDto) => d.day === dto.day);
    if (dayIndex >= 0) {
      if (dto.isOpen !== undefined) currentSchedule[dayIndex].isOpen = dto.isOpen;
      if (dto.slots !== undefined) currentSchedule[dayIndex].slots = dto.slots;
    } else {
      currentSchedule.push({
        day: dto.day,
        isOpen: dto.isOpen ?? true,
        slots: dto.slots || [{ openTime: '09:00', closeTime: '17:00' }],
      });
    }

    return this.setSchedule({
      shopId,
      schedule: currentSchedule,
      timezone: schedule.timezone,
      acceptPreOrders: schedule.acceptPreOrders,
      preOrderLeadTime: schedule.preOrderLeadTime,
    });
  }

  // ============================================
  // HOLIDAY MANAGEMENT
  // ============================================

  /**
   * Get holidays for shop
   */
  async getHolidays(shopId: string, year?: number): Promise<any[]> {
    let query = /* TODO: replace client call */ this.db.client.query
      .from('shop_holidays')
      .select('*')
      .where('shop_id', shopId);

    if (year) {
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
    }

    const holidays = await query.orderBy('date', 'ASC').get();
    return (holidays || []).map(this.transformHoliday);
  }

  /**
   * Get upcoming holidays
   */
  async getUpcomingHolidays(shopId: string, days = 30): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const holidays = await /* TODO: replace client call */ this.db.client.query
      .from('shop_holidays')
      .select('*')
      .where('shop_id', shopId)
      .where('date', '>=', today)
      .where('date', '<=', futureDate)
      .orderBy('date', 'ASC')
      .get();

    return (holidays || []).map(this.transformHoliday);
  }

  /**
   * Create holiday
   */
  async createHoliday(dto: CreateHolidayDto): Promise<any> {
    const result = await /* TODO: replace client call */ this.db.client.query
      .from('shop_holidays')
      .insert({
        shop_id: dto.shopId,
        date: dto.date,
        name: dto.name,
        description: dto.description || null,
        type: dto.type,
        special_hours: dto.specialHours ? JSON.stringify(dto.specialHours) : null,
        is_recurring: dto.isRecurring || false,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformHoliday(result[0]);
  }

  /**
   * Update holiday
   */
  async updateHoliday(holidayId: string, dto: UpdateHolidayDto): Promise<any> {
    const holidays = await /* TODO: replace client call */ this.db.client.query
      .from('shop_holidays')
      .select('*')
      .where('id', holidayId)
      .get();

    if (!holidays || holidays.length === 0) {
      throw new NotFoundException('Holiday not found');
    }

    const updateData: any = {};

    if (dto.date !== undefined) updateData.date = dto.date;
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.specialHours !== undefined) {
      updateData.special_hours = dto.specialHours ? JSON.stringify(dto.specialHours) : null;
    }
    if (dto.isRecurring !== undefined) updateData.is_recurring = dto.isRecurring;

    await /* TODO: replace client call */ this.db.client.query
      .from('shop_holidays')
      .where('id', holidayId)
      .update(updateData)
      .execute();

    const updated = await /* TODO: replace client call */ this.db.client.query
      .from('shop_holidays')
      .select('*')
      .where('id', holidayId)
      .get();

    return this.transformHoliday(updated[0]);
  }

  /**
   * Delete holiday
   */
  async deleteHoliday(holidayId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('shop_holidays')
      .where('id', holidayId)
      .delete()
      .execute();
  }

  // ============================================
  // TEMPORARY CLOSURES
  // ============================================

  /**
   * Get active temporary closures
   */
  async getTemporaryClosures(shopId: string): Promise<any[]> {
    const now = new Date().toISOString();

    const closures = await /* TODO: replace client call */ this.db.client.query
      .from('shop_temporary_closures')
      .select('*')
      .where('shop_id', shopId)
      .where('end_time', '>', now)
      .orderBy('start_time', 'ASC')
      .get();

    return (closures || []).map(this.transformClosure);
  }

  /**
   * Create temporary closure
   */
  async createTemporaryClosure(dto: CreateTemporaryClosureDto): Promise<any> {
    if (new Date(dto.endTime) <= new Date(dto.startTime)) {
      throw new BadRequestException('End time must be after start time');
    }

    const result = await /* TODO: replace client call */ this.db.client.query
      .from('shop_temporary_closures')
      .insert({
        shop_id: dto.shopId,
        start_time: dto.startTime,
        end_time: dto.endTime,
        reason: dto.reason,
        message: dto.message || null,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.transformClosure(result[0]);
  }

  /**
   * Cancel temporary closure
   */
  async cancelTemporaryClosure(closureId: string): Promise<void> {
    await /* TODO: replace client call */ this.db.client.query
      .from('shop_temporary_closures')
      .where('id', closureId)
      .delete()
      .execute();
  }

  // ============================================
  // AVAILABILITY CHECKING
  // ============================================

  /**
   * Check if shop is open
   */
  async checkAvailability(dto: CheckAvailabilityDto): Promise<any> {
    const schedule = await this.getSchedule(dto.shopId);
    const checkTime = dto.datetime ? new Date(dto.datetime) : new Date();

    // Check temporary closures
    const closures = await this.getTemporaryClosures(dto.shopId);
    for (const closure of closures) {
      if (
        checkTime >= new Date(closure.startTime) &&
        checkTime <= new Date(closure.endTime)
      ) {
        return {
          isOpen: false,
          currentStatus: 'temporarily_closed',
          nextOpenTime: closure.endTime,
          todayHours: [],
          message: closure.message || `Temporarily closed: ${closure.reason}`,
        };
      }
    }

    // Check holidays
    const dateStr = checkTime.toISOString().split('T')[0];
    const holidays = await this.getHolidays(dto.shopId);
    const todayHoliday = holidays.find((h: any) => h.date === dateStr);

    if (todayHoliday) {
      if (todayHoliday.type === HolidayType.CLOSED) {
        return {
          isOpen: false,
          currentStatus: 'holiday',
          nextOpenTime: await this.getNextOpenTime(dto.shopId, checkTime),
          todayHours: [],
          message: `Closed for ${todayHoliday.name}`,
        };
      } else if (todayHoliday.type === HolidayType.SPECIAL_HOURS && todayHoliday.specialHours) {
        return this.checkTimeAgainstSlots(checkTime, todayHoliday.specialHours, dto.shopId, `Special hours: ${todayHoliday.name}`);
      }
    }

    // Check regular schedule
    const dayOfWeek = checkTime.getDay() as DayOfWeek;
    const daySchedule = (schedule.schedule || []).find((d: DayScheduleDto) => d.day === dayOfWeek);

    if (!daySchedule || !daySchedule.isOpen || !daySchedule.slots?.length) {
      return {
        isOpen: false,
        currentStatus: 'closed',
        nextOpenTime: await this.getNextOpenTime(dto.shopId, checkTime),
        todayHours: daySchedule?.slots || [],
        message: 'Closed today',
      };
    }

    return this.checkTimeAgainstSlots(checkTime, daySchedule.slots, dto.shopId, 'Open');
  }

  /**
   * Get available time slots for a date
   */
  async getAvailableSlots(dto: GetAvailableSlotsDto): Promise<any[]> {
    const slotDuration = dto.slotDuration || 30; // Default 30 min slots
    const targetDate = new Date(dto.date);
    const dayOfWeek = targetDate.getDay() as DayOfWeek;

    const schedule = await this.getSchedule(dto.shopId);
    const daySchedule = (schedule.schedule || []).find((d: DayScheduleDto) => d.day === dayOfWeek);

    if (!daySchedule || !daySchedule.isOpen || !daySchedule.slots?.length) {
      return [];
    }

    // Check for holiday
    const holidays = await this.getHolidays(dto.shopId);
    const holiday = holidays.find((h: any) => h.date === dto.date);
    const timeSlots = holiday?.specialHours || daySchedule.slots;

    const slots: any[] = [];
    const now = new Date();
    const isToday = dto.date === now.toISOString().split('T')[0];

    for (const slot of timeSlots) {
      const [openHour, openMin] = slot.openTime.split(':').map(Number);
      const [closeHour, closeMin] = slot.closeTime.split(':').map(Number);

      let currentTime = openHour * 60 + openMin;
      const endTime = closeHour * 60 + closeMin;

      while (currentTime + slotDuration <= endTime) {
        const startHour = Math.floor(currentTime / 60);
        const startMinute = currentTime % 60;
        const endTimeMinutes = currentTime + slotDuration;
        const endHour = Math.floor(endTimeMinutes / 60);
        const endMinute = endTimeMinutes % 60;

        const slotStart = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
        const slotEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        // Check if slot is in the past
        let available = true;
        if (isToday) {
          const slotDateTime = new Date(dto.date + 'T' + slotStart);
          if (slotDateTime <= now) {
            available = false;
          }
        }

        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          available,
        });

        currentTime += slotDuration;
      }
    }

    return slots;
  }

  // ============================================
  // HELPERS
  // ============================================

  private async getNextOpenTime(shopId: string, fromTime: Date): Promise<string | null> {
    const schedule = await this.getSchedule(shopId);
    const weekSchedule = schedule.schedule || this.getDefaultWeekSchedule();

    // Check next 7 days
    for (let i = 0; i <= 7; i++) {
      const checkDate = new Date(fromTime.getTime() + i * 24 * 60 * 60 * 1000);
      const dayOfWeek = checkDate.getDay() as DayOfWeek;
      const daySchedule = weekSchedule.find((d: DayScheduleDto) => d.day === dayOfWeek);

      if (daySchedule?.isOpen && daySchedule.slots?.length) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const firstSlot = daySchedule.slots[0];
        return `${dateStr}T${firstSlot.openTime}:00`;
      }
    }

    return null;
  }

  private checkTimeAgainstSlots(
    checkTime: Date,
    slots: TimeSlotDto[],
    shopId: string,
    openMessage: string,
  ): any {
    const timeStr = checkTime.toTimeString().substring(0, 5);
    const timeMinutes = parseInt(timeStr.split(':')[0]) * 60 + parseInt(timeStr.split(':')[1]);

    for (const slot of slots) {
      const [openHour, openMin] = slot.openTime.split(':').map(Number);
      const [closeHour, closeMin] = slot.closeTime.split(':').map(Number);
      const openMinutes = openHour * 60 + openMin;
      const closeMinutes = closeHour * 60 + closeMin;

      if (timeMinutes >= openMinutes && timeMinutes < closeMinutes) {
        return {
          isOpen: true,
          currentStatus: 'open',
          nextOpenTime: null,
          todayHours: slots,
          message: openMessage,
        };
      }
    }

    return {
      isOpen: false,
      currentStatus: 'closed',
      nextOpenTime: this.getNextSlotTime(checkTime, slots),
      todayHours: slots,
      message: 'Currently closed',
    };
  }

  private getNextSlotTime(checkTime: Date, slots: TimeSlotDto[]): string | null {
    const timeStr = checkTime.toTimeString().substring(0, 5);
    const dateStr = checkTime.toISOString().split('T')[0];

    for (const slot of slots) {
      if (slot.openTime > timeStr) {
        return `${dateStr}T${slot.openTime}:00`;
      }
    }

    return null;
  }

  private getDefaultSchedule(shopId: string): any {
    return {
      shopId,
      schedule: this.getDefaultWeekSchedule(),
      timezone: 'UTC',
      acceptPreOrders: false,
      preOrderLeadTime: null,
      createdAt: null,
      updatedAt: null,
    };
  }

  private getDefaultWeekSchedule(): DayScheduleDto[] {
    const defaultSlots: TimeSlotDto[] = [{ openTime: '09:00', closeTime: '17:00' }];

    return [
      { day: DayOfWeek.SUNDAY, isOpen: false, slots: [] },
      { day: DayOfWeek.MONDAY, isOpen: true, slots: defaultSlots },
      { day: DayOfWeek.TUESDAY, isOpen: true, slots: defaultSlots },
      { day: DayOfWeek.WEDNESDAY, isOpen: true, slots: defaultSlots },
      { day: DayOfWeek.THURSDAY, isOpen: true, slots: defaultSlots },
      { day: DayOfWeek.FRIDAY, isOpen: true, slots: defaultSlots },
      { day: DayOfWeek.SATURDAY, isOpen: false, slots: [] },
    ];
  }

  private transformSchedule(schedule: any): any {
    return {
      id: schedule.id,
      shopId: schedule.shop_id,
      schedule: typeof schedule.schedule === 'string' ? JSON.parse(schedule.schedule) : schedule.schedule,
      timezone: schedule.timezone || 'UTC',
      acceptPreOrders: schedule.accept_pre_orders || false,
      preOrderLeadTime: schedule.pre_order_lead_time,
      createdAt: schedule.created_at,
      updatedAt: schedule.updated_at,
    };
  }

  private transformHoliday(holiday: any): any {
    return {
      id: holiday.id,
      shopId: holiday.shop_id,
      date: holiday.date,
      name: holiday.name,
      description: holiday.description,
      type: holiday.type,
      specialHours: holiday.special_hours
        ? typeof holiday.special_hours === 'string'
          ? JSON.parse(holiday.special_hours)
          : holiday.special_hours
        : null,
      isRecurring: holiday.is_recurring || false,
      createdAt: holiday.created_at,
    };
  }

  private transformClosure(closure: any): any {
    return {
      id: closure.id,
      shopId: closure.shop_id,
      startTime: closure.start_time,
      endTime: closure.end_time,
      reason: closure.reason,
      message: closure.message,
      createdAt: closure.created_at,
    };
  }
}
