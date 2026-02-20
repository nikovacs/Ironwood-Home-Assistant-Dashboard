# HA Dashboard

Vue 3 + Vite dashboard for Home Assistant.

## Climate panel

The Climate panel shows up to **4 zones** (e.g. Venstar thermostats via the Venstar HACS integration). Zone data is loaded from a config file and live state comes from Home Assistant over the WebSocket connection.

### How it works

1. **Config** — On load, the app fetches zone definitions from:
   - `climate-zones.yaml` (preferred), or
   - `climate-zones.json` (fallback)
2. **List view** — Up to 4 zones appear as read-only cards (current temp, target temp, HVAC mode). Data is from your HA climate entities.
3. **Paned view** — Tap a zone to open the full-panel view with controls: set temperature (−/+) and change mode (heat/cool/off/auto, etc.). Service calls go to HA (`climate.set_temperature`, `climate.set_hvac_mode`).

### Config file format

Place **climate-zones.yaml** (or **climate-zones.json**) in `public/` so it is served with the app. List up to 4 zones:

**YAML** (`public/climate-zones.yaml`):

```yaml
zones:
  - entity_id: climate.living_room   # Your HA climate entity_id
    name: Living Room                 # Optional display name
  - entity_id: climate.bedroom
    name: Bedroom
  # ... up to 4 zones
```

**JSON** (`public/climate-zones.json`):

```json
{
  "zones": [
    { "entity_id": "climate.living_room", "name": "Living Room" },
    { "entity_id": "climate.bedroom", "name": "Bedroom" }
  ]
}
```

- **entity_id** — Must match a climate entity in Home Assistant (e.g. from Venstar: `climate.venstar_living_room` or similar; check **Developer tools → States**).
- **name** — Optional; used as the zone label. If omitted, the entity’s friendly name is used.

An example file with comments is in **public/climate-zones.example.yaml**. Copy it to `climate-zones.yaml` and edit the `entity_id` values.

### Test data (no HA required)

To test the full flow without a Home Assistant instance, add **climate-test-data.yaml** in `public/`. It provides mock entity state and attributes for each zone. The panel loads it automatically and uses it whenever the real HA entity is missing (e.g. when disconnected). Entity IDs in the test file must match your zone config. See **public/climate-test-data.yaml** for the format and example data; changing temperature or mode in the paned view updates the UI locally when using test data.

### Offline / failed fetch

If the config file cannot be loaded (e.g. running offline or wrong path), the panel uses **dummy zones** (Living Room, Bedroom, Office, Guest Room) so you can still test the UI. With **climate-test-data.yaml** in place, those zones show full mock data and controls work locally; without it they show as “Unavailable” until HA is connected.

### Deploying with Home Assistant

- **Standalone** (app served at its own URL): `public/` is the doc root, so `fetch('/climate-zones.yaml')` works.
- **Served by HA** (e.g. from `config/www/`): Put the file in `config/www/` and use path `/local/climate-zones.yaml` in the app (requires changing the fetch URL in the code to `/local/climate-zones.yaml`).

---

This template uses Vue 3 `<script setup>` SFCs; see the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup). Learn more in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
