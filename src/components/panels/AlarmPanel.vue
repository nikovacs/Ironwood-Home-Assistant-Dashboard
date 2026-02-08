<script setup lang="ts">
import { ref, computed } from 'vue'

type AlarmStatus = 'disarmed' | 'armed-home' | 'armed-away'

interface AlarmMode {
  id: AlarmStatus
  label: string
  icon: string
  description: string
}

const status = ref<AlarmStatus>('disarmed')
const entryCode = ref<string>('')

const modes: AlarmMode[] = [
  { id: 'disarmed', label: 'Disarmed', icon: '🔓', description: 'System off' },
  { id: 'armed-home', label: 'Home', icon: '🏠', description: 'Perimeter only' },
  { id: 'armed-away', label: 'Away', icon: '🔒', description: 'Full protection' },
]

const currentMode = computed<AlarmMode | undefined>(() => modes.find(m => m.id === status.value))

function setMode(mode: AlarmStatus): void {
  status.value = mode
  entryCode.value = ''
}

const isArmed = computed<boolean>(() => status.value !== 'disarmed')
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Alarm</h2>
      <span
        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
        :class="isArmed ? 'bg-cat-alarm-soft text-cat-alarm' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'"
      >
        <span class="h-1.5 w-1.5 rounded-full" :class="isArmed ? 'bg-cat-alarm' : 'bg-green-500'" />
        {{ currentMode?.label }}
      </span>
    </div>

    <!-- Mode selector -->
    <div class="grid grid-cols-3 gap-3">
      <button
        v-for="mode in modes"
        :key="mode.id"
        class="flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.97] cursor-pointer"
        :class="status === mode.id
          ? mode.id === 'disarmed'
            ? 'bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700'
            : 'bg-cat-alarm-soft border-cat-alarm/30'
          : 'bg-surface-card border-border-subtle'"
        @click="setMode(mode.id)"
      >
        <span class="text-2xl">{{ mode.icon }}</span>
        <div class="text-center">
          <p class="text-sm font-medium text-text-primary">{{ mode.label }}</p>
          <p class="text-xs text-text-secondary">{{ mode.description }}</p>
        </div>
      </button>
    </div>

    <!-- Recent activity -->
    <div>
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Recent Activity</p>
      <div class="space-y-2">
        <div class="flex items-center gap-3 rounded-xl bg-surface-card border border-border-subtle px-3 py-2.5">
          <span class="text-sm">🚪</span>
          <span class="flex-1 text-sm text-text-primary">Front door opened</span>
          <span class="text-xs text-text-muted">2m ago</span>
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-surface-card border border-border-subtle px-3 py-2.5">
          <span class="text-sm">🪟</span>
          <span class="flex-1 text-sm text-text-primary">Window sensor OK</span>
          <span class="text-xs text-text-muted">15m ago</span>
        </div>
        <div class="flex items-center gap-3 rounded-xl bg-surface-card border border-border-subtle px-3 py-2.5">
          <span class="text-sm">🔒</span>
          <span class="flex-1 text-sm text-text-primary">System armed (away)</span>
          <span class="text-xs text-text-muted">1h ago</span>
        </div>
      </div>
    </div>
  </div>
</template>
