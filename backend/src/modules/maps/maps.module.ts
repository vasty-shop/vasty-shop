import { Module } from '@nestjs/common';
import { MapsService } from './maps.service';
import { MapsController } from './maps.controller';

/**
 * Maps module — exposes the pluggable MapsService for geocoding,
 * delivery-zone checks, and frontend map bootstrap.
 *
 * Pick a provider by setting MAPS_PROVIDER in your .env. See
 * `docs/providers/maps.md`.
 */
@Module({
  controllers: [MapsController],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
