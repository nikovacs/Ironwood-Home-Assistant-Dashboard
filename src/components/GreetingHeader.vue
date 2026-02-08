<script setup lang="ts">
import type { Component } from 'vue'
import { useGreeting } from '../composables/useGreeting'
import { useTheme } from '../composables/useTheme'
import IconCloudSun from './icons/IconCloudSun.vue'
import IconSun from './icons/IconSun.vue'

interface Props {
  weatherTemp?: string
  weatherIcon?: Component
}

interface ForecastDay {
  day: string
  high: string
  icon: Component
}

withDefaults(defineProps<Props>(), {
  weatherTemp: '72°',
  weatherIcon: () => IconCloudSun,
})

const { greeting, timeString, dateString } = useGreeting()
useTheme()

const forecast: ForecastDay[] = [
  { day: 'Today', high: '72°', icon: IconCloudSun },
  { day: 'Mon',   high: '68°', icon: IconCloudSun },
  { day: 'Tue',   high: '75°', icon: IconSun },
  { day: 'Wed',   high: '70°', icon: IconCloudSun },
]
</script>

<template>
  <header class="px-5 pt-8 pb-4">
    <div class="flex items-center justify-between">
      <!-- Left: time -->
      <div class="flex-1">
        <span class="text-3xl font-light tabular-nums text-text-primary">{{ timeString }}</span>
      </div>

      <!-- Center: greeting + date -->
      <div class="text-center">
        <h1 class="text-2xl font-semibold text-text-primary">{{ greeting }}</h1>
        <p class="mt-1 text-sm text-text-secondary">{{ dateString }}</p>
      </div>

      <!-- Right: weather -->
      <div class="flex-1 flex items-center justify-end gap-2">
        <component :is="weatherIcon" class="h-8 w-8 text-text-primary" />
        <span class="text-3xl font-light text-text-primary">{{ weatherTemp }}</span>
      </div>
    </div>

    <!-- Mini forecast -->
    <div class="mt-3 flex justify-center gap-6">
      <div
        v-for="day in forecast"
        :key="day.day"
        class="flex flex-col items-center gap-1"
      >
        <span class="text-xs text-text-muted">{{ day.day }}</span>
        <component :is="day.icon" class="h-4 w-4 text-text-secondary" />
        <span class="text-xs font-medium tabular-nums text-text-secondary">{{ day.high }}</span>
      </div>
    </div>
  </header>
</template>
