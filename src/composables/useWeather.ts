/**
 * useWeather: fetches weather from Open-Meteo using public/weather.yaml.
 * Location is set via latitude + longitude in the YAML.
 * Open-Meteo is free, no API key, 10k requests/day (e.g. 15-min refresh = 96/day).
 */
import { ref, onMounted, shallowRef, type Component, type Ref, type ShallowRef } from 'vue'
import YAML from 'yaml'
import IconSun from '../components/icons/IconSun.vue'
import IconCloudSun from '../components/icons/IconCloudSun.vue'
import IconCloud from '../components/icons/IconCloud.vue'
import IconCloudRain from '../components/icons/IconCloudRain.vue'
import IconCloudLightning from '../components/icons/IconCloudLightning.vue'
import IconSnowflake from '../components/icons/IconSnowflake.vue'
import IconDroplet from '../components/icons/IconDroplet.vue'
import IconUV from '../components/icons/IconUV.vue'
import IconWind from '../components/icons/IconWind.vue'
import IconLeaf from '../components/icons/IconLeaf.vue'

const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast'
const OPENWEATHERMAP_AIR_POLLUTION_BASE = 'https://api.openweathermap.org/data/2.5/air_pollution'

interface WeatherConfig {
  latitude: number
  longitude: number
  update_interval_minutes?: number
  /** Optional. If set, AQI is fetched from OpenWeatherMap (free tier: 1000 calls/day). */
  openweathermap_api_key?: string
}

interface ForecastCurrent {
  temperature_2m: number
  relative_humidity_2m?: number
  weather_code: number
  precipitation?: number
  wind_speed_10m?: number
}

interface ForecastDaily {
  time: string[]
  weather_code: number[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  uv_index_max?: number[]
}

interface ForecastResponse {
  current?: ForecastCurrent
  daily?: ForecastDaily
  latitude?: number
  longitude?: number
}

// WMO weather codes → label and icon. See https://open-meteo.com/en/docs#weathervariables
function wmoToCondition(code: number): { label: string; icon: Component } {
  if (code === 0) return { label: 'Clear', icon: IconSun }
  if (code === 1) return { label: 'Mainly Clear', icon: IconSun }
  if (code === 2) return { label: 'Partly Cloudy', icon: IconCloudSun }
  if (code === 3) return { label: 'Overcast', icon: IconCloud }
  if (code === 45 || code === 48) return { label: 'Fog', icon: IconCloud }
  if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: IconCloudRain }
  if (code >= 61 && code <= 67) return { label: 'Rain', icon: IconCloudRain }
  if (code >= 71 && code <= 77) return { label: 'Snow', icon: IconSnowflake }
  if (code >= 80 && code <= 82) return { label: 'Showers', icon: IconCloudRain }
  if (code >= 85 && code <= 86) return { label: 'Snow Showers', icon: IconSnowflake }
  if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: IconCloudLightning }
  return { label: 'Unknown', icon: IconCloud }
}

// Shared state so all useWeather() callers see the same data
const config = shallowRef<WeatherConfig | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const current = shallowRef<{
  tempFormatted: string
  condition: string
  icon: Component
  humidity: number | null
  precip: number | null
  windMph: number | null
  uvIndex: number | null
  usAqi: number | null
} | null>(null)
const daily = shallowRef<{ day: string; high: string; low: string; icon: Component }[]>([])
const details = shallowRef<{ icon: Component; label: string; value: string }[]>([])

let refreshTimeout: ReturnType<typeof setTimeout> | null = null

function parseNum(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

async function loadConfig(): Promise<WeatherConfig | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}weather.yaml`)
    if (!res.ok) return null
    const text = await res.text()
    const data = YAML.parse(text) as Record<string, unknown>
    const lat = parseNum(data.latitude)
    const lon = parseNum(data.longitude)
    if (!lat || !lon) return null
    const yamlKey = typeof data.openweathermap_api_key === 'string' ? data.openweathermap_api_key.trim() : undefined
    const envKey = typeof import.meta.env.VITE_OPENWEATHERMAP_API_KEY === 'string'
      ? import.meta.env.VITE_OPENWEATHERMAP_API_KEY.trim()
      : undefined
    const owmKey = (yamlKey && yamlKey.length > 0) ? yamlKey : (envKey && envKey.length > 0 ? envKey : undefined)
    return {
      latitude: lat,
      longitude: lon,
      update_interval_minutes: typeof data.update_interval_minutes === 'number'
        ? data.update_interval_minutes
        : 15,
      openweathermap_api_key: owmKey,
    }
  } catch {
    return null
  }
}

async function fetchForecast(lat: number, lon: number): Promise<ForecastResponse | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,relative_humidity_2m,weather_code,precipitation,wind_speed_10m',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,uv_index_max',
    timezone: 'auto',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
  })
  const url = `${FORECAST_BASE}?${params.toString()}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return (await res.json()) as ForecastResponse
  } catch {
    return null
  }
}

/** OpenWeatherMap Air Pollution API returns AQI 1–5. */
interface OWMAirPollutionResponse {
  list?: { main?: { aqi?: number } }[]
}

async function fetchOpenWeatherMapAqi(lat: number, lon: number, apiKey: string): Promise<number | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    appid: apiKey,
  })
  const url = `${OPENWEATHERMAP_AIR_POLLUTION_BASE}?${params.toString()}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = (await res.json()) as OWMAirPollutionResponse
    const aqi = data.list?.[0]?.main?.aqi
    return typeof aqi === 'number' && aqi >= 1 && aqi <= 5 ? aqi : null
  } catch {
    return null
  }
}

/** OpenWeatherMap scale: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor. */
function owmAqiLabel(aqi: number): string {
  if (aqi <= 1) return 'Good'
  if (aqi <= 2) return 'Fair'
  if (aqi <= 3) return 'Moderate'
  if (aqi <= 4) return 'Poor'
  return 'Very Poor'
}

function applyForecast(data: ForecastResponse, aqi: number | null = null): void {
  const cur = data.current
  const d = data.daily
  if (!cur) {
    current.value = null
    details.value = []
    daily.value = []
    return
  }

  const { label, icon } = wmoToCondition(cur.weather_code)
  const tempFormatted = `${Math.round(cur.temperature_2m)}°`
  current.value = {
    tempFormatted,
    condition: label,
    icon,
    humidity: cur.relative_humidity_2m ?? null,
    precip: cur.precipitation ?? null,
    windMph: cur.wind_speed_10m ?? null,
    uvIndex: (d?.uv_index_max?.[0]) ?? null,
    usAqi: aqi ?? null,
  }

  const uvVal = current.value.uvIndex !== null && Number.isFinite(current.value.uvIndex)
    ? Math.round(current.value.uvIndex)
    : null
  const uvLabel = uvVal !== null ? (uvVal <= 2 ? 'Low' : uvVal <= 5 ? 'Mod' : 'High') : null
  const precipMm = current.value.precip
  const precipInches = precipMm !== null && Number.isFinite(precipMm) ? precipMm / 25.4 : null
  
  let precipStr;
  if (precipInches === null) {
    precipStr = '—';
  } else if (precipInches === 0) {
    precipStr = '0';
  } else if (precipInches < 0.01) {
    precipStr = '<0.01';
  } else {
    // Round to 2 decimals, then remove trailing zeros
    const rounded = Math.round(precipInches * 100) / 100;
    precipStr = rounded.toString();
  }

  const aqiValue = aqi !== null && Number.isFinite(aqi)
    ? (aqi >= 1 && aqi <= 5 ? `${aqi} ${owmAqiLabel(aqi)}` : '—')
    : '—'
  details.value = [
    { icon: IconUV, label: 'UV', value: uvVal !== null && uvLabel !== null ? `${uvVal} ${uvLabel}` : '—' },
    { icon: IconDroplet, label: 'Precip', value: precipStr === '—' ? '—' : `${precipStr} in` },
    { icon: IconWind, label: 'Wind', value: current.value.windMph !== null ? `${Math.round(current.value.windMph)} mph` : '—' },
    { icon: IconLeaf, label: 'AQI', value: aqiValue },
  ]

  if (!d?.time.length) {
    daily.value = []
    return
  }

  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  daily.value = d.time.slice(0, 6).map((dateStr, i) => {
    const code = d.weather_code[i] ?? 0
    const { icon: dayIcon } = wmoToCondition(code)
    let dayLabel: string
    if (i === 0 || dateStr === today) dayLabel = 'Today'
    else if (dateStr === tomorrowStr) dayLabel = 'Tmrw'
    else dayLabel = new Date(dateStr + 'T12:00:00').toLocaleDateString([], { weekday: 'short' })
    const high = d.temperature_2m_max[i]
    const low = d.temperature_2m_min[i]
    return {
      day: dayLabel,
      high: Number.isFinite(high) ? `${Math.round(high)}°` : '—',
      low: Number.isFinite(low) ? `${Math.round(low)}°` : '—',
      icon: dayIcon,
    }
  })
}

async function refresh(): Promise<void> {
  let cfg = config.value
  if (!cfg) {
    cfg = await loadConfig()
    config.value = cfg
  }
  if (!cfg) {
    loading.value = false
    error.value = 'No weather config: add public/weather.yaml with latitude and longitude'
    return
  }

  error.value = null
  const coords = { lat: cfg.latitude, lon: cfg.longitude }

  const owmKey = cfg.openweathermap_api_key
  const [forecastData, owmAqi] = await Promise.all([
    fetchForecast(coords.lat, coords.lon),
    owmKey ? fetchOpenWeatherMapAqi(coords.lat, coords.lon, owmKey) : Promise.resolve(null),
  ])
  loading.value = false
  if (!forecastData) {
    error.value = 'Failed to load weather'
    return
  }
  applyForecast(forecastData, owmAqi)

  // Schedule next refresh (singleton: only one timeout)
  const mins = config.value?.update_interval_minutes ?? 15
  if (refreshTimeout) clearTimeout(refreshTimeout)
  refreshTimeout = setTimeout(() => {
    refreshTimeout = null
    void refresh()
  }, mins * 60 * 1000)
}

export function useWeather(): {
  loading: Ref<boolean>
  error: Ref<string | null>
  current: ShallowRef<{
    tempFormatted: string
    condition: string
    icon: Component
    humidity: number | null
    precip: number | null
    windMph: number | null
    uvIndex: number | null
    usAqi: number | null
  } | null>
  details: ShallowRef<{ icon: Component; label: string; value: string }[]>
  daily: ShallowRef<{ day: string; high: string; low: string; icon: Component }[]>
  refresh: () => Promise<void>
} {
  onMounted(() => {
    void refresh()
  })

  return {
    loading,
    error,
    current,
    details,
    daily,
    refresh,
  }
}
