<script setup lang="ts">
import { ref } from 'vue'
import IconAlertCircle from './icons/IconAlertCircle.vue'
import IconX from './icons/IconX.vue'

interface Props {
  message?: string
}

defineProps<Props>()

defineEmits<{
  dismiss: []
}>()

const visible = ref<boolean>(true)

function handleDismiss(emit: (_e: 'dismiss') => void): void {
  visible.value = false
  emit('dismiss')
}
</script>

<template>
  <Transition v-if="message" name="banner">
    <div
      v-if="visible"
      class="mx-5 mb-2 flex items-center gap-3 rounded-xl border border-cat-alarm bg-cat-alarm-soft px-4 py-3"
    >
      <IconAlertCircle class="h-5 w-5 text-cat-alarm" />
      <p class="flex-1 text-sm font-semibold text-cat-alarm">{{ message }}</p>
      <button
        class="ml-2 text-cat-alarm opacity-60 hover:opacity-100 transition-opacity cursor-pointer text-lg leading-none"
        aria-label="Dismiss"
        @click="handleDismiss($emit)"
      >
        <IconX class="h-4 w-4" />
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
