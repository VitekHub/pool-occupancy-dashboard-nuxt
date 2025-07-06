import { defineStore } from 'pinia'
import { parseOccupancyCSV } from '~/utils/csv'
import { nowInPrague, getHourFromTime } from '~/utils/dateUtils'
import type {
  PoolConfig,
  PoolType,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
  OccupancyRecord,
  CurrentOccupancy,
  ViewMode,
  MetricType,
} from '~/types'
import { METRIC_TYPES, POOL_TYPES, VIEW_MODES } from '~/types'
import { processAllOccupancyData } from '~/utils/poolDataProcessor'

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
  overallOccupancyMap: OverallOccupancyMap
  rawOccupancyData: OccupancyRecord[]
  currentMaxCapacity: number

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
    overallOccupancyMap: {},
    rawOccupancyData: [],
    currentMaxCapacity: 0,
    isLoading: false,
    error: null,
  }),

  getters: {
    // Get available week IDs from the weekly occupancy map
    availableWeekIds: (state): string[] => {
      return Object.keys(state.weeklyOccupancyMap).sort()
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

    // Get the CSV file name for the selected pool and type
    csvFileName: (state): string => {
      const poolConfig = state.currentPoolConfig
      return poolConfig?.csvFile || ''
    },

    // Get the full CSV URL for the selected pool
    csvUrl: (state): string => {
      const csvFileName = state.csvFileName
      if (!csvFileName) return ''
      return `${import.meta.env.VITE_CSV_BASE_URL}${csvFileName}`
    },

    // Get current occupancy (last record for today)
    currentOccupancy: (state): CurrentOccupancy | null => {
      if (state.rawOccupancyData.length === 0) return null

      const today = nowInPrague()
      const todayString = today.toLocaleDateString('en-GB').replace(/\//g, '.')

      // Find the most recent record for today
      const todayRecords = state.rawOccupancyData.filter((record) => {
        const recordDateString = record.date
          .toLocaleDateString('en-GB')
          .replace(/\//g, '.')
        return recordDateString === todayString
      })

      if (todayRecords.length === 0) return null

      const lastRecord = todayRecords[todayRecords.length - 1]
      const averageUtilizationRate =
        state.overallOccupancyMap[lastRecord.day][
          getHourFromTime(lastRecord.time)
        ]?.averageUtilizationRate
      const currentUtilizationRate = Math.round(
        (lastRecord.occupancy / state.currentMaxCapacity) * 100
      )

      return {
        occupancy: lastRecord.occupancy,
        time: lastRecord.time,
        averageUtilizationRate,
        currentUtilizationRate,
      }
    },

    // Get maximum capacity for current pool
    getCurrentMaxCapacity: (state): number => {
      const poolConfig = state.currentPoolConfig
      return poolConfig?.maximumCapacity || 0
    },

    // Check if pool is currently open
    isPoolOpen: (state): boolean => {
      const openingHours: string = state.todayOpeningHours
      if (!openingHours) {
        return false
      }

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
  },
  actions: {
    async loadPoolsConfig() {
      try {
        const response = await fetch(
          import.meta.env.VITE_POOL_OCCUPANCY_CONFIG_URL
        )
        if (!response.ok) throw new Error('Failed to fetch pools config')
        this.pools = await response.json()

        // Auto-select first pool that has outside pool configuration
        if (!this.selectedPool) {
          const firstPoolWithOutside = this.pools.find(
            (pool) => pool.outsidePool
          )
          if (firstPoolWithOutside) {
            this.selectedPool = firstPoolWithOutside
          }
          this.selectedPoolType = POOL_TYPES.OUTSIDE
        }
      } catch (error) {
        this.error = 'Failed to load pools configuration'
        console.error('Error loading pools config:', error)
      }
    },

    processOccupancyCsvData(csvText: string) {
      if (!this.selectedPool || !csvText) {
        this.error = 'No pool selected or no CSV data provided'
        return
      }

      this.isLoading = true
      this.error = null

      try {
        const occupancyData = parseOccupancyCSV(csvText)

        this.rawOccupancyData = occupancyData

        const processed = processAllOccupancyData(
          occupancyData,
          this.selectedPool,
          this.selectedPoolType
        )

        this.weeklyOccupancyMap = processed.weeklyOccupancyMap
        this.overallOccupancyMap = processed.overallOccupancyMap
        this.currentMaxCapacity = this.getCurrentMaxCapacity
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('Error loading occupancy data:', error)
      } finally {
        this.isLoading = false
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
