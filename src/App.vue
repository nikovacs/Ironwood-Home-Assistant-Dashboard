<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import GreetingHeader from './components/GreetingHeader.vue'
import CategoryButton from './components/CategoryButton.vue'
import CriticalBanner from './components/CriticalBanner.vue'
import LightingPanel from './components/panels/LightingPanel.vue'
import AudioPanel from './components/panels/AudioPanel.vue'
import AlarmPanel from './components/panels/AlarmPanel.vue'
import CCTVPanel from './components/panels/CCTVPanel.vue'
import AlertsPanel from './components/panels/AlertsPanel.vue'
import ClimatePanel from './components/panels/ClimatePanel.vue'
import ButtonsPanel from './components/panels/ButtonsPanel.vue'
import IconBell from './components/icons/IconBell.vue'
import IconLightbulb from './components/icons/IconLightbulb.vue'
import IconTap from './components/icons/IconTap.vue'
import IconSpeaker from './components/icons/IconSpeaker.vue'
import IconShield from './components/icons/IconShield.vue'
import IconCamera from './components/icons/IconCamera.vue'
import IconThermometer from './components/icons/IconThermometer.vue'

interface Category {
  id: string
  icon: Component
  label: string
  color: string
}

const activeCategory = ref<string | null>(null)
const isExpanded = computed<boolean>(() => activeCategory.value !== null)

const categories: Category[] = [
  { id: 'alerts',   icon: IconBell,      label: 'Alerts',   color: 'alerts' },
  { id: 'lighting', icon: IconLightbulb, label: 'Lighting', color: 'lighting' },
  { id: 'buttons',  icon: IconTap,       label: 'Buttons',  color: 'buttons' },
  { id: 'audio',    icon: IconSpeaker,   label: 'Audio',    color: 'audio' },
  { id: 'alarm',    icon: IconShield,    label: 'Alarm',    color: 'alarm' },
  { id: 'cctv',     icon: IconCamera,      label: 'CCTV',     color: 'cctv' },
  { id: 'climate',  icon: IconThermometer, label: 'Climate',  color: 'climate' },
]

function selectCategory(id: string): void {
  activeCategory.value = activeCategory.value === id ? null : id
}

const panelComponents: Record<string, Component> = {
  alerts: AlertsPanel,
  lighting: LightingPanel,
  audio: AudioPanel,
  alarm: AlarmPanel,
  cctv: CCTVPanel,
  climate: ClimatePanel,
  buttons: ButtonsPanel,
}
const activePanel = computed<Component | undefined>(() =>
  activeCategory.value ? panelComponents[activeCategory.value] : undefined
)
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col bg-surface-primary">
    <GreetingHeader />

    <!-- Critical alert banner -->
    <CriticalBanner />

    <!-- Category buttons — height shrinks when panel is open -->
    <div class="buttons-area" :class="{ compact: isExpanded }">
      <div class="buttons-row">
        <div v-for="cat in categories" :key="cat.id" class="btn-cell">
          <CategoryButton
            :icon="cat.icon"
            :label="cat.label"
            :color="cat.color"
            :active="activeCategory === cat.id"
            :compact="isExpanded"
            @select="selectCategory(cat.id)"
          />
        </div>
      </div>
    </div>

    <!-- Panel — grows to fill remaining space -->
    <div
      class="panel-area rounded-t-3xl border-t bg-surface-panel"
      :class="isExpanded ? 'is-open border-border-subtle' : 'border-transparent'"
    >
      <div class="overflow-y-auto px-5 pt-5 pb-8 h-full">
        <KeepAlive>
          <component :is="activePanel" :key="activeCategory" />
        </KeepAlive>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Button area: takes up most of the screen by default,
  shrinks to a small strip when the panel opens.
  We use flex-basis + max-height (both animatable).
*/
.buttons-area {
  flex: 1 1 auto;
  display: flex;
  align-items: start;
  padding: 1.5rem 2.5rem 1rem;
  transition: flex 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.buttons-area.compact {
  flex: 0 0 auto;
}

/*
  The button grid. Always 4 columns.
  Default: 2 rows, buttons span 2 cols each → 2×2 look.
  Compact: 1 row, buttons span 1 col each → 1×4.
*/
.buttons-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
  transition: gap 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.buttons-area.compact .buttons-row {
  gap: 0.5rem;
}

/*
  Each button cell.
  Default: spans 2 columns, explicit height for square look.
  Compact: spans 1 column, shorter height.
*/
/* Closing transition (compact → default): slower */
.btn-cell {
  grid-column: span 2;
  height: calc((100dvh - 8rem - 4rem - 4.5rem) / 4);
  padding: 0.5rem;
  transition:
    height 1000ms cubic-bezier(0.4, 0, 0.2, 1),
    padding 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Opening transition (default → compact): faster */
.buttons-area.compact .btn-cell {
  grid-column: span 1;
  height: 5rem;
  padding: 0.25rem;
  transition:
    height 400ms cubic-bezier(0.4, 0, 0.2, 1),
    padding 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cell > * {
  width: 100%;
  height: 100%;
}

/*
  Panel: hidden by default, slides up and grows.
  Uses max-height for animatable open/close.
*/
.panel-area {
  flex: 0 1 0px;
  min-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    flex 800ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 600ms ease;
}

.panel-area.is-open {
  flex: 1 1 0px;
  opacity: 1;
}
</style>
