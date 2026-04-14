import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MapsService } from './maps.service';

/**
 * Maps endpoints.
 *
 *   GET /api/v1/config/maps              — frontend bootstrap (public)
 *   GET /api/v1/maps/geocode?address=... — geocode an address
 *   GET /api/v1/maps/reverse?lat=..&lng=.. — reverse geocode
 *
 * All three are publicly reachable (no auth) because the frontend's
 * `<Map>` component calls `/config/maps` on page load to know which
 * provider to bootstrap, and the geocode endpoints are used during
 * vendor/delivery-address entry forms that are available to guests.
 *
 * Rate limiting should be applied via a global interceptor in
 * production — not in scope for this PR.
 */
@ApiTags('maps')
@Controller()
export class MapsController {
  constructor(private readonly maps: MapsService) {}

  @Get('config/maps')
  @ApiOperation({ summary: 'Frontend maps bootstrap config' })
  getFrontendConfig() {
    return this.maps.getFrontendConfig();
  }

  @Get('maps/geocode')
  @ApiOperation({ summary: 'Geocode an address to coordinates' })
  @ApiQuery({ name: 'address', required: true })
  @ApiQuery({ name: 'country', required: false })
  async geocode(
    @Query('address') address: string,
    @Query('country') country?: string,
  ) {
    if (!address) throw new BadRequestException('address query param required');
    return this.maps.geocode({ address, countryCode: country });
  }

  @Get('maps/reverse')
  @ApiOperation({ summary: 'Reverse-geocode coordinates to an address' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  async reverse(@Query('lat') lat: string, @Query('lng') lng: string) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      throw new BadRequestException('lat and lng must be numbers');
    }
    return this.maps.reverseGeocode({ lat: latNum, lng: lngNum });
  }
}
