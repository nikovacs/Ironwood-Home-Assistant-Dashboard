<script setup lang="ts">
import { ref } from 'vue'

interface Track {
  title: string
  artist: string
}

interface Zone {
  name: string
  icon: string
  active: boolean
}

const isPlaying = ref<boolean>(true)
const currentTrack = ref<Track>({ title: 'Chill Vibes Mix', artist: 'Lofi Radio' })
const volume = ref<number>(65)

const zones = ref<Zone[]>([
  { name: 'Living Room', icon: '🛋️', active: true },
  { name: 'Kitchen', icon: '🍳', active: false },
  { name: 'Bedroom', icon: '🛏️', active: true },
  { name: 'Office', icon: '💻', active: false },
])

function toggleZone(zone: Zone): void {
  zone.active = !zone.active
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Home Audio</h2>
      <span class="text-xs text-text-muted">{{ zones.filter(z => z.active).length }} zones</span>
    </div>

    <!-- Now playing -->
    <div class="rounded-2xl border border-border-subtle bg-surface-card p-4">
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Now Playing</p>
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-cat-audio-soft text-2xl">
          🎵
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-primary truncate">{{ currentTrack.title }}</p>
          <p class="text-xs text-text-secondary truncate">{{ currentTrack.artist }}</p>
        </div>
        <button
          @click="isPlaying = !isPlaying"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-cat-audio text-white text-lg
                 active:scale-95 transition-transform cursor-pointer"
        >
          {{ isPlaying ? '⏸' : '▶️' }}
        </button>
      </div>

      <!-- Volume -->
      <div class="mt-4 flex items-center gap-3">
        <span class="text-sm">🔈</span>
        <div class="relative flex-1 h-1.5 rounded-full bg-border-subtle">
          <div class="absolute inset-y-0 left-0 rounded-full bg-cat-audio" :style="{ width: volume + '%' }" />
        </div>
        <span class="text-xs tabular-nums text-text-secondary w-8 text-right">{{ volume }}%</span>
      </div>
    </div>

    <!-- Zones -->
    <div>
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Speaker Zones</p>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="zone in zones"
          :key="zone.name"
          @click="toggleZone(zone)"
          class="flex items-center gap-2 rounded-2xl border p-3 transition-all duration-200 active:scale-[0.97] cursor-pointer"
          :class="zone.active
            ? 'bg-cat-audio-soft border-cat-audio/30'
            : 'bg-surface-card border-border-subtle'"
        >
          <span class="text-lg">{{ zone.icon }}</span>
          <span class="text-sm font-medium text-text-primary">{{ zone.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
