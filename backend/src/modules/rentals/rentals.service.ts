import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateVehicleDto,
  UpdateVehicleDto,
  VehicleFilterDto,
  CreateBookingDto,
  UpdateBookingDto,
  UpdateBookingStatusDto,
  ExtendBookingDto,
  BookingFilterDto,
  StartTripDto,
  EndTripDto,
  UpdateTripLocationDto,
  CreateAddonDto,
  UpdateAddonDto,
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  CalculateRentalPriceDto,
  SetDynamicPricingDto,
  CreateRentalReviewDto,
  ProviderDashboardDto,
  ProviderEarningsDto,
  SetAvailabilityDto,
  CheckAvailabilityDto,
  RentalStatus,
  BookingStatus,
  TripStatus,
  RentalType,
  PaymentStatus,
} from './dto/rentals.dto';

@Injectable()
export class RentalsService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // VEHICLE MANAGEMENT
  // ============================================

  async createVehicle(dto: CreateVehicleDto, userId: string) {
    const vehicle = await this.db.query_builder()
      .from('rental_vehicles')
      .insert({
        name: dto.name,
        description: dto.description,
        vehicle_type: dto.vehicleType,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        color: dto.color,
        license_plate: dto.licensePlate,
        vin: dto.vin,
        fuel_type: dto.fuelType,
        transmission: dto.transmission,
        seats: dto.seats,
        doors: dto.doors,
        engine_capacity: dto.engineCapacity,
        mileage: dto.mileage || 0,
        features: JSON.stringify(dto.features || []),
        images: JSON.stringify(dto.images || []),
        shop_id: dto.shopId,
        zone_id: dto.zoneId,
        hourly_rate: dto.hourlyRate,
        daily_rate: dto.dailyRate,
        weekly_rate: dto.weeklyRate,
        monthly_rate: dto.monthlyRate,
        security_deposit: dto.securityDeposit || 0,
        km_limit: dto.kmLimit,
        extra_km_charge: dto.extraKmCharge,
        insurance_included: dto.insuranceIncluded || false,
        insurance_price: dto.insurancePrice || 0,
        min_age: dto.minAge || 18,
        min_driving_experience: dto.minDrivingExperience || 0,
        requires_license: dto.requiresLicense !== false,
        required_documents: JSON.stringify(dto.requiredDocuments || ['driver_license']),
        status: dto.status || RentalStatus.AVAILABLE,
        rating: 0,
        total_trips: 0,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatVehicle(vehicle[0]);
  }

  async getVehicles(dto: VehicleFilterDto) {
    let query = this.db.query_builder()
      .from('rental_vehicles')
      .select('*');

    if (dto.vehicleType) {
      query = query.where('vehicle_type', dto.vehicleType);
    }
    if (dto.brand) {
      query = query.where('brand', dto.brand);
    }
    if (dto.fuelType) {
      query = query.where('fuel_type', dto.fuelType);
    }
    if (dto.transmission) {
      query = query.where('transmission', dto.transmission);
    }
    if (dto.minSeats) {
      query = query.where('seats', '>=', dto.minSeats);
    }
    if (dto.maxSeats) {
      query = query.where('seats', '<=', dto.maxSeats);
    }
    if (dto.minPrice) {
      query = query.where('daily_rate', '>=', dto.minPrice);
    }
    if (dto.maxPrice) {
      query = query.where('daily_rate', '<=', dto.maxPrice);
    }
    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.zoneId) {
      query = query.where('zone_id', dto.zoneId);
    }
    if (dto.status) {
      query = query.where('status', dto.status);
    }

    // Sort
    const sortBy = dto.sortBy || 'created_at';
    const sortOrder = dto.sortOrder || 'desc';
    query = query.orderBy(sortBy, sortOrder === 'asc' ? 'ASC' : 'DESC');

    // Pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    const vehicles = await query.limit(limit).offset(offset).get();

    // Check availability if dates provided
    if (dto.availableFrom && dto.availableTo) {
      const availableVehicles = await Promise.all(
        vehicles.map(async (v: any) => {
          const isAvailable = await this.checkVehicleAvailability(
            v.id,
            dto.availableFrom!,
            dto.availableTo!
          );
          return isAvailable ? v : null;
        })
      );
      return availableVehicles.filter(v => v !== null).map(this.formatVehicle);
    }

    return vehicles.map(this.formatVehicle);
  }

  async getVehicle(id: string) {
    const vehicles = await this.db.query_builder()
      .from('rental_vehicles')
      .select('*')
      .where('id', id)
      .get();

    if (vehicles.length === 0) {
      throw new NotFoundException('Vehicle not found');
    }

    return this.formatVehicle(vehicles[0]);
  }

  async updateVehicle(id: string, dto: UpdateVehicleDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.vehicleType) updateData.vehicle_type = dto.vehicleType;
    if (dto.brand) updateData.brand = dto.brand;
    if (dto.model) updateData.model = dto.model;
    if (dto.year) updateData.year = dto.year;
    if (dto.color) updateData.color = dto.color;
    if (dto.licensePlate) updateData.license_plate = dto.licensePlate;
    if (dto.fuelType) updateData.fuel_type = dto.fuelType;
    if (dto.transmission) updateData.transmission = dto.transmission;
    if (dto.seats) updateData.seats = dto.seats;
    if (dto.mileage !== undefined) updateData.mileage = dto.mileage;
    if (dto.features) updateData.features = JSON.stringify(dto.features);
    if (dto.images) updateData.images = JSON.stringify(dto.images);
    if (dto.hourlyRate !== undefined) updateData.hourly_rate = dto.hourlyRate;
    if (dto.dailyRate !== undefined) updateData.daily_rate = dto.dailyRate;
    if (dto.weeklyRate !== undefined) updateData.weekly_rate = dto.weeklyRate;
    if (dto.monthlyRate !== undefined) updateData.monthly_rate = dto.monthlyRate;
    if (dto.securityDeposit !== undefined) updateData.security_deposit = dto.securityDeposit;
    if (dto.kmLimit !== undefined) updateData.km_limit = dto.kmLimit;
    if (dto.extraKmCharge !== undefined) updateData.extra_km_charge = dto.extraKmCharge;
    if (dto.insuranceIncluded !== undefined) updateData.insurance_included = dto.insuranceIncluded;
    if (dto.insurancePrice !== undefined) updateData.insurance_price = dto.insurancePrice;
    if (dto.status) updateData.status = dto.status;

    const result = await this.db.query_builder()
      .from('rental_vehicles')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatVehicle(result[0]);
  }

  async deleteVehicle(id: string) {
    // Check for active bookings
    const activeBookings = await this.db.query_builder()
      .from('rental_bookings')
      .select('id')
      .where('vehicle_id', id)
      .whereIn('status', [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ACTIVE])
      .get();

    if (activeBookings.length > 0) {
      throw new ConflictException('Cannot delete vehicle with active bookings');
    }

    await this.db.query_builder()
      .from('rental_vehicles')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  async updateVehicleStatus(id: string, status: RentalStatus) {
    const result = await this.db.query_builder()
      .from('rental_vehicles')
      .where('id', id)
      .update({ status, updated_at: new Date().toISOString() })
      .returning('*')
      .execute();

    return this.formatVehicle(result[0]);
  }

  // ============================================
  // BOOKING MANAGEMENT
  // ============================================

  async createBooking(dto: CreateBookingDto, userId: string) {
    // Check vehicle exists and is available
    const vehicle = await this.getVehicle(dto.vehicleId);
    if (vehicle.status !== RentalStatus.AVAILABLE) {
      throw new BadRequestException('Vehicle is not available for booking');
    }

    // Check availability for dates
    const isAvailable = await this.checkVehicleAvailability(
      dto.vehicleId,
      dto.startDate,
      dto.endDate
    );
    if (!isAvailable) {
      throw new ConflictException('Vehicle is not available for the selected dates');
    }

    // Calculate pricing
    const pricing = await this.calculateRentalPrice({
      vehicleId: dto.vehicleId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      rentalType: dto.rentalType,
      withDriver: dto.withDriver,
      withInsurance: dto.withInsurance,
      addons: dto.addons,
      couponCode: dto.couponCode,
    });

    // Generate booking number
    const bookingNumber = `RNT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const booking = await this.db.query_builder()
      .from('rental_bookings')
      .insert({
        booking_number: bookingNumber,
        vehicle_id: dto.vehicleId,
        user_id: userId,
        shop_id: vehicle.shopId,
        start_date: dto.startDate,
        end_date: dto.endDate,
        start_time: dto.startTime,
        end_time: dto.endTime,
        rental_type: dto.rentalType,
        pickup_location: dto.pickupLocation,
        dropoff_location: dto.dropoffLocation,
        with_driver: dto.withDriver || false,
        with_insurance: dto.withInsurance || false,
        addons: JSON.stringify(dto.addons || []),
        coupon_code: dto.couponCode,
        driver_license_number: dto.driverLicenseNumber,
        license_expiry_date: dto.licenseExpiryDate,
        license_image: dto.licenseImage,
        base_price: pricing.basePrice,
        addon_price: pricing.addonPrice,
        insurance_price: pricing.insurancePrice,
        driver_price: pricing.driverPrice,
        discount: pricing.discount,
        tax: pricing.tax,
        total_price: pricing.totalPrice,
        security_deposit: pricing.securityDeposit,
        status: BookingStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
        notes: dto.notes,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatBooking(booking[0]);
  }

  async getBookings(dto: BookingFilterDto, userId?: string, isAdmin?: boolean) {
    let query = this.db.query_builder()
      .from('rental_bookings')
      .select('*');

    if (!isAdmin && userId) {
      query = query.where('user_id', userId);
    }
    if (dto.vehicleId) {
      query = query.where('vehicle_id', dto.vehicleId);
    }
    if (dto.userId) {
      query = query.where('user_id', dto.userId);
    }
    if (dto.shopId) {
      query = query.where('shop_id', dto.shopId);
    }
    if (dto.status) {
      query = query.where('status', dto.status);
    }
    if (dto.startDate) {
      query = query.where('start_date', '>=', dto.startDate);
    }
    if (dto.endDate) {
      query = query.where('end_date', '<=', dto.endDate);
    }

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    const bookings = await query
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return bookings.map(this.formatBooking);
  }

  async getBooking(id: string, userId?: string) {
    let query = this.db.query_builder()
      .from('rental_bookings')
      .select('*')
      .where('id', id);

    if (userId) {
      query = query.where('user_id', userId);
    }

    const bookings = await query.get();

    if (bookings.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    return this.formatBooking(bookings[0]);
  }

  async updateBooking(id: string, dto: UpdateBookingDto, userId?: string) {
    const booking = await this.getBooking(id, userId);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only update pending bookings');
    }

    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.startDate) updateData.start_date = dto.startDate;
    if (dto.endDate) updateData.end_date = dto.endDate;
    if (dto.startTime) updateData.start_time = dto.startTime;
    if (dto.endTime) updateData.end_time = dto.endTime;
    if (dto.pickupLocation) updateData.pickup_location = dto.pickupLocation;
    if (dto.dropoffLocation) updateData.dropoff_location = dto.dropoffLocation;
    if (dto.withDriver !== undefined) updateData.with_driver = dto.withDriver;
    if (dto.withInsurance !== undefined) updateData.with_insurance = dto.withInsurance;
    if (dto.addons) updateData.addons = JSON.stringify(dto.addons);
    if (dto.notes) updateData.notes = dto.notes;

    // Recalculate pricing if dates or options changed
    if (dto.startDate || dto.endDate || dto.withDriver !== undefined || dto.withInsurance !== undefined || dto.addons) {
      const pricing = await this.calculateRentalPrice({
        vehicleId: booking.vehicleId,
        startDate: dto.startDate || booking.startDate,
        endDate: dto.endDate || booking.endDate,
        startTime: dto.startTime || booking.startTime,
        endTime: dto.endTime || booking.endTime,
        rentalType: booking.rentalType,
        withDriver: dto.withDriver ?? booking.withDriver,
        withInsurance: dto.withInsurance ?? booking.withInsurance,
        addons: dto.addons || booking.addons,
        couponCode: booking.couponCode,
      });

      updateData.base_price = pricing.basePrice;
      updateData.addon_price = pricing.addonPrice;
      updateData.insurance_price = pricing.insurancePrice;
      updateData.driver_price = pricing.driverPrice;
      updateData.discount = pricing.discount;
      updateData.tax = pricing.tax;
      updateData.total_price = pricing.totalPrice;
    }

    const result = await this.db.query_builder()
      .from('rental_bookings')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatBooking(result[0]);
  }

  async updateBookingStatus(id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.getBooking(id);

    // Validate status transition
    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      [BookingStatus.CONFIRMED]: [BookingStatus.ACTIVE, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
      [BookingStatus.ACTIVE]: [BookingStatus.COMPLETED, BookingStatus.EXTENDED],
      [BookingStatus.EXTENDED]: [BookingStatus.COMPLETED],
      [BookingStatus.COMPLETED]: [],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.NO_SHOW]: [],
    };

    if (!validTransitions[booking.status as BookingStatus]?.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from ${booking.status} to ${dto.status}`);
    }

    const updateData: any = {
      status: dto.status,
      status_reason: dto.reason,
      status_notes: dto.notes,
      updated_at: new Date().toISOString(),
    };

    // Update vehicle status if needed
    if (dto.status === BookingStatus.ACTIVE) {
      await this.updateVehicleStatus(booking.vehicleId, RentalStatus.RENTED);
    } else if (dto.status === BookingStatus.COMPLETED || dto.status === BookingStatus.CANCELLED) {
      await this.updateVehicleStatus(booking.vehicleId, RentalStatus.AVAILABLE);
    }

    const result = await this.db.query_builder()
      .from('rental_bookings')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return this.formatBooking(result[0]);
  }

  async extendBooking(id: string, dto: ExtendBookingDto, userId?: string) {
    const booking = await this.getBooking(id, userId);

    if (booking.status !== BookingStatus.ACTIVE && booking.status !== BookingStatus.EXTENDED) {
      throw new BadRequestException('Can only extend active bookings');
    }

    // Check availability for extension
    const isAvailable = await this.checkVehicleAvailability(
      booking.vehicleId,
      booking.endDate,
      dto.newEndDate,
      id // Exclude current booking
    );

    if (!isAvailable) {
      throw new ConflictException('Vehicle is not available for the extension period');
    }

    // Calculate additional cost
    const additionalPricing = await this.calculateRentalPrice({
      vehicleId: booking.vehicleId,
      startDate: booking.endDate,
      endDate: dto.newEndDate,
      startTime: booking.endTime,
      endTime: dto.newEndTime,
      rentalType: booking.rentalType,
      withDriver: booking.withDriver,
      withInsurance: booking.withInsurance,
    });

    const result = await this.db.query_builder()
      .from('rental_bookings')
      .where('id', id)
      .update({
        end_date: dto.newEndDate,
        end_time: dto.newEndTime || booking.endTime,
        status: BookingStatus.EXTENDED,
        extension_reason: dto.reason,
        total_price: booking.totalPrice + additionalPricing.totalPrice,
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return this.formatBooking(result[0]);
  }

  async cancelBooking(id: string, reason?: string, userId?: string) {
    return this.updateBookingStatus(id, {
      status: BookingStatus.CANCELLED,
      reason,
    });
  }

  // ============================================
  // TRIP MANAGEMENT
  // ============================================

  async startTrip(dto: StartTripDto, userId: string) {
    const booking = await this.getBooking(dto.bookingId);

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Booking must be confirmed to start trip');
    }

    const trip = await this.db.query_builder()
      .from('rental_trips')
      .insert({
        booking_id: dto.bookingId,
        vehicle_id: booking.vehicleId,
        user_id: userId,
        start_mileage: dto.startMileage,
        start_location: dto.startLocation,
        start_latitude: dto.startLatitude,
        start_longitude: dto.startLongitude,
        vehicle_condition_images_start: JSON.stringify(dto.vehicleConditionImages || []),
        vehicle_condition_notes_start: dto.vehicleConditionNotes,
        status: TripStatus.IN_PROGRESS,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Update booking status
    await this.updateBookingStatus(dto.bookingId, { status: BookingStatus.ACTIVE });

    return this.formatTrip(trip[0]);
  }

  async endTrip(dto: EndTripDto, userId: string) {
    const trips = await this.db.query_builder()
      .from('rental_trips')
      .select('*')
      .where('id', dto.tripId)
      .where('user_id', userId)
      .get();

    if (trips.length === 0) {
      throw new NotFoundException('Trip not found');
    }

    const trip = trips[0];
    if (trip.status !== TripStatus.IN_PROGRESS) {
      throw new BadRequestException('Trip is not in progress');
    }

    // Calculate distance and extra charges
    const distanceTraveled = dto.endMileage && trip.start_mileage
      ? dto.endMileage - trip.start_mileage
      : 0;

    // Get booking for km limit
    const booking = await this.getBooking(trip.booking_id);
    const vehicle = await this.getVehicle(trip.vehicle_id);

    let extraKmCharge = 0;
    if (vehicle.kmLimit && distanceTraveled > vehicle.kmLimit) {
      const extraKm = distanceTraveled - vehicle.kmLimit;
      extraKmCharge = extraKm * (vehicle.extraKmCharge || 0);
    }

    // Calculate damage charges
    let damageCharge = 0;
    if (dto.damages && dto.damages.length > 0) {
      damageCharge = dto.damages.reduce((sum, d) => sum + (d.estimatedCost || 0), 0);
    }

    const result = await this.db.query_builder()
      .from('rental_trips')
      .where('id', dto.tripId)
      .update({
        end_mileage: dto.endMileage,
        end_location: dto.endLocation,
        end_latitude: dto.endLatitude,
        end_longitude: dto.endLongitude,
        vehicle_condition_images_end: JSON.stringify(dto.vehicleConditionImages || []),
        vehicle_condition_notes_end: dto.vehicleConditionNotes,
        fuel_level_end: dto.fuelLevel,
        damages: JSON.stringify(dto.damages || []),
        distance_traveled: distanceTraveled,
        extra_km_charge: extraKmCharge,
        damage_charge: damageCharge,
        status: TripStatus.COMPLETED,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Update booking status
    await this.updateBookingStatus(trip.booking_id, { status: BookingStatus.COMPLETED });

    // Update vehicle mileage
    if (dto.endMileage) {
      await this.db.query_builder()
        .from('rental_vehicles')
        .where('id', trip.vehicle_id)
        .update({
          mileage: dto.endMileage,
          total_trips: vehicle.totalTrips + 1,
          updated_at: new Date().toISOString(),
        })
        .execute();
    }

    return this.formatTrip(result[0]);
  }

  async updateTripLocation(dto: UpdateTripLocationDto) {
    await this.db.query_builder()
      .from('rental_trip_locations')
      .insert({
        trip_id: dto.tripId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        speed: dto.speed,
        heading: dto.heading,
        recorded_at: new Date().toISOString(),
      })
      .execute();

    return { success: true };
  }

  async getTripLocations(tripId: string) {
    const locations = await this.db.query_builder()
      .from('rental_trip_locations')
      .select('*')
      .where('trip_id', tripId)
      .orderBy('recorded_at', 'ASC')
      .get();

    return locations;
  }

  // ============================================
  // ADDON MANAGEMENT
  // ============================================

  async createAddon(dto: CreateAddonDto, userId: string) {
    const addon = await this.db.query_builder()
      .from('rental_addons')
      .insert({
        name: dto.name,
        description: dto.description,
        pricing_type: dto.pricingType,
        price: dto.price,
        shop_id: dto.shopId,
        is_active: dto.isActive !== false,
        max_quantity: dto.maxQuantity,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    return addon[0];
  }

  async getAddons(shopId?: string) {
    let query = this.db.query_builder()
      .from('rental_addons')
      .select('*')
      .where('is_active', true);

    if (shopId) {
      query = query.where('shop_id', shopId);
    }

    return query.orderBy('name', 'ASC').get();
  }

  async updateAddon(id: string, dto: UpdateAddonDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.name) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.isActive !== undefined) updateData.is_active = dto.isActive;
    if (dto.maxQuantity !== undefined) updateData.max_quantity = dto.maxQuantity;

    const result = await this.db.query_builder()
      .from('rental_addons')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    return result[0];
  }

  async deleteAddon(id: string) {
    await this.db.query_builder()
      .from('rental_addons')
      .where('id', id)
      .delete()
      .execute();

    return { success: true };
  }

  // ============================================
  // MAINTENANCE
  // ============================================

  async createMaintenance(dto: CreateMaintenanceDto, userId: string) {
    const maintenance = await this.db.query_builder()
      .from('rental_maintenance')
      .insert({
        vehicle_id: dto.vehicleId,
        type: dto.type,
        description: dto.description,
        scheduled_date: dto.scheduledDate,
        estimated_cost: dto.estimatedCost,
        mileage_at_service: dto.mileageAtService,
        service_provider: dto.serviceProvider,
        notes: dto.notes,
        status: 'scheduled',
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Update vehicle status
    await this.updateVehicleStatus(dto.vehicleId, RentalStatus.MAINTENANCE);

    return maintenance[0];
  }

  async getMaintenanceRecords(vehicleId: string) {
    const records = await this.db.query_builder()
      .from('rental_maintenance')
      .select('*')
      .where('vehicle_id', vehicleId)
      .orderBy('scheduled_date', 'DESC')
      .get();

    return records;
  }

  async updateMaintenance(id: string, dto: UpdateMaintenanceDto) {
    const updateData: any = { updated_at: new Date().toISOString() };

    if (dto.type) updateData.type = dto.type;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.scheduledDate) updateData.scheduled_date = dto.scheduledDate;
    if (dto.completedDate) updateData.completed_date = dto.completedDate;
    if (dto.actualCost !== undefined) updateData.actual_cost = dto.actualCost;
    if (dto.status) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const result = await this.db.query_builder()
      .from('rental_maintenance')
      .where('id', id)
      .update(updateData)
      .returning('*')
      .execute();

    // If maintenance completed, update vehicle status
    if (dto.status === 'completed') {
      const record = result[0];
      await this.updateVehicleStatus(record.vehicle_id, RentalStatus.AVAILABLE);
    }

    return result[0];
  }

  // ============================================
  // PRICING
  // ============================================

  async calculateRentalPrice(dto: CalculateRentalPriceDto) {
    const vehicle = await this.getVehicle(dto.vehicleId);

    // Calculate rental duration
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

    let basePrice = 0;

    switch (dto.rentalType) {
      case RentalType.HOURLY:
        basePrice = durationHours * vehicle.hourlyRate;
        break;
      case RentalType.DAILY:
        basePrice = durationDays * vehicle.dailyRate;
        break;
      case RentalType.WEEKLY:
        const weeks = Math.ceil(durationDays / 7);
        basePrice = weeks * (vehicle.weeklyRate || vehicle.dailyRate * 7);
        break;
      case RentalType.MONTHLY:
        const months = Math.ceil(durationDays / 30);
        basePrice = months * (vehicle.monthlyRate || vehicle.dailyRate * 30);
        break;
      default:
        basePrice = durationDays * vehicle.dailyRate;
    }

    // Apply dynamic pricing if configured
    const dynamicMultiplier = await this.getDynamicPriceMultiplier(dto.vehicleId, dto.startDate, dto.endDate);
    basePrice *= dynamicMultiplier;

    // Calculate addon price
    let addonPrice = 0;
    if (dto.addons && dto.addons.length > 0) {
      const addons = await this.getAddons(vehicle.shopId);
      const addonMap = new Map(addons.map((a: any) => [a.id, a]));

      for (const addon of dto.addons) {
        const addonDetails = addonMap.get(addon.addonId);
        if (addonDetails) {
          let addonCost = addonDetails.price * addon.quantity;
          if (addonDetails.pricing_type === RentalType.DAILY) {
            addonCost *= durationDays;
          }
          addonPrice += addonCost;
        }
      }
    }

    // Insurance price
    let insurancePrice = 0;
    if (dto.withInsurance && !vehicle.insuranceIncluded) {
      insurancePrice = (vehicle.insurancePrice || 0) * durationDays;
    }

    // Driver price (estimate)
    let driverPrice = 0;
    if (dto.withDriver) {
      // Assume driver costs 50% of daily rate per day
      driverPrice = (vehicle.dailyRate * 0.5) * durationDays;
    }

    // Apply coupon discount
    let discount = 0;
    if (dto.couponCode) {
      const couponDiscount = await this.applyCouponDiscount(dto.couponCode, basePrice + addonPrice);
      discount = couponDiscount;
    }

    const subtotal = basePrice + addonPrice + insurancePrice + driverPrice - discount;

    // Tax (assume 10% for now - should come from tax module)
    const taxRate = 0.10;
    const tax = subtotal * taxRate;

    const totalPrice = subtotal + tax;

    return {
      basePrice: Number(basePrice.toFixed(2)),
      addonPrice: Number(addonPrice.toFixed(2)),
      insurancePrice: Number(insurancePrice.toFixed(2)),
      driverPrice: Number(driverPrice.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
      securityDeposit: vehicle.securityDeposit || 0,
      duration: {
        days: durationDays,
        hours: durationHours,
      },
      rentalType: dto.rentalType,
    };
  }

  private async getDynamicPriceMultiplier(vehicleId: string, startDate: string, endDate: string): Promise<number> {
    // Check for seasonal pricing
    const pricing = await this.db.query_builder()
      .from('rental_dynamic_pricing')
      .select('*')
      .where('vehicle_id', vehicleId)
      .get();

    if (pricing.length === 0) return 1.0;

    const config = pricing[0];
    const seasonalPricing = JSON.parse(config.seasonal_pricing || '[]');

    const start = new Date(startDate);
    for (const season of seasonalPricing) {
      const seasonStart = new Date(season.startDate);
      const seasonEnd = new Date(season.endDate);
      if (start >= seasonStart && start <= seasonEnd) {
        return season.priceMultiplier;
      }
    }

    return 1.0;
  }

  private async applyCouponDiscount(couponCode: string, amount: number): Promise<number> {
    // This would integrate with the coupons module
    // For now, return 0
    return 0;
  }

  async setDynamicPricing(dto: SetDynamicPricingDto) {
    // Check if pricing exists
    const existing = await this.db.query_builder()
      .from('rental_dynamic_pricing')
      .select('id')
      .where('vehicle_id', dto.vehicleId)
      .get();

    const data = {
      vehicle_id: dto.vehicleId,
      seasonal_pricing: JSON.stringify(dto.seasonalPricing || []),
      day_of_week_pricing: JSON.stringify(dto.dayOfWeekPricing || []),
      demand_multiplier_max: dto.demandMultiplierMax || 50,
      updated_at: new Date().toISOString(),
    };

    if (existing.length > 0) {
      const result = await this.db.query_builder()
        .from('rental_dynamic_pricing')
        .where('id', existing[0].id)
        .update(data)
        .returning('*')
        .execute();
      return result[0];
    } else {
      const result = await this.db.query_builder()
        .from('rental_dynamic_pricing')
        .insert({ ...data, created_at: new Date().toISOString() })
        .returning('*')
        .execute();
      return result[0];
    }
  }

  // ============================================
  // AVAILABILITY
  // ============================================

  async checkVehicleAvailability(vehicleId: string, startDate: string, endDate: string, excludeBookingId?: string): Promise<boolean> {
    let query = this.db.query_builder()
      .from('rental_bookings')
      .select('id')
      .where('vehicle_id', vehicleId)
      .whereIn('status', [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.EXTENDED]);

    if (excludeBookingId) {
      query = query.where('id', '!=', excludeBookingId);
    }

    const overlapping = await query
      .where('start_date', '<=', endDate)
      .where('end_date', '>=', startDate)
      .get();

    if (overlapping.length > 0) return false;

    // Check unavailable dates
    const unavailable = await this.db.query_builder()
      .from('rental_unavailable_dates')
      .select('id')
      .where('vehicle_id', vehicleId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .get();

    return unavailable.length === 0;
  }

  async checkAvailability(dto: CheckAvailabilityDto) {
    const isAvailable = await this.checkVehicleAvailability(
      dto.vehicleId,
      dto.startDate,
      dto.endDate
    );

    return { available: isAvailable };
  }

  async setAvailability(dto: SetAvailabilityDto) {
    // Delete existing unavailable dates
    await this.db.query_builder()
      .from('rental_unavailable_dates')
      .where('vehicle_id', dto.vehicleId)
      .delete()
      .execute();

    // Insert new unavailable dates
    if (dto.unavailableDates.length > 0) {
      const records = dto.unavailableDates.map(d => ({
        vehicle_id: dto.vehicleId,
        date: d.date,
        reason: d.reason,
        created_at: new Date().toISOString(),
      }));

      await this.db.query_builder()
        .from('rental_unavailable_dates')
        .insert(records)
        .execute();
    }

    return { success: true };
  }

  async getVehicleCalendar(vehicleId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get bookings
    const bookings = await this.db.query_builder()
      .from('rental_bookings')
      .select('id', 'start_date', 'end_date', 'status')
      .where('vehicle_id', vehicleId)
      .where('start_date', '<=', endDate.toISOString())
      .where('end_date', '>=', startDate.toISOString())
      .whereIn('status', [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.ACTIVE, BookingStatus.EXTENDED])
      .get();

    // Get unavailable dates
    const unavailable = await this.db.query_builder()
      .from('rental_unavailable_dates')
      .select('date', 'reason')
      .where('vehicle_id', vehicleId)
      .where('date', '>=', startDate.toISOString())
      .where('date', '<=', endDate.toISOString())
      .get();

    // Get maintenance
    const maintenance = await this.db.query_builder()
      .from('rental_maintenance')
      .select('scheduled_date', 'type', 'status')
      .where('vehicle_id', vehicleId)
      .where('scheduled_date', '>=', startDate.toISOString())
      .where('scheduled_date', '<=', endDate.toISOString())
      .whereIn('status', ['scheduled', 'in_progress'])
      .get();

    return {
      bookings,
      unavailable,
      maintenance,
      month,
      year,
    };
  }

  // ============================================
  // REVIEWS
  // ============================================

  async createReview(dto: CreateRentalReviewDto, userId: string) {
    const booking = await this.getBooking(dto.bookingId, userId);

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }

    // Check if already reviewed
    const existing = await this.db.query_builder()
      .from('rental_reviews')
      .select('id')
      .where('booking_id', dto.bookingId)
      .get();

    if (existing.length > 0) {
      throw new ConflictException('Booking already reviewed');
    }

    const review = await this.db.query_builder()
      .from('rental_reviews')
      .insert({
        booking_id: dto.bookingId,
        vehicle_id: booking.vehicleId,
        user_id: userId,
        rating: dto.rating,
        comment: dto.comment,
        vehicle_condition_rating: dto.vehicleConditionRating,
        service_rating: dto.serviceRating,
        value_for_money_rating: dto.valueForMoneyRating,
        images: JSON.stringify(dto.images || []),
        created_at: new Date().toISOString(),
      })
      .returning('*')
      .execute();

    // Update vehicle rating
    await this.updateVehicleRating(booking.vehicleId);

    return review[0];
  }

  private async updateVehicleRating(vehicleId: string) {
    const reviews = await this.db.query_builder()
      .from('rental_reviews')
      .select('rating')
      .where('vehicle_id', vehicleId)
      .get();

    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length;

    await this.db.query_builder()
      .from('rental_vehicles')
      .where('id', vehicleId)
      .update({ rating: Number(avgRating.toFixed(2)) })
      .execute();
  }

  async getVehicleReviews(vehicleId: string, page: number = 1, limit: number = 20) {
    const offset = (page - 1) * limit;

    const reviews = await this.db.query_builder()
      .from('rental_reviews')
      .select('*')
      .where('vehicle_id', vehicleId)
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .offset(offset)
      .get();

    return reviews;
  }

  // ============================================
  // PROVIDER DASHBOARD
  // ============================================

  async getProviderDashboard(shopId: string, dto: ProviderDashboardDto) {
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (dto.period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'this_week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        startDate = dto.startDate ? new Date(dto.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = dto.endDate ? new Date(dto.endDate) : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get vehicles
    const vehicles = await this.db.query_builder()
      .from('rental_vehicles')
      .select('id', 'status')
      .where('shop_id', shopId)
      .get();

    // Get bookings
    const bookings = await this.db.query_builder()
      .from('rental_bookings')
      .select('*')
      .where('shop_id', shopId)
      .where('created_at', '>=', startDate.toISOString())
      .where('created_at', '<=', endDate.toISOString())
      .get();

    const totalRevenue = bookings
      .filter((b: any) => b.status === BookingStatus.COMPLETED)
      .reduce((sum: number, b: any) => sum + (parseFloat(b.total_price) || 0), 0);

    const activeBookings = bookings.filter((b: any) => b.status === BookingStatus.ACTIVE).length;
    const pendingBookings = bookings.filter((b: any) => b.status === BookingStatus.PENDING).length;
    const completedBookings = bookings.filter((b: any) => b.status === BookingStatus.COMPLETED).length;

    return {
      summary: {
        totalVehicles: vehicles.length,
        availableVehicles: vehicles.filter((v: any) => v.status === RentalStatus.AVAILABLE).length,
        rentedVehicles: vehicles.filter((v: any) => v.status === RentalStatus.RENTED).length,
        totalBookings: bookings.length,
        activeBookings,
        pendingBookings,
        completedBookings,
        totalRevenue: Number(totalRevenue.toFixed(2)),
      },
      period: { start: startDate.toISOString(), end: endDate.toISOString() },
    };
  }

  async getProviderEarnings(shopId: string, dto: ProviderEarningsDto) {
    let query = this.db.query_builder()
      .from('rental_bookings')
      .select('id', 'vehicle_id', 'total_price', 'status', 'created_at')
      .where('shop_id', shopId)
      .where('status', BookingStatus.COMPLETED);

    if (dto.vehicleId) {
      query = query.where('vehicle_id', dto.vehicleId);
    }
    if (dto.startDate) {
      query = query.where('created_at', '>=', dto.startDate);
    }
    if (dto.endDate) {
      query = query.where('created_at', '<=', dto.endDate);
    }

    const bookings = await query.orderBy('created_at', 'DESC').get();

    const totalEarnings = bookings.reduce((sum: number, b: any) => sum + (parseFloat(b.total_price) || 0), 0);

    // Group by vehicle
    const byVehicle: Record<string, number> = {};
    bookings.forEach((b: any) => {
      const vid = b.vehicle_id;
      if (!byVehicle[vid]) byVehicle[vid] = 0;
      byVehicle[vid] += parseFloat(b.total_price) || 0;
    });

    return {
      totalEarnings: Number(totalEarnings.toFixed(2)),
      totalBookings: bookings.length,
      byVehicle,
      bookings: bookings.map(this.formatBooking),
    };
  }

  // ============================================
  // HELPERS
  // ============================================

  private formatVehicle(vehicle: any): any {
    if (!vehicle) return null;
    return {
      id: vehicle.id,
      name: vehicle.name,
      description: vehicle.description,
      vehicleType: vehicle.vehicle_type,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      licensePlate: vehicle.license_plate,
      vin: vehicle.vin,
      fuelType: vehicle.fuel_type,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      doors: vehicle.doors,
      engineCapacity: vehicle.engine_capacity,
      mileage: vehicle.mileage,
      features: JSON.parse(vehicle.features || '[]'),
      images: JSON.parse(vehicle.images || '[]'),
      shopId: vehicle.shop_id,
      zoneId: vehicle.zone_id,
      hourlyRate: vehicle.hourly_rate,
      dailyRate: vehicle.daily_rate,
      weeklyRate: vehicle.weekly_rate,
      monthlyRate: vehicle.monthly_rate,
      securityDeposit: vehicle.security_deposit,
      kmLimit: vehicle.km_limit,
      extraKmCharge: vehicle.extra_km_charge,
      insuranceIncluded: vehicle.insurance_included,
      insurancePrice: vehicle.insurance_price,
      minAge: vehicle.min_age,
      minDrivingExperience: vehicle.min_driving_experience,
      requiresLicense: vehicle.requires_license,
      requiredDocuments: JSON.parse(vehicle.required_documents || '[]'),
      status: vehicle.status,
      rating: vehicle.rating,
      totalTrips: vehicle.total_trips,
      createdAt: vehicle.created_at,
    };
  }

  private formatBooking(booking: any): any {
    if (!booking) return null;
    return {
      id: booking.id,
      bookingNumber: booking.booking_number,
      vehicleId: booking.vehicle_id,
      userId: booking.user_id,
      shopId: booking.shop_id,
      startDate: booking.start_date,
      endDate: booking.end_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      rentalType: booking.rental_type,
      pickupLocation: booking.pickup_location,
      dropoffLocation: booking.dropoff_location,
      withDriver: booking.with_driver,
      withInsurance: booking.with_insurance,
      addons: JSON.parse(booking.addons || '[]'),
      couponCode: booking.coupon_code,
      basePrice: booking.base_price,
      addonPrice: booking.addon_price,
      insurancePrice: booking.insurance_price,
      driverPrice: booking.driver_price,
      discount: booking.discount,
      tax: booking.tax,
      totalPrice: booking.total_price,
      securityDeposit: booking.security_deposit,
      status: booking.status,
      paymentStatus: booking.payment_status,
      notes: booking.notes,
      createdAt: booking.created_at,
    };
  }

  private formatTrip(trip: any): any {
    if (!trip) return null;
    return {
      id: trip.id,
      bookingId: trip.booking_id,
      vehicleId: trip.vehicle_id,
      userId: trip.user_id,
      startMileage: trip.start_mileage,
      endMileage: trip.end_mileage,
      startLocation: trip.start_location,
      endLocation: trip.end_location,
      distanceTraveled: trip.distance_traveled,
      extraKmCharge: trip.extra_km_charge,
      damageCharge: trip.damage_charge,
      status: trip.status,
      startedAt: trip.started_at,
      endedAt: trip.ended_at,
    };
  }
}
