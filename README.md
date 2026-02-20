# HA Dashboard

Vue 3 + Vite dashboard for Home Assistant.

## Climate panel

The Climate panel shows up to **4 zones** (e.g. Venstar thermostats via the Venstar HACS integration). Zone data is loaded from a single config file; live state comes from Home Assistant over the WebSocket connection.

### How it works

1. **Config** — On load, the app fetches **climate-zones.yaml** from `public/`. The file contains zone definitions and, optionally, example/test entity data in the same place.
2. **List view** — Up to 4 zones appear as read-only cards (current temp, target temp, HVAC mode). Data is from your HA climate entities, or from the `entities` section in the config when HA is missing.
3. **Paned view** — Tap a zone to open the full-panel view with controls: set temperature (arc) and change mode (heat/cool/off/auto, etc.). Service calls go to HA when connected; with test data only, changes update the UI locally.

### Config file format

Place **climate-zones.yaml** in `public/`. It is the only file: zones and optional example/test data live together.

**Required: `zones`** — List up to 4 climate entity_ids:

```yaml
zones:
  - entity_id: climate.living_room   # Your HA climate entity_id
    name: Living Room                 # Optional display name
  - entity_id: climate.bedroom
    name: Bedroom
  # ... up to 4 zones
```

**Optional: `entities`** — Example and fallback data when HA is not available. Use it as the example to copy from, and the panel uses it whenever the real HA entity is missing (e.g. offline). Entity IDs must match your `zones`:

```yaml
entities:
  climate.living_room:
    state: cool
    attributes:
      current_temperature: 72
      temperature: 73
      hvac_modes: [heat, cool, off, auto]
      min_temp: 50
      max_temp: 90
      target_temp_step: 1
      friendly_name: Living Room
  # ... one block per zone (optional)
```

- **entity_id** (in zones) — Must match a climate entity in Home Assistant (e.g. from Venstar; check **Developer tools → States**).
- **name** (in zones) — Optional; used as the zone label. If omitted, the entity’s friendly name is used.

The **public/climate-zones.yaml** in this repo includes both `zones` and `entities` so it works as the example and as test data when running without HA.

### Offline / failed fetch

If the config file cannot be loaded (e.g. wrong path), the panel uses **dummy zones** (Living Room, Bedroom, Office, Guest Room) so you can still test the UI. With `entities` in your config, those zones show the mock data and controls work locally; without it they show as “Unavailable” until HA is connected.

### Deploying with Home Assistant

- **Standalone** (app served at its own URL): `public/` is the doc root, so `fetch('/climate-zones.yaml')` works.
- **Served by HA** (e.g. from `config/www/`): Put the file in `config/www/` and use path `/local/climate-zones.yaml` in the app (requires changing the fetch URL in the code to `/local/climate-zones.yaml`).

## Weather

The header and bottom weather/clock card show **live weather** from [Open-Meteo](https://open-meteo.com/) (free, no API key). Location is set via a YAML config so the dashboard can run without Home Assistant weather entities.

### Config

Place **weather.yaml** in `public/` (same place as `climate-zones.yaml`):

```yaml
# Required: latitude and longitude of your location
latitude: 40.6782
longitude: -75.4992

# Optional: refresh interval in minutes (default: 15). Open-Meteo allows 10k requests/day.
# update_interval_minutes: 15

# Optional: OpenWeatherMap API key for AQI. Prefer .env (see below); if omitted everywhere, AQI shows "—".
# openweathermap_api_key: "your-api-key"
```

- **latitude** / **longitude** — Required. Coordinates for weather and AQI.
- **update_interval_minutes** — How often to refetch. Default 15 minutes (96 requests/day, well under the 10k/day limit for 24/7 use).
- **openweathermap_api_key** — Optional. When set (here or via env), AQI is fetched from [OpenWeatherMap Air Pollution API](https://openweathermap.org/api/air-pollution) (free tier: 1000 calls/day). Display uses their scale 1–5 (Good, Fair, Moderate, Poor, Very Poor). For security (e.g. when committing to GitHub), prefer setting **`VITE_OPENWEATHERMAP_API_KEY`** in a `.env` file (and add `.env` to `.gitignore`); the app uses the env value if the key is not in the YAML.

If the file is missing or invalid, the UI shows a short error or “—” until the config is fixed.

---

This template uses Vue 3 `<script setup>` SFCs; see the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup). Learn more in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
