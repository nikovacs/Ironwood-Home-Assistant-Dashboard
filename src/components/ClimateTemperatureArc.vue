<script setup lang="ts">
import { ref, computed } from 'vue'

/** Arc from bottom-left (225°) clockwise to bottom-right (135°) — opening at bottom. */
const ARC_START_DEG = 225
const ARC_DEG = 270
const RADIUS = 45
const CENTER = 50
const THUMB_R = 6
const PAD = 8

const props = withDefaults(
  defineProps<{
    modelValue: number | null
    min: number
    max: number
    step?: number
    mode?: string
  }>(),
  { step: 1, mode: 'off' }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const gradientIdPrefix = `climate-arc-${Math.random().toString(36).slice(2, 9)}`

function tempToAngle(temp: number): number {
  if (props.max <= props.min) {
    return ARC_START_DEG
  }
  const t = (temp - props.min) / (props.max - props.min)
  return ARC_START_DEG + t * ARC_DEG
}

/** When pointer is in the gap (opening), return currentTemp so value doesn't jump. */
function angleToTemp(angle: number, currentTemp: number | null): number {
  const a = angle
  const inGap = a > 135 && a < ARC_START_DEG
  if (inGap && currentTemp !== null) {
    return currentTemp
  }
  let t: number
  if (a >= ARC_START_DEG && a <= 360) {
    t = (a - ARC_START_DEG) / ARC_DEG
  } else if (a >= 0 && a <= 135) {
    t = (a + 360 - ARC_START_DEG) / ARC_DEG
  } else if (inGap) {
    t = 0
  } else {
    t = 0
  }
  const clamped = Math.max(0, Math.min(1, t))
  const temp = props.min + clamped * (props.max - props.min)
  const rounded =
    props.step > 0 ? Math.round(temp / props.step) * props.step : Math.round(temp)
  return Math.max(props.min, Math.min(props.max, rounded))
}

const containerRef = ref<HTMLElement | null>(null)
const draggingFromArc = ref(false)

const STROKE_WIDTH = 8
const ARC_HIT_MARGIN = 4

function getAngleFromEvent(e: PointerEvent): number {
  const el = containerRef.value
  if (!el) {
    return 0
  }
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const x = e.clientX - cx
  const y = e.clientY - cy
  let angle = (Math.atan2(x, -y) * 180) / Math.PI
  if (angle < 0) {
    angle += 360
  }
  return angle
}

/** True only if (clientX, clientY) is on the arc (not in the center void or outside). */
function isPointOnArc(clientX: number, clientY: number): boolean {
  const el = containerRef.value
  if (!el) {
    return false
  }
  const rect = el.getBoundingClientRect()
  const size = Math.min(rect.width, rect.height)
  const scale = size / (100 + 2 * PAD)
  const cx = rect.width / 2
  const cy = rect.height / 2
  const localX = clientX - rect.left - cx
  const localY = clientY - rect.top - cy
  const distPx = Math.sqrt(localX * localX + localY * localY)
  const distUnits = distPx / scale
  const minDist = RADIUS - STROKE_WIDTH / 2 - ARC_HIT_MARGIN
  const maxDist = RADIUS + STROKE_WIDTH / 2 + ARC_HIT_MARGIN
  if (distUnits < minDist || distUnits > maxDist) {
    return false
  }
  let angle = (Math.atan2(localX, -localY) * 180) / Math.PI
  if (angle < 0) {
    angle += 360
  }
  const inGap = angle > 135 && angle < ARC_START_DEG
  return !inGap
}

function handlePointerDown(e: PointerEvent): void {
  if (!isPointOnArc(e.clientX, e.clientY)) {
    return
  }
  draggingFromArc.value = true
  e.stopPropagation()
  e.preventDefault()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const angle = getAngleFromEvent(e)
  const temp = angleToTemp(angle, props.modelValue)
  emit('update:modelValue', temp)
}

function handlePointerMove(e: PointerEvent): void {
  if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
    e.preventDefault()
    e.stopPropagation()
    const angle = getAngleFromEvent(e)
    const temp = angleToTemp(angle, props.modelValue)
    emit('update:modelValue', temp)
  }
}

function handlePointerUp(e: PointerEvent): void {
  draggingFromArc.value = false
  e.stopPropagation()
  e.preventDefault()
  ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
}

function handlePointerCancel(e: PointerEvent): void {
  draggingFromArc.value = false
  e.stopPropagation()
  e.preventDefault()
  ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
}

function handleTouchStart(e: TouchEvent): void {
  const t = e.touches[0]
  if (t && isPointOnArc(t.clientX, t.clientY)) {
    e.stopPropagation()
    e.preventDefault()
  }
}

function handleTouchMove(e: TouchEvent): void {
  if (draggingFromArc.value) {
    e.stopPropagation()
    e.preventDefault()
  }
}

function handleTouchEnd(e: TouchEvent): void {
  if (draggingFromArc.value) {
    e.stopPropagation()
    e.preventDefault()
  }
  draggingFromArc.value = false
}

function handleTouchCancel(e: TouchEvent): void {
  if (draggingFromArc.value) {
    e.stopPropagation()
    e.preventDefault()
  }
  draggingFromArc.value = false
}

const strokeGradientUrl = computed(() => {
  const id = ['cool', 'heat', 'auto', 'heat_cool'].includes(props.mode)
    ? (props.mode === 'heat_cool' ? 'auto' : props.mode)
    : 'off'
  return `url(#${gradientIdPrefix}-${id})`
})

const arcPath = computed(() => {
  const startRad = (ARC_START_DEG * Math.PI) / 180
  const endRad = ((ARC_START_DEG + ARC_DEG) * Math.PI) / 180
  const x1 = CENTER + RADIUS * Math.sin(startRad)
  const y1 = CENTER - RADIUS * Math.cos(startRad)
  const x2 = CENTER + RADIUS * Math.sin(endRad)
  const y2 = CENTER - RADIUS * Math.cos(endRad)
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${RADIUS} ${RADIUS} 0 1 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
})

const thumbPosition = computed(() => {
  const temp = props.modelValue
  if (temp === null) {
    const startRad = (ARC_START_DEG * Math.PI) / 180
    return {
      x: CENTER + RADIUS * Math.sin(startRad),
      y: CENTER - RADIUS * Math.cos(startRad),
    }
  }
  const angleRad = (tempToAngle(temp) * Math.PI) / 180
  return {
    x: CENTER + RADIUS * Math.sin(angleRad),
    y: CENTER - RADIUS * Math.cos(angleRad),
  }
})

const viewBox = computed(
  () => `${-PAD} ${-PAD} ${100 + 2 * PAD} ${100 + 2 * PAD}`
)

/** Gradient runs along the arc: light at min-temp end (225°), dark at max-temp end (135°). */
const gradientLine = computed(() => {
  const startRad = (ARC_START_DEG * Math.PI) / 180
  const endRad = ((ARC_START_DEG + ARC_DEG) * Math.PI) / 180
  return {
    x1: CENTER + RADIUS * Math.sin(startRad),
    y1: CENTER - RADIUS * Math.cos(startRad),
    x2: CENTER + RADIUS * Math.sin(endRad),
    y2: CENTER - RADIUS * Math.cos(endRad),
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="relative touch-none select-none cursor-grab active:cursor-grabbing"
    style="width: min(80vw, 280px); height: min(80vw, 280px);"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerCancel"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <svg
      :viewBox="viewBox"
      class="size-full"
      aria-label="Set temperature"
    >
      <defs>
        <!-- Cool: dark at low temp (min end), light at high temp (max end) -->
        <linearGradient
          :id="`${gradientIdPrefix}-cool`"
          gradientUnits="userSpaceOnUse"
          :x1="gradientLine.x1"
          :y1="gradientLine.y1"
          :x2="gradientLine.x2"
          :y2="gradientLine.y2"
        >
          <stop offset="0%" stop-color="#1e40af" />
          <stop offset="100%" stop-color="#93c5fd" />
        </linearGradient>
        <!-- Heat: light at min temp, dark at max temp -->
        <linearGradient
          :id="`${gradientIdPrefix}-heat`"
          gradientUnits="userSpaceOnUse"
          :x1="gradientLine.x1"
          :y1="gradientLine.y1"
          :x2="gradientLine.x2"
          :y2="gradientLine.y2"
        >
          <stop offset="0%" stop-color="#fca5a5" />
          <stop offset="100%" stop-color="#b91c1c" />
        </linearGradient>
        <linearGradient
          :id="`${gradientIdPrefix}-auto`"
          gradientUnits="userSpaceOnUse"
          :x1="gradientLine.x1"
          :y1="gradientLine.y1"
          :x2="gradientLine.x2"
          :y2="gradientLine.y2"
        >
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="100%" stop-color="#b91c1c" />
        </linearGradient>
        <linearGradient
          :id="`${gradientIdPrefix}-off`"
          gradientUnits="userSpaceOnUse"
          :x1="gradientLine.x1"
          :y1="gradientLine.y1"
          :x2="gradientLine.x2"
          :y2="gradientLine.y2"
        >
          <stop offset="0%" stop-color="#e5e7eb" />
          <stop offset="100%" stop-color="#4b5563" />
        </linearGradient>
      </defs>
      <path
        :d="arcPath"
        fill="none"
        :stroke="strokeGradientUrl"
        stroke-width="8"
        stroke-linecap="round"
        class="transition-[stroke] duration-300"
      />
      <circle
        :cx="thumbPosition.x"
        :cy="thumbPosition.y"
        :r="THUMB_R"
        class="fill-white stroke-2 stroke-text-primary shadow-md transition-[cx,cy] duration-100"
      />
    </svg>
  </div>
</template>
