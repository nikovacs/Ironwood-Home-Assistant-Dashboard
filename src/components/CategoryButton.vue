<script setup lang="ts">
interface Props {
  icon: string
  label: string
  color?: string
  active?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'accent',
  active: false,
  compact: false,
})

defineEmits<{
  select: []
}>()

interface ColorSet {
  icon: string
  bg: string
  border: string
}

const colorMap: Record<string, ColorSet> = {
  alerts:   { icon: 'text-cat-alerts',   bg: 'bg-cat-alerts-soft',   border: 'border-cat-alerts' },
  lighting: { icon: 'text-cat-lighting', bg: 'bg-cat-lighting-soft', border: 'border-cat-lighting' },
  audio:    { icon: 'text-cat-audio',    bg: 'bg-cat-audio-soft',    border: 'border-cat-audio' },
  alarm:    { icon: 'text-cat-alarm',    bg: 'bg-cat-alarm-soft',    border: 'border-cat-alarm' },
  cctv:     { icon: 'text-cat-cctv',     bg: 'bg-cat-cctv-soft',    border: 'border-cat-cctv' },
}

const colors: ColorSet = colorMap[props.color] || colorMap.lighting
</script>

<template>
  <button
    @click="$emit('select')"
    class="relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 ease-out
           active:scale-[0.97] cursor-pointer select-none"
    :class="[
      active
        ? [colors.bg, colors.border, 'shadow-sm']
        : 'bg-surface-card border-border-subtle hover:bg-surface-card-hover',
      compact ? 'gap-1 p-2' : 'gap-2 p-4'
    ]"
  >
    <span
      class="transition-all duration-300"
      :class="[
        compact ? 'text-2xl' : 'text-4xl',
        active ? colors.icon : 'text-text-secondary'
      ]"
    >
      {{ icon }}
    </span>
    <span
      class="font-medium transition-all duration-300"
      :class="[
        compact ? 'text-xs' : 'text-sm',
        active ? 'text-text-primary' : 'text-text-secondary'
      ]"
    >
      {{ label }}
    </span>
  </button>
</template>
