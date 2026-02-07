<script setup lang="ts">
import { useGreeting } from '../composables/useGreeting'
import { useTheme } from '../composables/useTheme'

const { greeting, timeString, dateString } = useGreeting()
const { isDark, toggle } = useTheme()

interface Props {
  weatherTemp?: string
  weatherCondition?: string
  weatherIcon?: string
}

withDefaults(defineProps<Props>(), {
  weatherTemp: '72°F',
  weatherCondition: 'Partly Cloudy',
  weatherIcon: '⛅',
})
</script>

<template>
  <header class="px-5 pt-6 pb-4">
    <!-- Top row: greeting + theme toggle -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-text-primary">{{ greeting }}</h1>
        <p class="mt-0.5 text-sm text-text-secondary">{{ dateString }}</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-2xl font-light tabular-nums text-text-primary">{{ timeString }}</span>
        <button
          @click="toggle"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-surface-card text-lg border border-border-subtle
                 active:scale-95 transition-transform duration-150"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>
      </div>
    </div>

    <!-- Weather strip -->
    <div class="mt-4 flex items-center gap-3 rounded-2xl bg-surface-card border border-border-subtle px-4 py-3">
      <span class="text-3xl">{{ weatherIcon }}</span>
      <div class="flex-1">
        <span class="text-lg font-medium text-text-primary">{{ weatherTemp }}</span>
        <p class="text-xs text-text-secondary">{{ weatherCondition }}</p>
      </div>
    </div>
  </header>
</template>
