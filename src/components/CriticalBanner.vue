<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Smoke detector triggered',
})

defineEmits<{
  dismiss: []
}>()

const visible = ref<boolean>(true)

function handleDismiss(emit: (e: 'dismiss') => void): void {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <Transition name="banner">
    <div
      v-if="visible"
      class="mx-5 mb-2 flex items-center gap-3 rounded-xl border border-cat-alarm bg-cat-alarm-soft px-4 py-3"
    >
      <span class="text-lg">🚨</span>
      <p class="flex-1 text-sm font-semibold text-cat-alarm">{{ message }}</p>
      <button
        @click="handleDismiss($emit)"
        class="ml-2 text-cat-alarm opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-lg leading-none"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition:
    opacity 400ms ease,
    transform 400ms cubic-bezier(0.4, 0, 0.2, 1),
    max-height 400ms cubic-bezier(0.4, 0, 0.2, 1),
    margin 400ms cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 5rem;
  overflow: hidden;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-1rem);
  max-height: 0;
  margin-bottom: 0;
}
</style>
