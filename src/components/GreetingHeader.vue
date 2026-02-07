<script setup lang="ts">
import { useGreeting } from '../composables/useGreeting'
import { useTheme } from '../composables/useTheme'

const { greeting, timeString, dateString } = useGreeting()
useTheme()

interface Props {
  weatherTemp?: string
  weatherIcon?: string
}

withDefaults(defineProps<Props>(), {
  weatherTemp: '72°',
  weatherIcon: '⛅',
})
</script>

<template>
  <header class="px-5 pt-6 pb-2">
    <div class="flex items-center justify-between">
      <!-- Left: time -->
      <div class="flex-1">
        <span class="text-2xl font-light tabular-nums text-text-primary">{{ timeString }}</span>
      </div>

      <!-- Center: greeting + date -->
      <div class="text-center">
        <h1 class="text-xl font-semibold text-text-primary">{{ greeting }}</h1>
        <p class="mt-0.5 text-xs text-text-secondary">{{ dateString }}</p>
      </div>

      <!-- Right: weather -->
      <div class="flex-1 flex items-center justify-end gap-1.5">
        <span class="text-base">{{ weatherIcon }}</span>
        <span class="text-sm font-medium text-text-primary">{{ weatherTemp }}</span>
      </div>
    </div>
  </header>
</template>
