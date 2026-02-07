import { ref, computed, onMounted, onUnmounted, type Ref, type ComputedRef } from 'vue'

interface UseGreetingReturn {
  greeting: ComputedRef<string>
  timeString: ComputedRef<string>
  dateString: ComputedRef<string>
}

export function useGreeting(): UseGreetingReturn {
  const now: Ref<Date> = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  const greeting = computed<string>(() => {
    const hour = now.value.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  })

  const timeString = computed<string>(() => {
    return now.value.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  })

  const dateString = computed<string>(() => {
    return now.value.toLocaleDateString([], {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
  })

  return { greeting, timeString, dateString }
}
