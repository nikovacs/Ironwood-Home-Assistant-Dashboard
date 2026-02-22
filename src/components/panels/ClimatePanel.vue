<script setup lang="ts">
/* global fetch */
import { ref, computed, onMounted, shallowRef, type Component } from 'vue'
import YAML from 'yaml'
import { useHass } from '../../composables/useHass'
import IconSofa from '../icons/IconSofa.vue'
import IconBed from '../icons/IconBed.vue'
import IconMonitor from '../icons/IconMonitor.vue'
import IconHome from '../icons/IconHome.vue'
import ClimateZoneCard from '../ClimateZoneCard.vue'
import ClimateZoneControl from '../ClimateZoneControl.vue'

interface ZoneConfig {
  entity_id: string
  name?: string
}

/** Entity shape in YAML: static config only (state/temps come from HA at runtime). */
interface TestEntity {
  state?: string
  attributes: Record<string, unknown>
}

/** Single config file: zones and optional entities (example/test data). */
interface ClimateConfigFile {
  zones?: ZoneConfig[]
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
/** When using test data, local overrides so temp/mode/fan changes update the UI. */
const testDataOverrides = ref<Record<string, { temperature?: number, hvac_mode?: string, fan_mode?: string }>>({})

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
    const overrideFan = overrides[zc.entity_id]?.fan_mode
    const fanMode = (overrideFan ?? attrs.fan_mode ?? 'auto') as string
    const name = zc.name ?? attrs.friendly_name ?? zc.entity_id
    return {
      entity_id: zc.entity_id,
      name,
      icon: zoneIcons[i] ?? IconHome,
      currentTemp: currentTemp !== null ? Math.round(Number(currentTemp)) : null,
      targetTemp: targetTemp !== null ? Math.round(Number(targetTemp)) : null,
      mode: hvacMode,
      fan_mode: fanMode,
      available: entity !== null,
      hvac_modes: (attrs.hvac_modes as string[] | undefined) ?? ['heat', 'cool', 'off'],
      fan_modes: (attrs.fan_modes as string[] | undefined) ?? ['auto', 'on'],
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

function setFanMode(entityId: string, fanMode: string): void {
  if (testEntityData.value[entityId] !== undefined && entities.value[entityId] === undefined) {
    testDataOverrides.value = {
      ...testDataOverrides.value,
      [entityId]: { ...testDataOverrides.value[entityId], fan_mode: fanMode },
    }
  }
  hassService('climate', 'set_fan_mode', { entity_id: entityId, fan_mode: fanMode })
}

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}climate-zones.yaml`)
    if (res.ok) {
      const text = await res.text()
      const data = YAML.parse(text) as ClimateConfigFile
      const list = Array.isArray(data?.zones) ? data.zones : []
      zonesConfig.value = list.length > 0 ? list.slice(0, MAX_ZONES) : DUMMY_ZONES
      testEntityData.value = data?.entities ?? {}
    } else {
      zonesConfig.value = DUMMY_ZONES
      testEntityData.value = {}
    }
  } catch {
    zonesConfig.value = DUMMY_ZONES
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
          <h2 class="text-xl font-semibold text-text-primary">Climate</h2>
          <span class="text-sm text-text-muted">{{ activeZonesCount }} zone{{ activeZonesCount === 1 ? '' : 's' }} active</span>
        </div>

        <div v-if="zones.length === 0" class="flex-1 py-8 text-center text-sm text-text-muted">
          <p>No zones configured.</p>
          <p class="mt-1 text-xs">Add <code class="rounded bg-surface-card px-1">public/climate-zones.yaml</code> with a <code class="rounded bg-surface-card px-1">zones</code> list (and optional <code class="rounded bg-surface-card px-1">entities</code> for example/test data) to match your Venstar/HA setup.</p>
        </div>

        <div v-else class="flex min-h-0 flex-1 flex-col overflow-auto py-1 sm:items-center sm:justify-center sm:overflow-hidden">
          <div class="flex min-h-0 w-full flex-1 flex-col gap-4 sm:flex-initial sm:grid sm:max-h-full sm:w-full sm:aspect-square sm:grid-cols-2 sm:grid-rows-2 sm:gap-4" style="grid-template-rows: repeat(2, minmax(0, 1fr));">
            <ClimateZoneCard
              v-for="zone in zones"
              :key="zone.entity_id"
              :zone="zone"
              @click="selectZone(zone.entity_id)"
            />
          </div>
        </div>
      </div>

      <!-- Paned: single zone full-view with fine-tuned controls -->
      <ClimateZoneControl
        v-else-if="selectedZone"
        key="detail"
        class="climate-view-root"
        :zone="selectedZone"
        @back="backToList"
        @update:temperature="(temp) => selectedZone && setTemperature(selectedZone.entity_id, temp)"
        @update:hvac-mode="(mode) => selectedZone && setHvacMode(selectedZone.entity_id, mode)"
        @update:fan-mode="(fanMode) => selectedZone && setFanMode(selectedZone.entity_id, fanMode)"
      />
    </Transition>
  </div>
</template>

<style scoped>
.climate-panel-root {
  position: relative;
}
.climate-panel-root :deep(.climate-view-root) {
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
