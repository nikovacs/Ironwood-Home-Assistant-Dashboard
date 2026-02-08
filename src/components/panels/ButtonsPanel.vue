<script setup lang="ts">
import { ref } from 'vue'
import IconDoor from '../icons/IconDoor.vue'
import IconCar from '../icons/IconCar.vue'
import IconLock from '../icons/IconLock.vue'
import IconUnlock from '../icons/IconUnlock.vue'

interface QuickAction {
  id: number
  name: string
  description: string
  active: boolean
}

type AccessState = 'locked' | 'closed' | 'open'

interface AccessControl {
  id: number
  name: string
  state: AccessState
}

const actions = ref<QuickAction[]>([
  { id: 1, name: 'Good Morning', description: 'Lights on, blinds up, coffee maker', active: false },
  { id: 2, name: 'Movie Night', description: 'Dim lights, TV on, blinds down', active: false },
  { id: 3, name: 'Away Mode', description: 'Lights off, alarm armed, thermostat eco', active: true },
  { id: 4, name: 'Bedtime', description: 'Lights off, doors locked, alarm home', active: false },
])

const access = ref<AccessControl[]>([
  { id: 1, name: 'Front Door', state: 'locked' },
  { id: 2, name: 'Garage Door', state: 'closed' },
  { id: 3, name: 'Side Gate', state: 'closed' },
])

function toggleAction(action: QuickAction): void {
  action.active = !action.active
}

function cycleAccess(item: AccessControl): void {
  const states: AccessState[] = ['locked', 'closed', 'open']
  const idx = states.indexOf(item.state)
  item.state = states[(idx + 1) % states.length]
}

const accessStyle: Record<AccessState, string> = {
  locked: 'bg-cat-alarm-soft text-cat-alarm',
  closed: 'bg-surface-button-active text-text-secondary',
  open: 'bg-cat-buttons-soft text-cat-buttons',
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Buttons</h2>
    </div>

    <!-- Quick Actions -->
    <div>
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Quick Actions</p>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="action in actions"
          :key="action.id"
          class="flex flex-col items-start gap-1.5 rounded-2xl border p-4 transition-all duration-200 active:scale-[0.97] cursor-pointer text-left"
          :class="action.active
            ? 'bg-cat-buttons-soft border-cat-buttons/30'
            : 'bg-surface-card border-border-subtle'"
          @click="toggleAction(action)"
        >
          <p class="text-sm font-medium text-text-primary">{{ action.name }}</p>
          <p class="text-xs text-text-secondary leading-snug">{{ action.description }}</p>
          <span
            class="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            :class="action.active
              ? 'bg-cat-buttons/20 text-cat-buttons'
              : 'bg-surface-button-active text-text-muted'"
          >
            {{ action.active ? 'Running' : 'Activate' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Access Controls -->
    <div>
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Access</p>
      <div class="space-y-2">
        <button
          v-for="item in access"
          :key="item.id"
          class="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          @click="cycleAccess(item)"
        >
          <component
            :is="item.name === 'Front Door' ? (item.state === 'locked' ? IconLock : IconUnlock) : (item.name === 'Garage Door' ? IconCar : IconDoor)"
            class="h-5 w-5 shrink-0 text-text-secondary"
          />
          <span class="flex-1 text-sm font-medium text-text-primary text-left">{{ item.name }}</span>
          <span
            class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize"
            :class="accessStyle[item.state]"
          >
            {{ item.state }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
