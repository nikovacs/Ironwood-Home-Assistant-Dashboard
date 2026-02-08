<script setup lang="ts">
import { shallowRef, type Component } from 'vue'
import IconSofa from '../icons/IconSofa.vue'
import IconBed from '../icons/IconBed.vue'
import IconMonitor from '../icons/IconMonitor.vue'

interface Zone {
  name: string
  icon: Component
  currentTemp: number
  targetTemp: number
  mode: 'heat' | 'cool' | 'off'
}

const zones = shallowRef<Zone[]>([
  { name: 'Living Room', icon: IconSofa, currentTemp: 72, targetTemp: 73, mode: 'cool' },
  { name: 'Bedroom', icon: IconBed, currentTemp: 68, targetTemp: 67, mode: 'cool' },
  { name: 'Office', icon: IconMonitor, currentTemp: 71, targetTemp: 72, mode: 'heat' },
])

function cycleMode(zone: Zone): void {
  const modes: Zone['mode'][] = ['heat', 'cool', 'off']
  const idx = modes.indexOf(zone.mode)
  zone.mode = modes[(idx + 1) % modes.length]
  zones.value = [...zones.value]
}

const modeLabel: Record<Zone['mode'], string> = {
  heat: 'Heating',
  cool: 'Cooling',
  off: 'Off',
}

const modeStyle: Record<Zone['mode'], string> = {
  heat: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  cool: 'bg-cat-climate-soft text-cat-climate',
  off: 'bg-surface-card text-text-muted',
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Climate</h2>
      <span class="text-xs text-text-muted">{{ zones.filter(z => z.mode !== 'off').length }} zones active</span>
    </div>

    <div class="space-y-3">
      <button
        v-for="zone in zones"
        :key="zone.name"
        class="flex w-full items-center gap-4 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.98] cursor-pointer"
        :class="zone.mode !== 'off'
          ? 'bg-cat-climate-soft border-cat-climate/30'
          : 'bg-surface-card border-border-subtle'"
        @click="cycleMode(zone)"
      >
        <component :is="zone.icon" class="h-6 w-6 shrink-0" :class="zone.mode !== 'off' ? 'text-cat-climate' : 'text-text-secondary'" />

        <div class="flex-1 text-left">
          <p class="text-sm font-medium text-text-primary">{{ zone.name }}</p>
          <p class="text-xs text-text-secondary">{{ zone.currentTemp }}° → {{ zone.targetTemp }}°</p>
        </div>

        <span
          class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
          :class="modeStyle[zone.mode]"
        >
          {{ modeLabel[zone.mode] }}
        </span>
      </button>
    </div>
  </div>
</template>
