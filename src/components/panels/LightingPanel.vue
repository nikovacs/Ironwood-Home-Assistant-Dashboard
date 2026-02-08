<script setup lang="ts">
import { ref, type Component } from 'vue'
import IconSofa from '../icons/IconSofa.vue'
import IconChefHat from '../icons/IconChefHat.vue'
import IconBed from '../icons/IconBed.vue'
import IconMonitor from '../icons/IconMonitor.vue'
import IconShower from '../icons/IconShower.vue'
import IconDoor from '../icons/IconDoor.vue'

interface Room {
  name: string
  icon: Component
  brightness: number
  on: boolean
}

const rooms = ref<Room[]>([
  { name: 'Living Room', icon: IconSofa, brightness: 80, on: true },
  { name: 'Kitchen', icon: IconChefHat, brightness: 100, on: true },
  { name: 'Bedroom', icon: IconBed, brightness: 40, on: false },
  { name: 'Office', icon: IconMonitor, brightness: 70, on: true },
  { name: 'Bathroom', icon: IconShower, brightness: 60, on: false },
  { name: 'Hallway', icon: IconDoor, brightness: 30, on: true },
])

function toggleRoom(room: Room): void {
  room.on = !room.on
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Lighting</h2>
      <span class="text-xs text-text-muted">{{ rooms.filter(r => r.on).length }} lights on</span>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        v-for="room in rooms"
        :key="room.name"
        class="flex flex-col items-start gap-2 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.97] cursor-pointer"
        :class="room.on
          ? 'bg-cat-lighting-soft border-cat-lighting/30'
          : 'bg-surface-card border-border-subtle'"
        @click="toggleRoom(room)"
      >
        <div class="flex w-full items-center justify-between">
          <component :is="room.icon" class="h-6 w-6" />
          <div
            class="h-3 w-3 rounded-full transition-colors duration-200"
            :class="room.on ? 'bg-cat-lighting' : 'bg-border-subtle'"
          />
        </div>
        <div>
          <p class="text-sm font-medium text-text-primary">{{ room.name }}</p>
          <p class="text-xs text-text-secondary">
            {{ room.on ? `${room.brightness}%` : 'Off' }}
          </p>
        </div>
      </button>
    </div>
  </div>
</template>
