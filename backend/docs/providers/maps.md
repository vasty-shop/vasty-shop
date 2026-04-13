# Maps / geocoding providers

Vasty Shop supports four maps backends plus a `none` default for
geocoding, reverse-geocoding, delivery-zone containment, and frontend
tile rendering.

```
MAPS_PROVIDER=osm-leaflet   # zero-infra default
```

## Comparison

| Provider | Free tier | Signup | Infra | Tile quality | Geocoding accuracy | Best for |
|---|---|---|---|---|---|---|
| **osm-leaflet** *(default)* | ♾️ *(public rate-limited)* | none | none | good | good | dev, small self-hosted |
| **google-maps** | ~$200/month credit, then paid | credit card required | none | excellent | excellent | production where quality > cost |
| **mapbox** | 50k req/mo | free tier, no card | none | excellent, stylable | excellent | beautiful branded UI |
| **maptiler** | 100k tile req/mo | free tier, no card | none | OSM-based, polished | good | EU, middle-ground |
| **none** | — | — | — | — | — | maps features disabled |

## Which should I pick?

- **"I just want delivery zones to work"** → `osm-leaflet` (no signup, no keys)
- **Production with beautiful branded styling** → `mapbox`
- **EU deployment, don't want Google** → `maptiler`
- **Production where Google-grade accuracy matters more than cost** → `google-maps`
- **Not using maps yet** → leave `MAPS_PROVIDER` unset; the `<Map>` component should hide itself when `/config/maps` reports `provider: 'none'`

## Per-provider setup

### osm-leaflet (default)

No setup required. Defaults point at the free public Nominatim
instance and OpenStreetMap tile servers.

```
MAPS_PROVIDER=osm-leaflet
NOMINATIM_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=vasty-shop/1.0
OSM_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

**IMPORTANT — public Nominatim has strict rate limits:**

- Max 1 request/second per IP
- Must send a distinctive `User-Agent` header identifying your app
  (already set via `NOMINATIM_USER_AGENT`)
- Bulk geocoding is forbidden

For production traffic, self-host Nominatim (one command via Docker)
or switch to a paid provider. The public instance is fine for dev
and low-volume use.

**Same goes for the tile server** — point `OSM_TILE_URL` at your own
tile server (or a paid provider like MapTiler) for production.

### google-maps

Create a project at <https://console.cloud.google.com>, enable the
Geocoding API + Maps JavaScript API, create two API keys (one
server-restricted, one browser-restricted). Billing is required.

```
MAPS_PROVIDER=google-maps
GOOGLE_MAPS_API_KEY=AIza...           # server-only restricted
GOOGLE_MAPS_BROWSER_KEY=AIza...       # browser-restricted (optional;
                                       # defaults to GOOGLE_MAPS_API_KEY)
```

**Security note**: the backend only ever exposes the browser key to
the frontend via `/config/maps`. The server key stays in .env.

### mapbox

Sign up at <https://mapbox.com>, grab a public access token (starts
with `pk.`).

```
MAPS_PROVIDER=mapbox
MAPBOX_TOKEN=pk.ey...
MAPBOX_STYLE=mapbox://styles/mapbox/streets-v12   # optional
```

Mapbox public tokens are safe to expose to the browser — the frontend
uses the same token for tile requests. Customize the map style at
<https://studio.mapbox.com>.

### maptiler

Sign up at <https://maptiler.com>, grab an API key.

```
MAPS_PROVIDER=maptiler
MAPTILER_API_KEY=...
```

MapTiler serves OSM-based tiles with a polished SLA and generous
free tier. Good middle-ground between osm-leaflet and Google.

### none (default if unset)

Every method throws `MapsProviderNotConfiguredError`. The
`getFrontendConfig()` method returns `{ provider: 'none', extra:
{ disabled: true } }` so the frontend `<Map>` component can render
a "maps not configured" placeholder instead of crashing.

## Endpoints

This module exposes three public endpoints (no auth):

```
GET /api/v1/config/maps
    → FrontendMapsConfig — tile URL, attribution, public key, default center/zoom

GET /api/v1/maps/geocode?address=Gulshan+Dhaka&country=BD
    → GeocodeResult | null

GET /api/v1/maps/reverse?lat=23.78&lng=90.42
    → GeocodeResult | null
```

`config/maps` is called once on page load by the frontend to know
which provider to bootstrap. `geocode` / `reverse` are used during
vendor/delivery address entry forms.

**Rate limiting** should be applied via a global interceptor in
production to prevent abuse of the public Nominatim fall-through —
not in scope for this PR.

## Delivery zone containment (point-in-polygon)

The `MapsService.pointInZone(point, polygon)` method runs a pure
geometry ray-casting test. No provider API call is made — this is
local computation. Used by the delivery module to check whether a
customer address falls inside a shop's configured delivery polygon.

```ts
import { MapsService } from '@/modules/maps/maps.service';

class DeliveryService {
  constructor(private readonly maps: MapsService) {}

  async canDeliverTo(customerAddress: string, zone: DeliveryZone) {
    const geo = await this.maps.geocode({ address: customerAddress });
    if (!geo) return false;
    return this.maps.pointInZone(geo.location, zone.polygon);
  }
}
```

## Adding a new provider

1. Implement `MapsProvider` in
   `backend/src/modules/maps/providers/<name>.provider.ts`
2. Add a case to `createMapsProvider()` in `providers/index.ts`
3. Document env vars in this file and in `.env.example`
4. Add smoke-test coverage in
   `backend/scripts/smoke-test-maps-providers.ts`
