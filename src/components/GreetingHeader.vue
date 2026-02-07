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
        <span class="text-3xl">{{ weatherIcon }}</span>
        <span class="text-3xl font-light text-text-primary">{{ weatherTemp }}</span>
      </div>
    </div>
  </header>
</template>
