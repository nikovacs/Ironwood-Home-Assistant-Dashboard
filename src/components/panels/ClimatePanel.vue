<script setup lang="ts">
/* global fetch */
import { ref, computed, onMounted, shallowRef, type Component } from 'vue'
import YAML from 'yaml'
import { useHass } from '../../composables/useHass'
import IconSofa from '../icons/IconSofa.vue'
import IconBed from '../icons/IconBed.vue'
import IconMonitor from '../icons/IconMonitor.vue'
import IconHome from '../icons/IconHome.vue'
import IconChevronLeft from '../icons/IconChevronLeft.vue'
import ClimateTemperatureArc from '../ClimateTemperatureArc.vue'

interface ZoneConfig {
  entity_id: string
  name?: string
}

interface ZoneConfigFile {
  zones: ZoneConfig[]
}

/** Test entity shape (standalone YAML); mirrors HA entity for fallback. */
interface TestEntity {
  state: string
  attributes: Record<string, unknown>
}

interface ClimateTestDataFile {
  entities?: Record<string, TestEntity>
}

const MAX_ZONES = 4
const zoneIcons: Component[] = [IconSofa, IconBed, IconMonitor, IconHome]

/** Fallback zones when config fetch fails (e.g. offline); entities show as unavailable. */
const DUMMY_ZONES: ZoneConfig[] = [
  { entity_id: 'climate.living_room', name: 'Living Room' },
  { entity_id: 'climate.bedroom', name: 'Bedroom' },
  { entity_id: 'climate.office', name: 'Office' },
  { entity_id: 'climate.guest_room', name: 'Guest Room' },
]

const zonesConfig = shallowRef<ZoneConfig[]>([])
const selectedZoneEntityId = ref<string | null>(null)
const testEntityData = shallowRef<Record<string, TestEntity>>({})
/** When using test data, local overrides so temp/mode changes update the UI. */
const testDataOverrides = ref<Record<string, { temperature?: number, hvac_mode?: string }>>({})

const { entities, hassService } = useHass()

const zones = computed(() => {
  const list = zonesConfig.value.slice(0, MAX_ZONES)
  const overrides = testDataOverrides.value
  return list.map((zc, i) => {
    const realEntity = entities.value[zc.entity_id] ?? null
    const testEntity = testEntityData.value[zc.entity_id] ?? null
    const entity = realEntity ?? testEntity
    const attrs = entity?.attributes ?? {}
    const override = overrides[zc.entity_id]
    const state = (override?.hvac_mode ?? entity?.state) ?? 'unavailable'
    const currentTemp = attrs.current_temperature ?? null
    const targetTemp = (override?.temperature !== undefined ? override.temperature : attrs.temperature) ?? null
    const hvacMode = (state === 'unavailable' ? 'off' : state) as 'heat' | 'cool' | 'off' | 'auto' | 'heat_cool' | 'dry' | 'fan_only'
    const name = zc.name ?? attrs.friendly_name ?? zc.entity_id
    return {
      entity_id: zc.entity_id,
      name,
      icon: zoneIcons[i] ?? IconHome,
      currentTemp: currentTemp !== null ? Math.round(Number(currentTemp)) : null,
      targetTemp: targetTemp !== null ? Math.round(Number(targetTemp)) : null,
      mode: hvacMode,
      available: entity !== null,
      hvac_modes: (attrs.hvac_modes as string[] | undefined) ?? ['heat', 'cool', 'off'],
      min_temp: attrs.min_temp !== null ? Number(attrs.min_temp) : 50,
      max_temp: attrs.max_temp !== null ? Number(attrs.max_temp) : 90,
      temperature_step: attrs.target_temp_step !== null ? Number(attrs.target_temp_step) : 1,
    }
  })
})

const selectedZone = computed(() =>
  selectedZoneEntityId.value
    ? zones.value.find(z => z.entity_id === selectedZoneEntityId.value) ?? null
    : null
)

const activeZonesCount = computed(() =>
  zones.value.filter(z => z.available && z.mode !== 'off').length
)

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
  heat: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  cool: 'bg-cat-climate-soft text-cat-climate',
  off: 'bg-surface-card text-text-muted',
  auto: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  heat_cool: 'bg-cat-climate-soft text-cat-climate',
  dry: 'bg-surface-card text-text-muted',
  fan_only: 'bg-surface-card text-text-muted',
}

function selectZone(entityId: string): void {
  selectedZoneEntityId.value = entityId
}

function backToList(): void {
  selectedZoneEntityId.value = null
}

function setHvacMode(entityId: string, hvacMode: string): void {
  if (testEntityData.value[entityId] !== undefined && entities.value[entityId] === undefined) {
    testDataOverrides.value = {
      ...testDataOverrides.value,
      [entityId]: { ...testDataOverrides.value[entityId], hvac_mode: hvacMode },
    }
  }
  hassService('climate', 'set_hvac_mode', { entity_id: entityId, hvac_mode: hvacMode })
}

function setTemperature(entityId: string, temperature: number): void {
  if (testEntityData.value[entityId] !== undefined && entities.value[entityId] === undefined) {
    testDataOverrides.value = {
      ...testDataOverrides.value,
      [entityId]: { ...testDataOverrides.value[entityId], temperature },
    }
  }
  hassService('climate', 'set_temperature', { entity_id: entityId, temperature })
}

function onTemperatureChange(temp: number): void {
  if (!selectedZone.value) {
    return
  }
  setTemperature(selectedZone.value.entity_id, temp)
}

onMounted(async () => {
  let list: ZoneConfig[] = []
  try {
    const yamlRes = await fetch('/climate-zones.yaml')
    if (yamlRes.ok) {
      const text = await yamlRes.text()
      const data = YAML.parse(text) as ZoneConfigFile
      list = Array.isArray(data?.zones) ? data.zones : []
    }
    if (list.length === 0) {
      const jsonRes = await fetch('/climate-zones.json')
      if (jsonRes.ok) {
        const data = (await jsonRes.json()) as ZoneConfigFile
        list = Array.isArray(data.zones) ? data.zones : []
      }
    }
    zonesConfig.value = list.length > 0 ? list.slice(0, MAX_ZONES) : DUMMY_ZONES
  } catch {
    zonesConfig.value = DUMMY_ZONES
  }

  try {
    const testRes = await fetch('/climate-test-data.yaml')
    if (testRes.ok) {
      const text = await testRes.text()
      const data = YAML.parse(text) as ClimateTestDataFile
      testEntityData.value = data?.entities ?? {}
    }
  } catch {
    testEntityData.value = {}
  }
})
</script>

<template>
  <div class="climate-panel-root flex flex-col h-full min-h-0">
    <Transition name="climate-view" mode="out-in">
      <!-- Zone list (readonly): up to 4 zones; tap to pane into full view -->
      <div
        v-if="!selectedZoneEntityId"
        key="list"
        class="climate-view-root flex flex-col h-full min-h-0"
      >
        <div class="flex shrink-0 items-center justify-between">
          <h2 class="text-lg font-semibold text-text-primary">Climate</h2>
          <span class="text-xs text-text-muted">{{ activeZonesCount }} zones active</span>
        </div>

        <div v-if="zones.length === 0" class="flex-1 py-8 text-center text-sm text-text-muted">
          <p>No zones configured.</p>
          <p class="mt-1 text-xs">Add up to 4 climate entity_ids in <code class="rounded bg-surface-card px-1">public/climate-zones.yaml</code> (or <code class="rounded bg-surface-card px-1">.json</code>) to match your Venstar/HA setup.</p>
        </div>

        <div v-else class="flex min-h-0 flex-1 flex-col overflow-auto py-1 sm:items-center sm:justify-center sm:overflow-hidden">
          <div class="flex min-h-0 w-full flex-1 flex-col gap-3 sm:flex-initial sm:grid sm:max-h-full sm:w-full sm:aspect-square sm:grid-cols-2 sm:grid-rows-2 sm:gap-3" style="grid-template-rows: repeat(2, minmax(0, 1fr));">
            <button
              v-for="zone in zones"
              :key="zone.entity_id"
              type="button"
              class="climate-zone-card flex min-h-[4.5rem] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 active:scale-[0.98] sm:min-h-0 sm:flex-1 sm:flex-col sm:justify-center sm:text-center"
              :class="zone.mode !== 'off' && zone.available
                ? 'bg-cat-climate-soft border-cat-climate/30'
                : 'bg-surface-card border-border-subtle'"
              :disabled="!zone.available"
              @click="zone.available && selectZone(zone.entity_id)"
            >
              <component
                :is="zone.icon"
                class="h-8 w-8 shrink-0 sm:h-8 sm:w-8"
                :class="zone.mode !== 'off' && zone.available ? 'text-cat-climate' : 'text-text-secondary'"
              />
              <div class="min-w-0 flex-1 sm:w-full sm:flex-initial sm:text-center">
                <p class="text-sm font-medium text-text-primary truncate">{{ zone.name }}</p>
                <p class="text-xs text-text-secondary">
                  <template v-if="zone.available">
                    <template v-if="zone.currentTemp !== null">{{ zone.currentTemp }}°</template>
                    <template v-else>—</template>
                    →
                    <template v-if="zone.targetTemp !== null">{{ zone.targetTemp }}°</template>
                    <template v-else>—</template>
                  </template>
                  <template v-else>Unavailable</template>
                </p>
              </div>
              <span
                v-if="zone.available"
                class="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium"
                :class="modeStyle[zone.mode] ?? modeStyle.off"
              >
                {{ modeLabel[zone.mode] ?? 'Off' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Paned: single zone full-view with fine-tuned controls -->
      <div
        v-else-if="selectedZone"
        key="detail"
        class="climate-view-root flex flex-col h-full min-h-0"
      >
        <div class="flex shrink-0 items-center gap-3 pb-2">
          <button
            type="button"
            class="flex items-center justify-center rounded-xl p-2 -ml-2 text-text-secondary hover:bg-surface-card hover:text-text-primary transition-colors"
            aria-label="Back to zones"
            @click="backToList"
          >
            <IconChevronLeft class="h-6 w-6" />
          </button>
          <h2 class="text-lg font-semibold text-text-primary truncate">{{ selectedZone.name }}</h2>
        </div>

        <div class="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 py-4">
          <!-- Current / target readout -->
          <div class="mb-4 flex shrink-0 gap-8 text-center">
            <div>
              <p class="text-xs text-text-muted uppercase tracking-wide">Current</p>
              <p class="text-2xl font-semibold text-text-primary">
                {{ selectedZone.currentTemp !== null ? `${selectedZone.currentTemp}°` : '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-text-muted uppercase tracking-wide">Target</p>
              <p class="text-2xl font-semibold text-cat-climate">
                {{ selectedZone.targetTemp !== null ? `${selectedZone.targetTemp}°` : '—' }}
              </p>
            </div>
          </div>

          <!-- Arc temperature control (standalone component; stops pointer propagation) -->
          <ClimateTemperatureArc
            :model-value="selectedZone.targetTemp"
            :min="selectedZone.min_temp"
            :max="selectedZone.max_temp"
            :step="selectedZone.temperature_step"
            :mode="selectedZone.mode"
            @update:model-value="onTemperatureChange"
          />

          <p class="mt-3 text-xs text-text-muted">Drag to set temperature</p>

          <!-- HVAC mode -->
          <div class="mt-6 flex shrink-0 flex-wrap justify-center gap-2">
            <button
              v-for="mode in selectedZone.hvac_modes"
              :key="mode"
              type="button"
              class="rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              :class="selectedZone.mode === mode
                ? (modeStyle[mode] ?? 'bg-cat-climate-soft text-cat-climate')
                : 'bg-surface-card border border-border-subtle text-text-secondary hover:border-border-subtle hover:text-text-primary'"
              @click="setHvacMode(selectedZone.entity_id, mode)"
            >
              {{ modeLabel[mode] ?? mode }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.climate-panel-root {
  position: relative;
}
.climate-view-root {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.climate-view-enter-active,
.climate-view-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.climate-view-enter-from,
.climate-view-leave-to {
  opacity: 0;
  transform: translateY(0.5rem);
}
.climate-view-enter-to,
.climate-view-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
