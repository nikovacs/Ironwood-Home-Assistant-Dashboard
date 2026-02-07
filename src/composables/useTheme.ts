import { ref, watchEffect, type Ref } from 'vue'

const isDark: Ref<boolean> = ref(
  window.matchMedia('(prefers-color-scheme: dark)').matches
)

export function useTheme(): { isDark: Ref<boolean>; toggle: () => void } {
  watchEffect(() => {
    document.documentElement.classList.toggle('dark', isDark.value)
  })

  function toggle(): void {
    isDark.value = !isDark.value
  }

  return { isDark, toggle }
}
