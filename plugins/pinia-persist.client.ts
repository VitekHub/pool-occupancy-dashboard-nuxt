import type { PiniaPluginContext } from 'pinia'

const STORAGE_KEY = 'pool-store-prefs'

const PERSIST_KEYS = [
  'uniformHeatmapBarHeight',
  'heatmapHighThreshold',
  'showOpenLanes',
  'forceMobileView',
] as const

type PersistKey = (typeof PERSIST_KEYS)[number]

function persistPlugin({ store }: PiniaPluginContext) {
  if (store.$id !== 'pool') return

  // Hydrate from localStorage on store creation
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      const patch: Partial<Record<PersistKey, unknown>> = {}
      for (const key of PERSIST_KEYS) {
        if (key in parsed) {
          patch[key] = parsed[key]
        }
      }
      if (Object.keys(patch).length > 0) {
        store.$patch(patch)
      }
    } catch {
      // Ignore corrupt localStorage data
    }
  }

  // Subscribe to changes and write back
  store.$subscribe((_mutation, state) => {
    const toSave: Partial<Record<PersistKey, unknown>> = {}
    for (const key of PERSIST_KEYS) {
      toSave[key] = (state as Record<string, unknown>)[key]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  })
}

export default defineNuxtPlugin(({ $pinia }) => {
  $pinia.use(persistPlugin)
})
