import { defineStore } from 'pinia'
import poolsConfig from '~/config/pools.json'
import { parseOccupancyCSV } from '~/utils/csv'
import type {
  PoolConfig,
  PoolType,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
} from '~/types'
import { POOL_TYPES } from '~/types'
import { processAllOccupancyData } from '~/utils/poolDataProcessor'

interface PoolState {
  // Configuration
  pools: PoolConfig[]
  selectedPool: PoolConfig | null
  selectedPoolType: PoolType
  heatmapHighThreshold: number
  uniformHeatmapBarHeight: boolean
  forceMobileView: boolean

  // Processed data
  weeklyOccupancyMap: WeeklyOccupancyMap
  overallOccupancyMap: OverallOccupancyMap

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
    weeklyOccupancyMap: {},
    overallOccupancyMap: {},
    isLoading: false,
    error: null,
  }),

  getters: {
    // Get available week IDs from the weekly occupancy map
    availableWeekIds: (state): string[] => {
      return Object.keys(state.weeklyOccupancyMap).sort()
    },

    // Get the CSV file name for the selected pool and type
    csvFileName: (state): string => {
      if (!state.selectedPool) return ''

      if (
        state.selectedPoolType === POOL_TYPES.INSIDE &&
        state.selectedPool.insidePool
      ) {
        return state.selectedPool.insidePool.csvFile
      } else if (
        state.selectedPoolType === POOL_TYPES.OUTSIDE &&
        state.selectedPool.outsidePool
      ) {
        return state.selectedPool.outsidePool.csvFile
      }

      return ''
    },
  },

  actions: {
    loadPoolsConfig() {
      try {
        this.pools = poolsConfig

        // Auto-select first pool's outside pool if available
        if (this.pools.length > 0 && !this.selectedPool) {
          this.selectedPool = this.pools[0]
          this.selectedPoolType = POOL_TYPES.OUTSIDE
        }
      } catch (error) {
        this.error = 'Failed to load pools configuration'
        console.error('Error loading pools config:', error)
      }
    },

    async loadAndProcessOccupancyData() {
      if (!this.selectedPool || !this.csvFileName) {
        this.error = 'No pool selected or CSV file not found'
        return
      }

      this.isLoading = true
      this.error = null

      try {
        // Fetch CSV data directly
        const csvUrl = `https://raw.githubusercontent.com/VitekHub/pool-occupancy-tracker/main/data/${this.csvFileName}`

        const response = await $fetch<string>(csvUrl)

        if (!response) {
          throw new Error('No data received from CSV file')
        }

        // Parse CSV data
        const occupancyData = parseOccupancyCSV(response)

        // Process the data
        const processed = processAllOccupancyData(
          occupancyData,
          this.selectedPool,
          this.selectedPoolType
        )

        this.weeklyOccupancyMap = processed.weeklyOccupancyMap
        this.overallOccupancyMap = processed.overallOccupancyMap
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('Error loading occupancy data:', error)
      } finally {
        this.isLoading = false
      }
    },

    async refresh() {
      await this.loadAndProcessOccupancyData()
    },

    setSelectedPool(pool: PoolConfig, poolType: PoolType) {
      this.selectedPool = pool
      this.selectedPoolType = poolType
      // Automatically reload data when pool selection changes
      this.loadAndProcessOccupancyData()
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
  },
})
