import { defineStore } from 'pinia'
import { nowInPrague } from '~/utils/dateUtils'
import type {
  PoolConfig,
  PoolType,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
  CurrentOccupancy,
  ViewMode,
  MetricType,
  OverallJson,
  WeeklyJson,
} from '~/types'
import { METRIC_TYPES, POOL_TYPES, VIEW_MODES } from '~/types'

interface PoolState {
  // Configuration
  pools: PoolConfig[]
  selectedPool: PoolConfig | null
  selectedPoolType: PoolType
  heatmapHighThreshold: number
  uniformHeatmapBarHeight: boolean
  forceMobileView: boolean
  viewMode: ViewMode
  metricType: MetricType
  selectedWeekId: string | null

  // Processed data
  weeklyOccupancyMap: WeeklyOccupancyMap
  availableWeekIds: string[]
  overallOccupancyMap: OverallOccupancyMap
  precomputedCurrentOccupancy: CurrentOccupancy | null
  weeklyOccupancyLoaded: boolean

  // Loading states
  isLoading: boolean
  error: string | null
}

export const usePoolStore = defineStore('pool', {
  state: (): PoolState => ({
    pools: [],
    selectedPool: null,
    selectedPoolType: POOL_TYPES.OUTSIDE,
    heatmapHighThreshold: 60,
    uniformHeatmapBarHeight: false,
    forceMobileView: false,
    viewMode: VIEW_MODES.OVERALL,
    metricType: METRIC_TYPES.AVERAGE,
    selectedWeekId: null,
    weeklyOccupancyMap: {},
    availableWeekIds: [],
    overallOccupancyMap: {
      maxOverallValues: {
        averageUtilizationRate: 0,
        weightedAverageUtilizationRate: 0,
        medianUtilizationRate: 0,
      },
      days: {},
    },
    precomputedCurrentOccupancy: null,
    weeklyOccupancyLoaded: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Get pools that are visible based on viewStats
    visiblePools: (state): PoolConfig[] => {
      return state.pools.filter((pool) => {
        const poolTypeConfig = pool.outsidePool || pool.insidePool
        return poolTypeConfig && poolTypeConfig.viewStats
      })
    },

    // Get the current pool configuration (inside or outside) based on selected type
    currentPoolConfig: (
      state
    ): PoolConfig['insidePool'] | PoolConfig['outsidePool'] | null => {
      if (!state.selectedPool) return null
      if (
        state.selectedPoolType === POOL_TYPES.INSIDE &&
        state.selectedPool.insidePool
      ) {
        return state.selectedPool.insidePool
      } else if (
        state.selectedPoolType === POOL_TYPES.OUTSIDE &&
        state.selectedPool.outsidePool
      ) {
        return state.selectedPool.outsidePool
      }
      return null
    },

    // Get the raw CSV download URL for the selected pool (used by export button)
    csvUrl: (state): string => {
      const raw = state.currentPoolConfig?.data?.occupancy?.raw
      if (!raw) return ''
      return `${import.meta.env.VITE_CSV_BASE_URL}${raw}`
    },

    // Get the overall JSON URL for the selected pool
    overallJsonUrl: (state): string => {
      const overall = state.currentPoolConfig?.data?.occupancy?.overall
      if (!overall) return ''
      return `${import.meta.env.VITE_JSON_BASE_URL}${overall}`
    },

    // Get the weekly JSON URL for the selected pool
    weeklyJsonUrl: (state): string => {
      const weekly = state.currentPoolConfig?.data?.occupancy?.weekly
      if (!weekly) return ''
      return `${import.meta.env.VITE_JSON_BASE_URL}${weekly}`
    },

    // Get current occupancy (last record for today)
    currentOccupancy: (state): CurrentOccupancy | null => {
      return state.precomputedCurrentOccupancy
    },

    // Check if pool is currently open
    isPoolOpen: (state): boolean => {
      const poolConfig = state.currentPoolConfig
      if (!poolConfig) return false

      if (state.isPoolTemporarilyClosed) return false

      if (poolConfig.todayClosed) return false

      const openingHours: string = state.todayOpeningHours
      if (!openingHours) return false

      const currentHour = nowInPrague().getHours()
      // Parse opening hours (format: "6-22" or "8-21")
      const [openHour, closeHour] = openingHours
        .split('-')
        .map((h) => parseInt(h))
      return currentHour >= openHour && currentHour < closeHour
    },

    // Get today's opening hours
    todayOpeningHours: (state): string => {
      const poolConfig = state.currentPoolConfig
      if (!poolConfig) return ''

      const now = nowInPrague()
      const isWeekend = now.getDay() === 0 || now.getDay() === 6 // Sunday = 0, Saturday = 6

      return isWeekend
        ? poolConfig.weekendOpeningHours
        : poolConfig.weekdaysOpeningHours
    },

    /**
     * Returns true if the current pool type is temporarily closed based on the 'temporarilyClosed' field.
     * The field should be a string in the format "1.9.2025 - 31.5.2026".
     */
    isPoolTemporarilyClosed: (state): boolean => {
      const poolConfig = state.currentPoolConfig
      if (!poolConfig || !poolConfig.temporarilyClosed) return false

      // Example: "1.9.2025 - 31.5.2026"
      const range = poolConfig.temporarilyClosed
      const [startStr, endStr] = range.split('-').map(s => s.trim())
      if (!startStr || !endStr) return false

      // Parse dates as dd.mm.yyyy
      const parseDate = (str: string) => {
        const [day, month, year] = str.split('.').map(Number)
        return new Date(year, month - 1, day)
      }

      const startDate = parseDate(startStr)
      const endDate = parseDate(endStr)
      const today = nowInPrague()
      today.setHours(0, 0, 0, 0)

      return today >= startDate && today <= endDate
    },
  },
  actions: {
    async loadPoolsConfig() {
      try {
        const response = await fetch(
          import.meta.env.VITE_POOL_OCCUPANCY_CONFIG_URL
        )
        if (!response.ok) throw new Error('Failed to fetch pools config')
        this.pools = await response.json()

        // Auto-select first pool that has outside pool configuration and viewStats true
        if (!this.selectedPool) {
          const firstPoolWithOutside = this.pools.find(
            (pool) => pool.outsidePool && pool.outsidePool.viewStats
          )
          if (firstPoolWithOutside) {
            this.selectedPool = firstPoolWithOutside
          }
          this.selectedPoolType = POOL_TYPES.OUTSIDE
        } else {
          // Update selected pool from updated pool configuration
          const selectedName = this.selectedPool.name
          const updatedPool = this.pools.find(
            (pool) => pool.name === selectedName
          )
          if (updatedPool) {
            // Check if the updated pool is still visible
            const poolTypeConfig = updatedPool.outsidePool || updatedPool.insidePool
            if (poolTypeConfig && poolTypeConfig.viewStats) {
              this.selectedPool = updatedPool
            } else {
              // If not visible, select the first visible pool
              const firstVisiblePool = this.pools.find(
                (pool) => {
                  const config = pool.outsidePool || pool.insidePool
                  return config && config.viewStats
                }
              )
              if (firstVisiblePool) {
                this.selectedPool = firstVisiblePool
              }
            }
          }
        }
      } catch (error) {
        this.error = 'Failed to load pools configuration'
        console.error('Error loading pools config:', error)
      }
    },

    loadOverallJsonData(json: OverallJson) {
      this.isLoading = true
      this.error = null

      try {
        this.overallOccupancyMap = json.overallOccupancyMap
        this.precomputedCurrentOccupancy = json.currentOccupancy
        this.weeklyOccupancyMap = {}
        this.availableWeekIds = []
        this.weeklyOccupancyLoaded = false
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('Error loading overall JSON data:', error)
      } finally {
        this.isLoading = false
      }
    },

    loadWeeklyJsonData(json: WeeklyJson) {
      try {
        this.weeklyOccupancyMap = json.weeklyOccupancyMap
        this.availableWeekIds = json.availableWeekIds
        this.weeklyOccupancyLoaded = true
      } catch (error) {
        console.error('Error loading weekly JSON data:', error)
      }
    },

    setSelectedPool(pool: PoolConfig, poolType: PoolType) {
      this.selectedPool = pool
      this.selectedPoolType = poolType
    },

    setHeatmapHighThreshold(threshold: number) {
      this.heatmapHighThreshold = threshold
    },

    setUniformHeatmapBarHeight(uniform: boolean) {
      this.uniformHeatmapBarHeight = uniform
    },

    setForceMobileView(force: boolean) {
      this.forceMobileView = force
    },

    setViewMode(viewMode: ViewMode) {
      this.viewMode = viewMode
    },

    setMetricType(metricType: MetricType) {
      this.metricType = metricType
    },

    setSelectedWeekId(selectedWeekId: string | null) {
      this.selectedWeekId = selectedWeekId
    },
  },
})
