<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHass } from '../../composables/useHass'

const { entities, hassService } = useHass()

const allScenes = computed(() =>
  Object.values(entities.value)
    .filter(e => e.entity_id.startsWith('scene.'))
    .sort((a, b) => (a.attributes.friendly_name ?? a.entity_id).localeCompare(b.attributes.friendly_name ?? b.entity_id))
)

const sceneGridRows = computed(() => Math.ceil(allScenes.value.length / 2))

/* Track which scene buttons are in their "fired" flash state */
const firedScenes = ref<Set<string>>(new Set())

function activateScene(entityId: string): void {
  hassService('scene', 'turn_on', { entity_id: entityId })
  firedScenes.value.add(entityId)
  firedScenes.value = new Set(firedScenes.value)
  globalThis.setTimeout(() => {
    firedScenes.value.delete(entityId)
    firedScenes.value = new Set(firedScenes.value)
  }, 600)
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Buttons</h2>
    </div>

    <!-- Scenes -->
    <div>
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Scenes</p>
      <div v-if="allScenes.length === 0" class="py-4 text-center text-sm text-text-muted">
        No scenes available
      </div>
      <div v-else class="grid grid-cols-2 grid-flow-col gap-3" :style="{ gridTemplateRows: `repeat(${sceneGridRows}, auto)` }">
        <button
          v-for="scene in allScenes"
          :key="scene.entity_id"
          class="scene-btn flex items-center rounded-2xl border p-4 cursor-pointer text-left select-none"
          :class="firedScenes.has(scene.entity_id)
            ? 'bg-cat-buttons-soft border-cat-buttons/30 scene-fired'
            : 'bg-surface-card border-border-subtle'"
          @click="activateScene(scene.entity_id)"
        >
          <p class="text-sm font-medium text-text-primary">{{ scene.attributes.friendly_name ?? scene.entity_id }}</p>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scene-btn {
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;
}

.scene-btn:active {
  transform: scale(0.95);
}

.scene-btn.scene-fired {
  animation: scene-flash 600ms ease-out;
}

@keyframes scene-flash {
  0%   { transform: scale(0.95); }
  30%  { transform: scale(1.02); }
  100% { transform: scale(1); }
}
</style>
