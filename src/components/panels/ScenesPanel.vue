<script setup lang="ts">
import { ref } from 'vue'

interface Scene {
  id: number
  name: string
  description: string
  active: boolean
}

const scenes = ref<Scene[]>([
  { id: 1, name: 'Good Morning', description: 'Lights on, blinds up, coffee maker', active: false },
  { id: 2, name: 'Movie Night', description: 'Dim lights, TV on, blinds down', active: false },
  { id: 3, name: 'Away Mode', description: 'Lights off, alarm armed, thermostat eco', active: true },
  { id: 4, name: 'Bedtime', description: 'Lights off, doors locked, alarm home', active: false },
  { id: 5, name: 'Guest Mode', description: 'Entry lights on, guest Wi-Fi enabled', active: false },
  { id: 6, name: 'Focus', description: 'Office lights bright, DND on, music off', active: false },
])

function toggleScene(scene: Scene): void {
  scene.active = !scene.active
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Scenes</h2>
      <span class="text-xs text-text-muted">{{ scenes.filter(s => s.active).length }} active</span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="scene in scenes"
        :key="scene.id"
        class="flex flex-col items-start gap-1.5 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.97] cursor-pointer text-left"
        :class="scene.active
          ? 'bg-cat-scenes-soft border-cat-scenes/30'
          : 'bg-surface-card border-border-subtle'"
        @click="toggleScene(scene)"
      >
        <p class="text-sm font-medium text-text-primary">{{ scene.name }}</p>
        <p class="text-xs text-text-secondary leading-snug">{{ scene.description }}</p>
        <span
          class="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          :class="scene.active
            ? 'bg-cat-scenes/20 text-cat-scenes'
            : 'bg-surface-button-active text-text-muted'"
        >
          {{ scene.active ? 'Running' : 'Activate' }}
        </span>
      </button>
    </div>
  </div>
</template>
