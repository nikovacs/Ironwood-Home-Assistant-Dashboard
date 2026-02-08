<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  icon: Component
  label: string
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false,
})

defineEmits<{
  press: []
}>()
</script>

<template>
  <button
    class="flex items-center gap-2 rounded-full border px-4 py-2 transition-all duration-200
           active:scale-[0.96] cursor-pointer select-none whitespace-nowrap"
    :class="active
      ? 'bg-accent-soft border-accent text-accent'
      : 'bg-surface-card border-border-subtle text-text-secondary hover:bg-surface-card-hover'"
    @click="$emit('press')"
  >
    <component :is="icon" class="h-4 w-4 shrink-0" />
    <span class="text-xs font-medium">{{ label }}</span>
  </button>
</template>
