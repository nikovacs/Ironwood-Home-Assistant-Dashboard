<script setup lang="ts">
import type { Component } from 'vue'
import { useGreeting } from '../composables/useGreeting'
import { useTheme } from '../composables/useTheme'
import IconCloudSun from './icons/IconCloudSun.vue'
import IconSun from './icons/IconSun.vue'

interface Props {
  weatherTemp?: string
  weatherIcon?: Component
  hideExtras?: boolean
}

interface ForecastDay {
  day: string
  high: string
  icon: Component
}

withDefaults(defineProps<Props>(), {
  weatherTemp: '72°',
  weatherIcon: () => IconCloudSun,
  hideExtras: false,
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
  <header class="header-container">
    <div class="flex items-center justify-between">
      <!-- Left: time -->
      <div class="header-slot">
        <Transition name="header-extra">
          <span v-if="!hideExtras" class="text-3xl font-light tabular-nums text-text-primary">{{ timeString }}</span>
        </Transition>
      </div>

      <!-- Center: greeting + date -->
      <div class="text-center">
        <h1 class="text-3xl font-semibold text-text-primary">{{ greeting }}</h1>
        <p class="mt-1 text-sm text-text-secondary">{{ dateString }}</p>
      </div>

      <!-- Right: weather -->
      <div class="header-slot flex justify-end">
        <Transition name="header-extra">
          <div v-if="!hideExtras" class="flex items-center gap-2">
            <component :is="weatherIcon" class="h-8 w-8 text-text-primary" />
            <span class="text-3xl font-light text-text-primary">{{ weatherTemp }}</span>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Mini forecast -->
    <Transition name="forecast">
      <div v-if="!hideExtras" class="mt-3 flex justify-center gap-6">
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
    </Transition>
  </header>
</template>

<style scoped>
.header-container {
  padding: 2rem 1.25rem 1rem;
}

.header-slot {
  flex: 1;
  min-width: 0;
}

.header-extra-enter-active {
  transition:
    opacity 400ms ease,
    transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.header-extra-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.header-extra-enter-from,
.header-extra-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.forecast-enter-active {
  transition:
    max-height 400ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 300ms ease;
  max-height: 4rem;
  overflow: hidden;
}

.forecast-leave-active {
  transition:
    max-height 150ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 100ms ease;
  max-height: 4rem;
  overflow: hidden;
}

.forecast-enter-from,
.forecast-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
