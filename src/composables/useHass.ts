// composables/useHass.ts
import { ref, computed, onMounted, onUnmounted, shallowRef } from 'vue'
import {
  createConnection,
  subscribeEntities,
  callService,
  getStates,
  createLongLivedTokenAuth,
  type HassEntity,
  type Connection
} from 'home-assistant-js-websocket'

export function useHass() {
  const connection = shallowRef<Connection | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)

  const entities = ref<Record<string, HassEntity>>({})

  // Your long-lived token from HA profile → Long-Lived Access Tokens
  const HA_TOKEN = import.meta.env.VITE_HA_LLAT_TOKEN as string || ''
  const HA_URL = import.meta.env.VITE_HA_URL as string || 'http://homeassistant.local:8123'

  async function connect() {
    console.log('[HASS] connect() called', { url: HA_URL, tokenLength: HA_TOKEN.length })

    if (!HA_TOKEN) {
      error.value = 'Missing HA token (set VITE_HA_LLAT_TOKEN in .env)'
      console.error('[HASS]', error.value)
      return
    }
    if (isConnecting.value) {
      console.warn('[HASS] Already connecting, skipping')
      return
    }
    if (connection.value) {
      console.warn('[HASS] Already connected, skipping')
      return
    }

    isConnecting.value = true
    error.value = null
    console.log('[HASS] Attempting connection to', HA_URL)

    try {
      const auth = createLongLivedTokenAuth(HA_URL, HA_TOKEN)

      connection.value = await createConnection({
        auth
      })

      isConnected.value = true
      console.log('[HASS] Connected successfully')

      // Subscribe to entity changes (fires on any update)
      subscribeEntities(connection.value, (updatedEntities) => {
        entities.value = { ...updatedEntities }
      })

      // Optional: Load initial full state snapshot
      const initial = await getStates(connection.value)
      entities.value = Object.fromEntries(
        initial.map(e => [e.entity_id, e])
      )

    } catch (err: any) {
      error.value = err.message || 'Connection failed (check token/URL)'
      console.error('[HASS] Error:', err)
      isConnected.value = false
    } finally {
      isConnecting.value = false
    }
  }

  async function hassService(
    domain: string,
    service: string,
    data: Record<string, any> = {}
  ) {
    if (!connection.value || !isConnected.value) {
      console.warn('[HASS] Not connected')
      return
    }
    try {
      await callService(connection.value, domain, service, data)
    } catch (err) {
      console.error('[HASS] Service failed:', err)
      error.value = `Service call failed: ${domain}.${service}`
    }
  }

  // Helpers
  const getEntity = (id: string) => computed(() => entities.value[id] ?? null)
  const getState = (id: string) => computed(() => entities.value[id]?.state ?? 'unavailable')
  const isOn = (id: string) => computed(() => {
    const s = entities.value[id]?.state
    return s === 'on' || s === 'playing' || s === 'open'
  })

  onMounted(async () => {
    await connect()
  })

  onUnmounted(() => {
    if (connection.value) {
      connection.value.close()
    }
  })

  return {
    isConnected,
    isConnecting,
    error,
    entities,

    getEntity,
    getState,
    isOn,

    connect,              // manual reconnect if needed
    hassService,

    // Quick helpers for common lights (extend as needed)
    lightOn:    (id: string) => hassService('light', 'turn_on', { entity_id: id }),
    lightOff:   (id: string) => hassService('light', 'turn_off', { entity_id: id }),
    lightToggle:(id: string) => hassService('light', 'toggle', { entity_id: id })
  }
}