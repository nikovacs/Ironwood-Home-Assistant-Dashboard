<script setup lang="ts">
import IconChevronLeft from './icons/IconChevronLeft.vue'
import ClimateTemperatureArc from './ClimateTemperatureArc.vue'

export interface ClimateZoneControlData {
  entity_id: string
  name: string
  currentTemp: number | null
  targetTemp: number | null
  mode: string
  hvac_modes: string[]
  min_temp: number
  max_temp: number
  temperature_step: number
}

const props = defineProps<{
  zone: ClimateZoneControlData
}>()

const emit = defineEmits<{
  back: []
  'update:temperature': [value: number]
  'update:hvacMode': [value: string]
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

const modeTargetTempClass: Record<string, string> = {
  heat: 'text-red-600 dark:text-red-400',
  cool: 'text-blue-600 dark:text-blue-400',
  off: 'text-text-muted',
  auto: 'text-blue-600 dark:text-blue-400',
  heat_cool: 'text-blue-600 dark:text-blue-400',
  dry: 'text-text-muted',
  fan_only: 'text-text-muted',
}
</script>

<template>
  <div class="climate-zone-control-root flex flex-col h-full min-h-0">
    <div class="flex shrink-0 items-center gap-3 pb-3">
      <button
        type="button"
        class="flex items-center justify-center rounded-xl p-2.5 -ml-2 text-text-secondary hover:bg-surface-card hover:text-text-primary transition-colors"
        aria-label="Back to zones"
        @click="emit('back')"
      >
        <IconChevronLeft class="h-7 w-7" />
      </button>
      <h2 class="text-xl font-semibold text-text-primary truncate">{{ props.zone.name }}</h2>
    </div>

    <div class="climate-detail-scroll flex min-h-0 flex-1 flex-col items-center overflow-x-hidden px-5 py-4">
      <div class="climate-detail-readout flex shrink-0 gap-8 text-center sm:gap-12">
        <div>
          <p class="text-sm text-text-muted uppercase tracking-wide">Current</p>
          <p class="text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
            {{ props.zone.currentTemp !== null ? `${props.zone.currentTemp}°` : '—' }}
          </p>
        </div>
        <div>
          <p class="text-sm text-text-muted uppercase tracking-wide">Target</p>
          <p
            class="text-3xl font-bold sm:text-4xl md:text-5xl"
            :class="modeTargetTempClass[props.zone.mode] ?? 'text-text-muted'"
          >
            {{ props.zone.targetTemp !== null ? `${props.zone.targetTemp}°` : '—' }}
          </p>
        </div>
      </div>

      <div class="climate-arc-wrapper flex min-h-0 flex-1 items-center justify-center">
        <div class="climate-arc-slot min-h-0 w-full max-w-full flex-1">
          <ClimateTemperatureArc
            :model-value="props.zone.targetTemp"
            :min="props.zone.min_temp"
            :max="props.zone.max_temp"
            :step="props.zone.temperature_step"
            :mode="props.zone.mode"
            @update:model-value="emit('update:temperature', $event)"
          />
        </div>
      </div>

      <p class="mt-2 shrink-0 text-sm text-text-muted sm:mt-4">Drag to set temperature</p>

      <div class="climate-detail-modes mt-4 flex shrink-0 flex-wrap justify-center gap-3 sm:mt-8">
        <button
          v-for="mode in props.zone.hvac_modes"
          :key="mode"
          type="button"
          class="rounded-xl px-5 py-3 text-base font-medium transition-colors"
          :class="props.zone.mode === mode
            ? (modeStyle[mode] ?? modeStyle.off)
            : 'bg-surface-card border border-border-subtle text-text-secondary hover:border-border-subtle hover:text-text-primary'"
          @click="emit('update:hvacMode', mode)"
        >
          {{ modeLabel[mode] ?? mode }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.climate-zone-control-root {
  width: 100%;
}
.climate-detail-scroll {
  overflow: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.climate-detail-scroll::-webkit-scrollbar {
  display: none;
}
.climate-arc-wrapper {
  align-self: stretch;
  min-width: 0;
}
.climate-arc-slot {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 0;
}
.climate-arc-slot > * {
  width: 100% !important;
  height: 100% !important;
  min-width: 0;
  min-height: 0;
}
</style>
