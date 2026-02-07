import { ref, watchEffect, onMounted, onUnmounted, type Ref } from 'vue'

const mediaQuery: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
const isDark: Ref<boolean> = ref(mediaQuery.matches)

function handleChange(e: MediaQueryListEvent): void {
  isDark.value = e.matches
}

export function useTheme(): { isDark: Ref<boolean> } {
  onMounted(() => {
    mediaQuery.addEventListener('change', handleChange)
  })

  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleChange)
  })

  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  return { isDark }
}
