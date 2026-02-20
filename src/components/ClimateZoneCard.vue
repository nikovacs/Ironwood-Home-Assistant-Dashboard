<script setup lang="ts">
import type { Component } from 'vue'

export interface ClimateZoneCardData {
  entity_id: string
  name: string
  icon: Component
  currentTemp: number | null
  targetTemp: number | null
  mode: string
  available: boolean
}

const props = defineProps<{
  zone: ClimateZoneCardData
}>()

defineEmits<{
  click: []
}>()

const modeLabel: Record<string, string> = {
  heat: 'Heating',
  cool: 'Cooling',
  off: 'Off',
  auto: 'Auto',
  heat_cool: 'Heat/Cool',
  dry: 'Dry',
  fan_only: 'Fan',
}

const modeStyle: Record<string, string> = {
  heat: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cool: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  off: 'bg-surface-card text-text-muted',
  auto: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  heat_cool: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  dry: 'bg-surface-card text-text-muted',
  fan_only: 'bg-surface-card text-text-muted',
}

const modeCardClass: Record<string, string> = {
  heat: 'bg-red-100 border-red-300/50 dark:bg-red-900/30 dark:border-red-700/50',
  cool: 'bg-blue-100 border-blue-300/50 dark:bg-blue-900/30 dark:border-blue-700/50',
  off: 'bg-surface-card border-border-subtle',
  auto: 'bg-blue-100 border-blue-300/50 dark:bg-blue-900/30 dark:border-blue-700/50',
  heat_cool: 'bg-blue-100 border-blue-300/50 dark:bg-blue-900/30 dark:border-blue-700/50',
  dry: 'bg-surface-card border-border-subtle',
  fan_only: 'bg-surface-card border-border-subtle',
}

const modeIconClass: Record<string, string> = {
  heat: 'text-red-600 dark:text-red-400',
  cool: 'text-blue-600 dark:text-blue-400',
  off: 'text-text-secondary',
  auto: 'text-blue-600 dark:text-blue-400',
  heat_cool: 'text-blue-600 dark:text-blue-400',
  dry: 'text-text-secondary',
  fan_only: 'text-text-secondary',
}
</script>

<template>
  <button
    type="button"
    class="climate-zone-card flex min-h-[4.5rem] min-w-0 flex-1 cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 active:scale-[0.98] sm:min-h-0 sm:flex-1 sm:flex-col sm:justify-center sm:gap-3 sm:text-center sm:p-5"
    :class="props.zone.mode !== 'off' && props.zone.available
      ? (modeCardClass[props.zone.mode] ?? modeCardClass.off)
      : modeCardClass.off"
    :disabled="!props.zone.available"
    @click="props.zone.available && $emit('click')"
  >
    <component
      :is="props.zone.icon"
      class="h-10 w-10 shrink-0 sm:h-12 sm:w-12"
      :class="modeIconClass[props.zone.mode] ?? modeIconClass.off"
    />
    <div class="min-w-0 flex-1 sm:w-full sm:flex-initial sm:text-center">
      <p class="text-base font-semibold text-text-primary truncate sm:text-lg">{{ props.zone.name }}</p>
      <p class="text-sm text-text-secondary sm:text-base">
        <template v-if="props.zone.available">
          <template v-if="props.zone.currentTemp !== null">{{ props.zone.currentTemp }}°</template>
          <template v-else>—</template>
          →
          <template v-if="props.zone.targetTemp !== null">{{ props.zone.targetTemp }}°</template>
          <template v-else>—</template>
        </template>
        <template v-else>Unavailable</template>
      </p>
    </div>
    <span
      v-if="props.zone.available"
      class="inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-sm font-medium sm:px-4 sm:py-2 sm:text-base"
      :class="modeStyle[props.zone.mode] ?? modeStyle.off"
    >
      {{ modeLabel[props.zone.mode] ?? 'Off' }}
    </span>
  </button>
</template>
