<script setup lang="ts">
import { ref, computed } from 'vue'
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

/** Arc gradient: low-temp end (minus) and high-temp end (plus). Match arc gradient in ClimateTemperatureArc. */
const gradientLowColor: Record<string, string> = {
  cool: '#1e40af',
  heat: '#fca5a5',
  auto: '#93c5fd',
  heat_cool: '#93c5fd',
  off: '#e5e7eb',
  dry: '#e5e7eb',
  fan_only: '#e5e7eb',
}
const gradientHighColor: Record<string, string> = {
  cool: '#93c5fd',
  heat: '#b91c1c',
  auto: '#b91c1c',
  heat_cool: '#b91c1c',
  off: '#4b5563',
  dry: '#4b5563',
  fan_only: '#4b5563',
}

const minusRingColor = computed(() => gradientLowColor[props.zone.mode] ?? gradientLowColor.off)
const plusRingColor = computed(() => gradientHighColor[props.zone.mode] ?? gradientHighColor.off)

const STEP_DEBOUNCE_MS = 50
const lastStepAt = ref(0)

function stepDown(): void {
  const now = Date.now()
  if (now - lastStepAt.value < STEP_DEBOUNCE_MS) {
    return
  }
  lastStepAt.value = now
  const t = props.zone.targetTemp ?? props.zone.min_temp
  const next = Math.max(props.zone.min_temp, t - props.zone.temperature_step)
  emit('update:temperature', next)
}

function stepUp(): void {
  const now = Date.now()
  if (now - lastStepAt.value < STEP_DEBOUNCE_MS) {
    return
  }
  lastStepAt.value = now
  const t = props.zone.targetTemp ?? props.zone.max_temp
  const next = Math.min(props.zone.max_temp, t + props.zone.temperature_step)
  emit('update:temperature', next)
}

function blurAfterDelay(el: EventTarget | null): void {
  if (el instanceof HTMLElement) {
    setTimeout(() => el.blur(), 120)
  }
}
</script>

<template>
  <div class="climate-zone-control-root flex flex-col h-full min-h-0">
    <div class="flex shrink-0 items-center gap-3">
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

    <div class="climate-detail-scroll flex min-h-0 flex-1 flex-col items-center overflow-x-hidden ">
      <div class="climate-detail-readout flex shrink-0 justify-center text-center -mb-8 sm:-mb-0">
        <div>
          <p class="text-sm text-text-muted uppercase tracking-wide pt-4 sm:pt-0">Current</p>
          <p class="relative inline-block text-3xl font-bold text-text-primary tabular-nums sm:text-4xl md:text-5xl">
            <template v-if="props.zone.currentTemp !== null">
              <span>{{ props.zone.currentTemp }}</span>
              <span class="absolute left-full top-0">°</span>
            </template>
            <template v-else>—</template>
          </p>
        </div>
      </div>

      <div class="climate-arc-wrapper -mb-10 flex min-h-0 flex-1 items-center justify-center">
        <div class="climate-arc-slot min-h-0 w-full max-w-full flex-1 relative">
          <ClimateTemperatureArc
            :model-value="props.zone.targetTemp"
            :min="props.zone.min_temp"
            :max="props.zone.max_temp"
            :step="props.zone.temperature_step"
            :mode="props.zone.mode"
            @update:model-value="emit('update:temperature', $event)"
          />
          <!-- Target temp inside the arc: center by digits only, ° to the right -->
          <div
            class="climate-arc-center pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <span
              class="relative inline-block text-8xl font-bold tabular-nums"
              :class="modeTargetTempClass[props.zone.mode] ?? 'text-text-muted'"
            >
              <template v-if="props.zone.targetTemp !== null">
                <span>{{ props.zone.targetTemp }}</span>
                <span class="absolute left-full top-0">°</span>
              </template>
              <template v-else>—</template>
            </span>
          </div>
        </div>
      </div>

      <!-- Fine-tune buttons directly below the arc (z-10 so they stay clickable when arc overlaps) -->
      <div class="climate-arc-step-buttons relative z-10 -mt-8 flex shrink-0 items-center justify-center gap-4 sm:-mt-3">
        <button
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-text-secondary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:hover:border-border-subtle disabled:hover:bg-surface-card sm:h-14 sm:w-14"
          :style="{ '--tw-ring-color': minusRingColor, '--tw-ring-offset-color': 'var(--color-surface-primary)' }"
          :disabled="props.zone.targetTemp !== null && props.zone.targetTemp <= props.zone.min_temp"
          aria-label="Decrease temperature"
          @click="(e) => { stepDown(); blurAfterDelay(e.currentTarget) }"
        >
          <span class="text-2xl font-medium leading-none sm:text-3xl">−</span>
        </button>
        <button
          type="button"
          class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-text-secondary hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:hover:border-border-subtle disabled:hover:bg-surface-card sm:h-14 sm:w-14"
          :style="{ '--tw-ring-color': plusRingColor, '--tw-ring-offset-color': 'var(--color-surface-primary)' }"
          :disabled="props.zone.targetTemp !== null && props.zone.targetTemp >= props.zone.max_temp"
          aria-label="Increase temperature"
          @click="(e) => { stepUp(); blurAfterDelay(e.currentTarget) }"
        >
          <span class="text-2xl font-medium leading-none sm:text-3xl">+</span>
        </button>
      </div>

      <p class="mt-2 shrink-0 text-sm text-text-muted sm:mt-4">Drag arc or use buttons to set temperature</p>

      <div class="climate-detail-modes mt-4 flex shrink-0 flex-wrap justify-center gap-3 sm:mt-4">
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
  position: relative;
  z-index: 0;
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
