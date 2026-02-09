<script setup lang="ts">
import { ref, shallowRef, computed, type Component } from 'vue'
import GreetingHeader from './components/GreetingHeader.vue'
import CategoryButton from './components/CategoryButton.vue'
import CriticalBanner from './components/CriticalBanner.vue'
import LightingPanel from './components/panels/LightingPanel.vue'
import AudioPanel from './components/panels/AudioPanel.vue'
import AlarmPanel from './components/panels/AlarmPanel.vue'
import CCTVPanel from './components/panels/CCTVPanel.vue'
import AlertsPanel from './components/panels/AlertsPanel.vue'
import ClimatePanel from './components/panels/ClimatePanel.vue'
import ButtonsPanel from './components/panels/ButtonsPanel.vue'
import IconBell from './components/icons/IconBell.vue'
import IconLightbulb from './components/icons/IconLightbulb.vue'
import IconTap from './components/icons/IconTap.vue'
import IconSpeaker from './components/icons/IconSpeaker.vue'
import IconShield from './components/icons/IconShield.vue'
import IconCamera from './components/icons/IconCamera.vue'
import IconThermometer from './components/icons/IconThermometer.vue'
import FavoriteButton from './components/FavoriteButton.vue'
import WeatherClockCard from './components/WeatherClockCard.vue'
import IconLock from './components/icons/IconLock.vue'
import IconCar from './components/icons/IconCar.vue'
import IconFan from './components/icons/IconFan.vue'

interface Category {
  id: string
  icon: Component
  label: string
  color: string
  status: string
}

const activeCategory = ref<string | null>(null)
const isExpanded = computed<boolean>(() => activeCategory.value !== null)
const showBottomCard = computed<boolean>(() => !isExpanded.value && categories.length <= 8)

const categories: Category[] = [
  { id: 'alerts',   icon: IconBell,        label: 'Alerts',   color: 'alerts',   status: '2 active' },
  { id: 'lighting', icon: IconLightbulb,   label: 'Lighting', color: 'lighting', status: '4/7 on' },
  { id: 'buttons',  icon: IconTap,         label: 'Buttons',  color: 'buttons',  status: '' },
  { id: 'audio',    icon: IconSpeaker,     label: 'Audio',    color: 'audio',    status: 'Playing' },
  { id: 'alarm',    icon: IconShield,      label: 'Alarm',    color: 'alarm',    status: 'Armed Home' },
  { id: 'cctv',     icon: IconCamera,      label: 'CCTV',     color: 'cctv',     status: '4/4 online' },
  { id: 'climate',  icon: IconThermometer, label: 'Climate',  color: 'climate',  status: '72°F' },
]

function selectCategory(id: string): void {
  activeCategory.value = activeCategory.value === id ? null : id
}

const panelComponents: Record<string, Component> = {
  alerts: AlertsPanel,
  lighting: LightingPanel,
  audio: AudioPanel,
  alarm: AlarmPanel,
  cctv: CCTVPanel,
  climate: ClimatePanel,
  buttons: ButtonsPanel,
}
const activePanel = computed<Component | undefined>(() =>
  activeCategory.value ? panelComponents[activeCategory.value] : undefined
)

interface Favorite {
  id: string
  icon: Component
  label: string
  active: boolean
}

const favorites = shallowRef<Favorite[]>([
  { id: 'porch',  icon: IconLightbulb, label: 'Front Porch', active: true },
  { id: 'lock',   icon: IconLock,      label: 'Lock Door',   active: false },
  { id: 'garage', icon: IconCar,       label: 'Garage',      active: false },
  { id: 'fan',    icon: IconFan,       label: 'Fan',         active: true },
])

function toggleFavorite(fav: Favorite): void {
  fav.active = !fav.active
  favorites.value = [...favorites.value]
}

/* Swipe-down to dismiss panel */
const panelRef = ref<HTMLElement | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
const dragOffset = ref<number>(0)
const isDragging = ref<boolean>(false)
let touchStartY = 0
let touchStartTime = 0
let canDismiss = false

function onTouchStart(e: TouchEvent): void {
  if (!isExpanded.value) { return }
  touchStartY = e.touches[0].clientY
  touchStartTime = Date.now()
  dragOffset.value = 0
  /* Allow dismiss if content is scrolled to top */
  const el = scrollRef.value
  canDismiss = !el || el.scrollTop <= 0
}

function onTouchMove(e: TouchEvent): void {
  const dy = e.touches[0].clientY - touchStartY
  if (canDismiss && dy > 0) {
    /* User is at top and pulling down → start dismiss drag */
    isDragging.value = true
    dragOffset.value = dy
    e.preventDefault()
  } else if (isDragging.value && dy <= 0) {
    /* Reversed direction — cancel drag, let scroll take over */
    isDragging.value = false
    dragOffset.value = 0
  }
}

function onTouchEnd(): void {
  if (!isDragging.value) { return }
  isDragging.value = false
  const elapsed = Date.now() - touchStartTime
  const velocity = dragOffset.value / elapsed
  /* Dismiss if dragged far enough or flicked fast */
  if (dragOffset.value > 80 || velocity > 0.5) {
    activeCategory.value = null
  }
  dragOffset.value = 0
}
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-surface-primary">
    <GreetingHeader :hide-extras="showBottomCard" />

    <!-- Critical alert banner -->
    <CriticalBanner />

    <!-- Favorites strip -->
    <Transition name="favorites">
      <div v-if="!isExpanded" class="favorites-strip">
        <div class="favorites-inner">
          <FavoriteButton
            v-for="fav in favorites"
            :key="fav.id"
            :icon="fav.icon"
            :label="fav.label"
            :active="fav.active"
            @press="toggleFavorite(fav)"
          />
        </div>
      </div>
    </Transition>

    <!-- Category buttons — height shrinks when panel is open -->
    <div class="buttons-area" :class="{ compact: isExpanded }">
      <div class="buttons-row">
        <div v-for="cat in categories" :key="cat.id" class="btn-cell">
          <CategoryButton
            :icon="cat.icon"
            :label="cat.label"
            :status="cat.status"
            :color="cat.color"
            :active="activeCategory === cat.id"
            :compact="isExpanded"
            @select="selectCategory(cat.id)"
          />
        </div>
      </div>
    </div>

    <!-- Bottom weather + clock card (idle state only, hidden on mobile) -->
    <div v-if="showBottomCard" class="weather-card-area">
      <WeatherClockCard />
    </div>

    <!-- Mobile scroll hint gradient (idle only) -->
    <div v-if="!isExpanded" class="scroll-fade" />

    <!-- Panel — grows to fill remaining space -->
    <div
      ref="panelRef"
      class="panel-area rounded-t-3xl border-t bg-surface-panel"
      :class="[
        isExpanded ? 'is-open border-border-subtle' : 'border-transparent',
        isDragging ? 'dragging' : ''
      ]"
      :style="dragOffset > 0 ? { transform: `translateY(${String(dragOffset)}px)`, opacity: String(1 - dragOffset / 300) } : undefined"
    >
      <!-- Drag handle -->
      <div
        v-if="isExpanded"
        class="flex justify-center pt-3 pb-1 cursor-grab"
      >
        <div class="h-1 w-10 rounded-full bg-border-subtle" />
      </div>
      <div
        ref="scrollRef"
        class="panel-scroll px-5 pt-2 pb-8"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <KeepAlive>
          <component :is="activePanel" :key="activeCategory" />
        </KeepAlive>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Button area: takes up most of the screen by default,
  shrinks to a small strip when the panel opens.
  We use flex-basis + max-height (both animatable).
*/
.buttons-area {
  flex: 1 1 auto;
  display: flex;
  align-items: start;
  padding: 0.75rem 2.5rem 1rem;
  transition: flex 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.buttons-area.compact {
  flex: 0 0 auto;
}

/*
  The button grid. Always 4 columns, never changes.
  Default: taller cells in a 4×2 grid (4+3 with 7 buttons).
  Compact: same grid, just shorter cells.
  No column span changes = no layout jump.
*/
.buttons-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
  transition: gap 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

.buttons-area.compact .buttons-row {
  gap: 0.5rem;
}

/*
  Each button cell.
  Default: explicit height for a tall square-ish look.
  Compact: short strip.
  Only height + padding animate — no reflow.
*/
/* Closing transition (compact → default): slower */
.btn-cell {
  height: calc((100dvh - 8rem - 4rem - 4.5rem) / 4);
  padding: 0.5rem;
  transition:
    height 1000ms cubic-bezier(0.4, 0, 0.2, 1),
    padding 800ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Opening transition (default → compact): faster */
.buttons-area.compact .btn-cell {
  height: 5rem;
  padding: 0.25rem;
  transition:
    height 400ms cubic-bezier(0.4, 0, 0.2, 1),
    padding 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cell > * {
  width: 100%;
  height: 100%;
}

/*
  Panel: hidden by default, slides up and grows.
  Uses max-height for animatable open/close.
*/
.panel-area {
  flex: 0 1 0px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  opacity: 0;
  overflow: hidden;
  transition:
    flex 800ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 600ms ease;
}

.panel-area.is-open {
  flex: 1 1 0px;
  opacity: 1;
}

.panel-area.dragging {
  transition: none;
}

.panel-scroll {
  flex: 1 1 0px;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/*
  Favorites strip: slide + fade + collapse
*/
.favorites-strip {
  overflow: hidden;
}

.favorites-inner {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem 1rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.favorites-inner::-webkit-scrollbar {
  display: none;
}

.favorites-enter-active,
.favorites-leave-active {
  transition:
    max-height 400ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 300ms ease,
    transform 400ms cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 5rem;
}

.favorites-enter-from,
.favorites-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.5rem);
}

/*
  Bottom weather/clock card
*/
.weather-card-area {
  flex: 1 1 auto;
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  padding: 0 2.5rem 1rem;
}

/*
  Mobile responsive (phones, < 640px)
*/
/*
  Mobile scroll hint — only visible on small screens
*/
.scroll-fade {
  display: none;
}

@media (width < 40rem) {
  .scroll-fade {
    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3rem;
    background: linear-gradient(to bottom, transparent, var(--color-surface-primary));
    pointer-events: none;
    z-index: 10;
  }

  .buttons-area {
    padding: 0.5rem 1rem 0.75rem;
  }

  .buttons-area.compact {
    display: none;
  }

  .buttons-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .btn-cell {
    padding: 0.25rem;
  }

  .favorites-inner {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem 1rem;
    overflow-x: visible;
  }

  .weather-card-area {
    display: none;
  }
}
</style>
