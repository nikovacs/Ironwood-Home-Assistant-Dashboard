<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useHass } from '../../composables/useHass'
import IconSpeaker from '../icons/IconSpeaker.vue'
import IconMusic from '../icons/IconMusic.vue'
import IconPlay from '../icons/IconPlay.vue'
import IconPlus from '../icons/IconPlus.vue'
import IconUser from '../icons/IconUser.vue'
import IconCheck from '../icons/IconCheck.vue'
import IconX from '../icons/IconX.vue'
import IconExternalLink from '../icons/IconExternalLink.vue'

const { entities, hassService } = useHass()

/* ── Spotify Profiles ── */
/*
  Profiles are stored in an HA input_text helper so every tablet shares the same list.
  Create a helper in HA:  Settings → Devices → Helpers → Text → "spotify_profiles"
  entity_id: input_text.spotify_profiles   max: 255
  Value is a JSON string: [{"id":"…","name":"Me"},…]
*/
interface SpotifyProfile {
  id: string
  name: string
}

const PROFILES_ENTITY = 'input_text.spotify_profiles'

const profiles = computed<SpotifyProfile[]>(() => {
  const raw = entities.value[PROFILES_ENTITY]?.state
  if (!raw || raw === 'unknown' || raw === 'unavailable') { return [] }
  try {
    return JSON.parse(raw) as SpotifyProfile[]
  } catch { return [] }
})

const selectedProfile = ref<SpotifyProfile | null>(null)
const showAddProfile = ref(false)
const newProfileName = ref('')

function persistProfiles(next: SpotifyProfile[]): void {
  hassService('input_text', 'set_value', {
    entity_id: PROFILES_ENTITY,
    value: JSON.stringify(next),
  })
}

function addProfile(): void {
  const name = newProfileName.value.trim()
  if (!name) { return }
  const profile: SpotifyProfile = { id: globalThis.crypto.randomUUID(), name }
  persistProfiles([...profiles.value, profile])
  newProfileName.value = ''
  showAddProfile.value = false
  selectedProfile.value = profile
}

function removeProfile(id: string): void {
  persistProfiles(profiles.value.filter(p => p.id !== id))
  if (selectedProfile.value?.id === id) { selectedProfile.value = null }
}

/* ── Audio Zones from HA ── */
const allZones = computed(() =>
  Object.values(entities.value)
    .filter(e => e.entity_id.startsWith('media_player.'))
    .sort((a, b) => (a.attributes.friendly_name ?? a.entity_id).localeCompare(b.attributes.friendly_name ?? b.entity_id))
)

const activeZones = computed(() => allZones.value.filter(z => z.state === 'playing' || z.state === 'paused'))

/* Group active zones by the app / source that's playing on them */
const activeGrouped = computed(() => {
  const groups = new Map<string, typeof activeZones.value>()
  for (const z of activeZones.value) {
    const source = (z.attributes.app_name as string | undefined)
      ?? (z.attributes.source as string | undefined)
      ?? 'Unknown'
    const list = groups.get(source) ?? []
    list.push(z)
    groups.set(source, list)
  }
  return groups
})

/* ── Zone Selection ── */
const selectedZoneIds = ref<Set<string>>(new Set())

function toggleZoneSelection(entityId: string): void {
  const next = new Set(selectedZoneIds.value)
  if (next.has(entityId)) {
    next.delete(entityId)
  } else {
    next.add(entityId)
  }
  selectedZoneIds.value = next
}

function selectAll(): void {
  selectedZoneIds.value = new Set(allZones.value.map(z => z.entity_id))
}

function selectNone(): void {
  selectedZoneIds.value = new Set()
}

/* ── Spotify Integration ── */
const showSpotifyEmbed = ref(false)

const isMobile = ref(false)
function checkMobile(): void {
  isMobile.value = globalThis.innerWidth < 640
}
onMounted(() => {
  checkMobile()
  globalThis.addEventListener('resize', checkMobile)
})
onUnmounted(() => {
  globalThis.removeEventListener('resize', checkMobile)
})

function openSpotify(): void {
  if (!selectedProfile.value) { return }
  if (selectedZoneIds.value.size === 0) { return }

  if (isMobile.value) {
    globalThis.open('spotify://', '_blank')
  } else {
    showSpotifyEmbed.value = true
  }
}

function closeEmbed(): void {
  showSpotifyEmbed.value = false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function playOnZones(): Promise<void> {
  if (!selectedProfile.value || selectedZoneIds.value.size === 0) { return }
  // The backend handles linking the Spotify profile to the correct device.
  // We send a service call per zone for now.
  for (const zoneId of selectedZoneIds.value) {
    await hassService('media_player', 'media_play', { entity_id: zoneId })
  }
}

function zoneName(z: { attributes: Record<string, unknown>; entity_id: string }): string {
  return (z.attributes.friendly_name as string | undefined) ?? z.entity_id.replace('media_player.', '').replaceAll('_', ' ')
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-text-primary">Home Audio</h2>
      <span class="text-xs text-text-muted">{{ allZones.length }} zones</span>
    </div>

    <!-- ── Currently Active (grouped by source) ── -->
    <div v-if="activeZones.length > 0">
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Now Playing</p>
      <div class="space-y-3">
        <div
          v-for="[source, zones] in activeGrouped"
          :key="source"
          class="rounded-2xl border border-border-subtle bg-surface-card p-4"
        >
          <div class="flex items-center gap-2 mb-2">
            <IconMusic class="h-4 w-4 text-cat-audio" />
            <span class="text-xs font-semibold text-cat-audio uppercase tracking-wide">{{ source }}</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="z in zones"
              :key="z.entity_id"
              class="inline-flex items-center gap-1.5 rounded-full bg-cat-audio-soft px-3 py-1 text-xs font-medium text-text-primary"
            >
              <IconSpeaker class="h-3 w-3 text-cat-audio" />
              {{ zoneName(z) }}
              <span v-if="z.attributes.media_title" class="text-text-muted">
                — {{ z.attributes.media_title }}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Zone Selection ── -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <p class="text-xs text-text-muted uppercase tracking-wide">Select Zones</p>
        <div class="flex gap-1.5">
          <button
            class="rounded-full border border-cat-audio/30 bg-cat-audio-soft px-2.5 py-0.5 text-xs font-medium text-cat-audio cursor-pointer active:scale-95 transition-transform"
            @click="selectAll"
          >
            All
          </button>
          <button
            class="rounded-full border border-border-subtle bg-surface-card px-2.5 py-0.5 text-xs font-medium text-text-muted cursor-pointer active:scale-95 transition-transform"
            @click="selectNone"
          >
            None
          </button>
        </div>
      </div>
      <div v-if="allZones.length === 0" class="py-4 text-center text-sm text-text-muted">
        No audio zones found
      </div>
      <div v-else class="grid grid-cols-2 gap-2">
        <button
          v-for="zone in allZones"
          :key="zone.entity_id"
          class="zone-btn flex items-center gap-2 rounded-2xl border p-3 cursor-pointer text-left select-none"
          :class="selectedZoneIds.has(zone.entity_id)
            ? 'bg-cat-audio-soft border-cat-audio/30'
            : 'bg-surface-card border-border-subtle'"
          @click="toggleZoneSelection(zone.entity_id)"
        >
          <div
            class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150"
            :class="selectedZoneIds.has(zone.entity_id)
              ? 'bg-cat-audio border-cat-audio'
              : 'border-border-subtle'"
          >
            <IconCheck v-if="selectedZoneIds.has(zone.entity_id)" class="h-3 w-3 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-text-primary truncate">{{ zoneName(zone) }}</p>
            <p v-if="zone.state === 'playing' || zone.state === 'paused'" class="text-xs text-cat-audio truncate">
              {{ zone.state === 'playing' ? '▶' : '❚❚' }} {{ zone.attributes.media_title ?? zone.state }}
            </p>
          </div>
          <IconSpeaker class="h-4 w-4 shrink-0" :class="zone.state === 'playing' ? 'text-cat-audio' : 'text-text-muted'" />
        </button>
      </div>
    </div>

    <!-- ── Spotify Profile Selector ── -->
    <div>
      <p class="text-xs text-text-muted uppercase tracking-wide mb-2">Spotify Profile</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="profile in profiles"
          :key="profile.id"
          class="profile-btn group relative flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer select-none"
          :class="selectedProfile?.id === profile.id
            ? 'bg-cat-audio text-white border-cat-audio'
            : 'bg-surface-card text-text-primary border-border-subtle'"
          @click="selectedProfile = selectedProfile?.id === profile.id ? null : profile"
        >
          <IconUser class="h-3.5 w-3.5" />
          {{ profile.name }}
          <button
            class="ml-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            :class="selectedProfile?.id === profile.id ? 'hover:bg-white/20' : 'hover:bg-black/10'"
            title="Remove profile"
            @click.stop="removeProfile(profile.id)"
          >
            <IconX class="h-3 w-3" />
          </button>
        </button>

        <!-- Add profile button / inline form -->
        <div v-if="showAddProfile" class="flex items-center gap-1.5">
          <input
            v-model="newProfileName"
            type="text"
            placeholder="Name…"
            class="h-8 w-28 rounded-full border border-border-subtle bg-surface-card px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-cat-audio focus:outline-none"
            @keydown.enter="addProfile"
            @keydown.escape="showAddProfile = false"
          />
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-cat-audio text-white cursor-pointer active:scale-95 transition-transform"
            @click="addProfile"
          >
            <IconCheck class="h-4 w-4" />
          </button>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-surface-card border border-border-subtle text-text-muted cursor-pointer active:scale-95 transition-transform"
            @click="showAddProfile = false; newProfileName = ''"
          >
            <IconX class="h-4 w-4" />
          </button>
        </div>
        <button
          v-else
          class="flex items-center gap-1 rounded-full border border-dashed border-border-subtle px-3 py-1.5 text-sm text-text-muted cursor-pointer hover:border-cat-audio hover:text-cat-audio transition-colors"
          @click="showAddProfile = true"
        >
          <IconPlus class="h-3.5 w-3.5" />
          Add Profile
        </button>
      </div>
    </div>

    <!-- ── Play Action ── -->
    <div class="flex gap-3">
      <button
        class="play-btn flex-1 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all duration-200 cursor-pointer select-none"
        :class="selectedProfile && selectedZoneIds.size > 0
          ? 'bg-cat-audio text-white active:scale-[0.97]'
          : 'bg-surface-card text-text-muted border border-border-subtle cursor-not-allowed opacity-50'"
        :disabled="!selectedProfile || selectedZoneIds.size === 0"
        @click="openSpotify"
      >
        <IconPlay class="h-5 w-5" />
        <span v-if="!selectedProfile">Select a profile</span>
        <span v-else-if="selectedZoneIds.size === 0">Select zones</span>
        <span v-else>Play on {{ selectedZoneIds.size }} zone{{ selectedZoneIds.size > 1 ? 's' : '' }}</span>
      </button>
    </div>

    <!-- ── Spotify Embed (tablet only) ── -->
    <Transition name="embed">
      <div v-if="showSpotifyEmbed" class="spotify-embed rounded-2xl border border-border-subtle bg-surface-card overflow-hidden">
        <div class="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
          <div class="flex items-center gap-2">
            <IconMusic class="h-4 w-4 text-cat-audio" />
            <span class="text-xs font-semibold text-text-primary">Spotify — {{ selectedProfile?.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-1 text-xs text-text-muted hover:text-cat-audio transition-colors"
            >
              <IconExternalLink class="h-3 w-3" />
              Open
            </a>
            <button
              class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-surface-button-active cursor-pointer transition-colors"
              @click="closeEmbed"
            >
              <IconX class="h-4 w-4 text-text-muted" />
            </button>
          </div>
        </div>
        <iframe
          src="https://open.spotify.com/embed"
          title="Spotify Player"
          class="w-full border-0"
          style="height: 360px"
          allow="encrypted-media; autoplay; clipboard-write"
          loading="lazy"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.zone-btn {
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    transform 100ms ease;
}

.zone-btn:active {
  transform: scale(0.97);
}

.profile-btn {
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease,
    transform 100ms ease;
}

.profile-btn:active {
  transform: scale(0.95);
}

.play-btn {
  transition:
    background-color 150ms ease,
    transform 100ms ease,
    opacity 200ms ease;
}

.embed-enter-active,
.embed-leave-active {
  transition:
    max-height 400ms cubic-bezier(0.4, 0, 0.2, 1),
    opacity 300ms ease;
  max-height: 30rem;
}

.embed-enter-from,
.embed-leave-to {
  max-height: 0;
  opacity: 0;
}

.spotify-embed iframe {
  display: block;
}
</style>
