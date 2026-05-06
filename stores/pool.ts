import { defineStore } from 'pinia'
import { nowInPrague } from '~/utils/dateUtils'
import type {
  PoolConfig,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
  CurrentOccupancy,
  ViewMode,
  MetricType,
  OverallJson,
  WeeklyJson,
} from '~/types'
import { METRIC_TYPES, VIEW_MODES } from '~/types'

const dataBaseUrl = import.meta.env.VITE_DATA_BASE_URL
const poolConfigUrl = import.meta.env.VITE_POOL_OCCUPANCY_CONFIG_URL

interface PoolState {
  // Configuration
  pools: PoolConfig[]
  selectedPool: PoolConfig | null
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
        return pool.viewStats
      })
    },

    // Get the raw CSV download URL for the selected pool (used by export button)
    csvUrl: (state): string => {
      const raw = state.selectedPool?.data?.occupancy?.raw
      if (!raw) return ''
      return `${dataBaseUrl}${raw}`
    },

    // Get the overall JSON URL for the selected pool
    overallJsonUrl: (state): string => {
      const overall = state.selectedPool?.data?.occupancy?.overall
      if (!overall) return ''
      return `${dataBaseUrl}${overall}`
    },

    // Get the weekly JSON URL for the selected pool
    weeklyJsonUrl: (state): string => {
      const weekly = state.selectedPool?.data?.occupancy?.weekly
      if (!weekly) return ''
      return `${dataBaseUrl}${weekly}`
    },

    // Get current occupancy (last record for today)
    currentOccupancy: (state): CurrentOccupancy | null => {
      return state.precomputedCurrentOccupancy
    },

    // Check if pool is currently open
    isPoolOpen: (state): boolean => {
      const pool = state.selectedPool
      if (!pool) return false

      if (state.isPoolTemporarilyClosed) return false

      if (pool.todayClosed) return false

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
      const pool = state.selectedPool
      if (!pool) return ''

      const now = nowInPrague()
      const isWeekend = now.getDay() === 0 || now.getDay() === 6 // Sunday = 0, Saturday = 6

      return isWeekend ? pool.weekendOpeningHours : pool.weekdaysOpeningHours
    },

    /**
     * Returns true if the current pool type is temporarily closed based on the 'temporarilyClosed' field.
     * The field should be a string in the format "1.9.2025 - 31.5.2026".
     */
    isPoolTemporarilyClosed: (state): boolean => {
      const pool = state.selectedPool
      if (!pool || !pool.temporarilyClosed) return false

      // Example: "1.9.2025 - 31.5.2026"
      const range = pool.temporarilyClosed
      const [startStr, endStr] = range.split('-').map((s) => s.trim())
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
        const response = await fetch(poolConfigUrl)
        if (!response.ok) throw new Error('Failed to fetch pools config')
        this.pools = await response.json()

        // Auto-select first pool with viewStats true
        if (!this.selectedPool) {
          const firstVisiblePool = this.pools.find((pool) => pool.viewStats)
          if (firstVisiblePool) {
            this.selectedPool = firstVisiblePool
          }
        } else {
          // Update selected pool from updated pool configuration
          const selectedName = this.selectedPool.name
          const updatedPool = this.pools.find(
            (pool) => pool.name === selectedName
          )
          if (updatedPool) {
            // Check if the updated pool is still visible
            if (updatedPool.viewStats) {
              this.selectedPool = updatedPool
            } else {
              // If not visible, select the first visible pool
              const firstVisiblePool = this.pools.find((pool) => pool.viewStats)
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

    setSelectedPool(pool: PoolConfig) {
      this.selectedPool = pool
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
