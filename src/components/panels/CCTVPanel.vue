<script setup lang="ts">
import { shallowRef, type Component } from 'vue'
import IconDoor from '../icons/IconDoor.vue'
import IconTree from '../icons/IconTree.vue'
import IconCar from '../icons/IconCar.vue'
import IconRoad from '../icons/IconRoad.vue'
import IconCamera from '../icons/IconCamera.vue'

interface Camera {
  id: number
  name: string
  icon: Component
  status: 'online' | 'offline'
  lastMotion: string
}

const cameras = shallowRef<Camera[]>([
  { id: 1, name: 'Front Door', icon: IconDoor, status: 'online', lastMotion: '3m ago' },
  { id: 2, name: 'Backyard', icon: IconTree, status: 'online', lastMotion: '12m ago' },
  { id: 3, name: 'Garage', icon: IconCar, status: 'online', lastMotion: '1h ago' },
  { id: 4, name: 'Driveway', icon: IconRoad, status: 'offline', lastMotion: '—' },
])

const selectedCamera = shallowRef<Camera | null>(null)

function selectCamera(cam: Camera): void {
  selectedCamera.value = selectedCamera.value?.id === cam.id ? null : cam
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">CCTV</h2>
      <span class="text-xs text-text-muted">
        {{ cameras.filter(c => c.status === 'online').length }}/{{ cameras.length }} online
      </span>
    </div>

    <!-- Camera preview placeholder -->
    <div
      v-if="selectedCamera"
      class="relative aspect-video rounded-2xl border border-border-subtle bg-gray-900 flex items-center justify-center overflow-hidden"
    >
      <div class="text-center">
        <IconCamera class="h-10 w-10 text-gray-400" />
        <p class="text-sm text-gray-400">{{ selectedCamera.name }}</p>
        <p class="text-xs text-gray-500 mt-1">Live feed placeholder</p>
      </div>
      <div class="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1">
        <span class="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span class="text-xs text-white font-medium">LIVE</span>
      </div>
    </div>

    <!-- Camera list -->
    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="cam in cameras"
        :key="cam.id"
        class="flex flex-col items-start gap-2 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.97] cursor-pointer"
        :class="[
          selectedCamera?.id === cam.id
            ? 'bg-cat-cctv-soft border-cat-cctv/30'
            : 'bg-surface-card border-border-subtle',
          cam.status === 'offline' ? 'opacity-50' : ''
        ]"
        @click="selectCamera(cam)"
      >
        <div class="flex w-full items-center justify-between">
          <component :is="cam.icon" class="h-6 w-6" />
          <div
            class="h-2.5 w-2.5 rounded-full"
            :class="cam.status === 'online' ? 'bg-green-500' : 'bg-red-400'"
          />
        </div>
        <div>
          <p class="text-sm font-medium text-text-primary text-left">{{ cam.name }}</p>
          <p class="text-xs text-text-secondary">
            {{ cam.status === 'online' ? `Motion: ${cam.lastMotion}` : 'Offline' }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
