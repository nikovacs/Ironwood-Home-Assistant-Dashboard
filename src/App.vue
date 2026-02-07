<script setup lang="ts">
import { ref, computed, type Component } from 'vue'
import GreetingHeader from './components/GreetingHeader.vue'
import CategoryButton from './components/CategoryButton.vue'
import LightingPanel from './components/panels/LightingPanel.vue'
import AudioPanel from './components/panels/AudioPanel.vue'
import AlarmPanel from './components/panels/AlarmPanel.vue'
import CCTVPanel from './components/panels/CCTVPanel.vue'

interface Category {
  id: string
  icon: string
  label: string
  color: string
}

const activeCategory = ref<string | null>(null)
const isExpanded = computed<boolean>(() => activeCategory.value !== null)

const categories: Category[] = [
  { id: 'lighting', icon: '💡', label: 'Lighting', color: 'lighting' },
  { id: 'audio',    icon: '🔊', label: 'Audio',    color: 'audio' },
  { id: 'alarm',    icon: '🛡️', label: 'Alarm',    color: 'alarm' },
  { id: 'cctv',     icon: '📹', label: 'CCTV',     color: 'cctv' },
]

function selectCategory(id: string): void {
  activeCategory.value = activeCategory.value === id ? null : id
}

const panelComponents: Record<string, Component> = {
  lighting: LightingPanel,
  audio: AudioPanel,
  alarm: AlarmPanel,
  cctv: CCTVPanel,
}
const activePanel = computed<Component | undefined>(() =>
  activeCategory.value ? panelComponents[activeCategory.value] : undefined
)
</script>

<template>
  <div class="flex min-h-[100dvh] flex-col bg-surface-primary">
    <!-- Greeting header -->
    <GreetingHeader />

    <!-- Category buttons -->
    <div
      class="px-5 transition-all duration-500 ease-out"
      :class="isExpanded ? 'pb-3' : 'flex-1 flex items-start pt-4'"
    >
      <!-- 2-column grid (collapsed) → single row (expanded) -->
      <div
        class="w-full transition-all duration-500 ease-out"
        :class="isExpanded
          ? 'grid grid-cols-4 gap-2'
          : 'grid grid-cols-2 gap-3'"
      >
        <CategoryButton
          v-for="cat in categories"
          :key="cat.id"
          :icon="cat.icon"
          :label="cat.label"
          :color="cat.color"
          :active="activeCategory === cat.id"
          :compact="isExpanded"
          @select="selectCategory(cat.id)"
        />
      </div>
    </div>

    <!-- Expanded panel -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-8"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-8"
      mode="out-in"
    >
      <div
        v-if="isExpanded"
        :key="activeCategory"
        class="flex-1 overflow-y-auto rounded-t-3xl border-t border-border-subtle bg-surface-panel px-5 pt-5 pb-8"
      >
        <component :is="activePanel" />
      </div>
    </Transition>
  </div>
</template>
