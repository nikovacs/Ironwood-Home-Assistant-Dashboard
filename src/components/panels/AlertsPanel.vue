<script setup lang="ts">
import { ref } from 'vue'

interface Alert {
  id: number
  message: string
  time: string
  severity: 'info' | 'warning' | 'critical'
}

const alerts = ref<Alert[]>([
  { id: 1, message: 'Front door opened', time: '2 min ago', severity: 'info' },
  { id: 2, message: 'Motion detected in garden', time: '15 min ago', severity: 'warning' },
  { id: 3, message: 'Smoke detector triggered', time: '1 hr ago', severity: 'critical' },
  { id: 4, message: 'Garage door left open', time: '3 hr ago', severity: 'warning' },
])

const severityStyle: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  warning: 'bg-cat-alerts-soft text-cat-alerts',
  critical: 'bg-cat-alarm-soft text-cat-alarm',
}

function dismiss(id: number): void {
  alerts.value = alerts.value.filter(a => a.id !== id)
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Alerts</h2>
      <span class="text-sm text-text-secondary">{{ alerts.length }} active</span>
    </div>

    <div v-if="alerts.length === 0" class="py-8 text-center text-text-muted">
      No active alerts
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-card p-4"
      >
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            :class="severityStyle[alert.severity]"
          >
            {{ alert.severity }}
          </span>
          <div>
            <p class="text-sm font-medium text-text-primary">{{ alert.message }}</p>
            <p class="text-xs text-text-muted">{{ alert.time }}</p>
          </div>
        </div>
        <button
          class="text-xs text-text-secondary hover:text-text-primary cursor-pointer"
          @click="dismiss(alert.id)"
        >
          Dismiss
        </button>
      </div>
    </div>
  </div>
</template>
