<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useGreeting } from '../composables/useGreeting'
import IconCloudSun from './icons/IconCloudSun.vue'
import IconSun from './icons/IconSun.vue'
import IconDroplet from './icons/IconDroplet.vue'
import IconUV from './icons/IconUV.vue'
import IconWind from './icons/IconWind.vue'
import IconLeaf from './icons/IconLeaf.vue'

interface Props {
  weatherTemp?: string
  weatherIcon?: Component
  weatherCondition?: string
}

interface ForecastDay {
  day: string
  high: string
  low: string
  icon: Component
}

interface WeatherDetail {
  icon: Component
  label: string
  value: string
}

withDefaults(defineProps<Props>(), {
  weatherTemp: '72°',
  weatherIcon: () => IconCloudSun,
  weatherCondition: 'Partly Cloudy',
})

const { timeString } = useGreeting()

/* Parse the live date string for calendar rendering */
const now = computed(() => new Date())

const currentMonth = computed(() =>
  now.value.toLocaleDateString([], { month: 'long', year: 'numeric' })
)
const currentDay = computed(() => now.value.getDate())

/* Build a 6-row calendar grid for the current month */
const calendarDays = computed(() => {
  const y = now.value.getFullYear()
  const m = now.value.getMonth()
  const firstDay = new Date(y, m, 1).getDay()        // 0=Sun
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) { cells.push(null) }
  for (let d = 1; d <= daysInMonth; d++) { cells.push(d) }
  while (cells.length % 7 !== 0) { cells.push(null) }
  return cells
})

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const forecast: ForecastDay[] = [
  { day: 'Today', high: '72°', low: '58°', icon: IconCloudSun },
  { day: 'Mon',   high: '68°', low: '55°', icon: IconCloudSun },
  { day: 'Tue',   high: '75°', low: '60°', icon: IconSun },
  { day: 'Wed',   high: '70°', low: '54°', icon: IconCloudSun },
  { day: 'Thu',   high: '73°', low: '57°', icon: IconSun },
]

const weatherDetails: WeatherDetail[] = [
  { icon: IconUV,      label: 'UV',     value: '5 Mod' },
  { icon: IconDroplet,  label: 'Precip', value: '12%' },
  { icon: IconWind,     label: 'Wind',   value: '8 mph' },
  { icon: IconLeaf,     label: 'AQI',    value: '42 Good' },
]
</script>

<template>
  <div class="weather-clock-card">
    <!-- LEFT COLUMN: Clock + Calendar -->
    <div class="left-col">
      <!-- Clock -->
      <div>
        <p class="text-7xl font-extralight tabular-nums tracking-tight text-text-primary">
          {{ timeString }}
        </p>
      </div>

      <!-- Mini calendar -->
      <div class="calendar">
        <p class="text-sm font-semibold text-text-secondary mb-3">{{ currentMonth }}</p>
        <div class="cal-grid">
          <span
            v-for="lbl in dayLabels"
            :key="'h-' + lbl"
            class="cal-header"
          >{{ lbl }}</span>
          <span
            v-for="(day, i) in calendarDays"
            :key="'d-' + String(i)"
            class="cal-day"
            :class="{
              'is-today': day === currentDay,
              'is-empty': day === null,
            }"
          >{{ day ?? '' }}</span>
        </div>
      </div>
    </div>

    <!-- DIVIDER -->
    <div class="divider" />

    <!-- RIGHT COLUMN: Weather -->
    <div class="right-col">
      <!-- Current conditions -->
      <div class="flex items-center gap-4">
        <component :is="weatherIcon" class="h-16 w-16 text-text-primary" />
        <div>
          <span class="text-6xl font-light tabular-nums text-text-primary">{{ weatherTemp }}</span>
          <p class="text-base text-text-secondary mt-1">{{ weatherCondition }}</p>
        </div>
      </div>

      <!-- Detail stats -->
      <div class="detail-grid">
        <div
          v-for="d in weatherDetails"
          :key="d.label"
          class="detail-item"
        >
          <component :is="d.icon" class="h-5 w-5 text-text-muted" />
          <span class="text-sm text-text-muted">{{ d.label }}</span>
          <span class="text-sm font-medium tabular-nums text-text-secondary">{{ d.value }}</span>
        </div>
      </div>

      <!-- Forecast strip -->
      <div class="forecast-strip">
        <div
          v-for="day in forecast"
          :key="day.day"
          class="flex flex-col items-center gap-1"
        >
          <span class="text-xs font-medium text-text-muted">{{ day.day }}</span>
          <component :is="day.icon" class="h-6 w-6 text-text-secondary" />
          <span class="text-xs font-medium tabular-nums text-text-primary">{{ day.high }}</span>
          <span class="text-xs tabular-nums text-text-muted">{{ day.low }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-clock-card {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 2rem;
  align-items: center;
  width: 100%;
  height: 100%;
}

.left-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.75rem;
}

.divider {
  width: 1px;
  align-self: stretch;
  margin: 0.5rem 0;
  background: var(--color-border-subtle);
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Calendar */
.calendar {
  width: 100%;
  max-width: 18rem;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  text-align: center;
}

.cal-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  padding-bottom: 0.375rem;
}

.cal-day {
  font-size: 0.8rem;
  padding: 0.3rem 0;
  border-radius: 9999px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

.cal-day.is-today {
  background: var(--color-text-primary);
  color: var(--color-surface-primary);
  font-weight: 700;
}

.cal-day.is-empty {
  visibility: hidden;
}

/* Weather detail stats */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Forecast */
.forecast-strip {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
