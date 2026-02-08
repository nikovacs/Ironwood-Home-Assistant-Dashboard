<script setup lang="ts">
import { ref, shallowRef, type Component } from 'vue'
import IconSofa from '../icons/IconSofa.vue'
import IconChefHat from '../icons/IconChefHat.vue'
import IconBed from '../icons/IconBed.vue'
import IconMonitor from '../icons/IconMonitor.vue'
import IconMusic from '../icons/IconMusic.vue'
import IconPause from '../icons/IconPause.vue'
import IconPlay from '../icons/IconPlay.vue'
import IconVolumeLow from '../icons/IconVolumeLow.vue'

interface Track {
  title: string
  artist: string
}

interface Zone {
  name: string
  icon: Component
  active: boolean
}

const isPlaying = ref<boolean>(true)
const currentTrack = ref<Track>({ title: 'Chill Vibes Mix', artist: 'Lofi Radio' })
const volume = ref<number>(65)

const zones = shallowRef<Zone[]>([
  { name: 'Living Room', icon: IconSofa, active: true },
  { name: 'Kitchen', icon: IconChefHat, active: false },
  { name: 'Bedroom', icon: IconBed, active: true },
  { name: 'Office', icon: IconMonitor, active: false },
])

function toggleZone(zone: Zone): void {
  zone.active = !zone.active
  zones.value = [...zones.value]
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
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-cat-audio-soft">
          <IconMusic class="h-6 w-6 text-cat-audio" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-text-primary truncate">{{ currentTrack.title }}</p>
          <p class="text-xs text-text-secondary truncate">{{ currentTrack.artist }}</p>
        </div>
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full bg-cat-audio text-white text-lg
                 active:scale-95 transition-transform cursor-pointer"
          @click="isPlaying = !isPlaying"
        >
          <component :is="isPlaying ? IconPause : IconPlay" class="h-5 w-5" />
        </button>
      </div>

      <!-- Volume -->
      <div class="mt-4 flex items-center gap-3">
        <IconVolumeLow class="h-4 w-4 text-text-secondary" />
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
          class="flex items-center gap-2 rounded-2xl border p-3 transition-all duration-200 active:scale-[0.97] cursor-pointer"
          :class="zone.active
            ? 'bg-cat-audio-soft border-cat-audio/30'
            : 'bg-surface-card border-border-subtle'"
          @click="toggleZone(zone)"
        >
          <component :is="zone.icon" class="h-5 w-5" />
          <span class="text-sm font-medium text-text-primary">{{ zone.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
