import { defineStore } from 'pinia'
import poolsConfig from '~/config/pools.json'
import { parseOccupancyCSV } from '~/utils/csv'
import type {
  PoolConfig,
  PoolType,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
  OccupancyRecord,
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
  rawOccupancyData: OccupancyRecord[]

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
    rawOccupancyData: [],
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

    // Get the full CSV URL for the selected pool
    csvUrl: (state): string => {
      const csvFileName = state.csvFileName
      if (!csvFileName) return ''
      
      const baseUrl = import.meta.env.VITE_CSV_BASE_URL || 'https://raw.githubusercontent.com/VitekHub/pool-occupancy-tracker/main/data/'
      return `${baseUrl}${csvFileName}`
    },

    // Get current occupancy (last record for today)
    currentOccupancy: (state): number | null => {
      if (state.rawOccupancyData.length === 0) return null
      
      const today = new Date()
      const todayString = today.toLocaleDateString('en-GB').replace(/\//g, '.')
      
      // Find the most recent record for today
      const todayRecords = state.rawOccupancyData.filter(record => {
        const recordDateString = record.date.toLocaleDateString('en-GB').replace(/\//g, '.')
        return recordDateString === todayString
      })
      
      if (todayRecords.length === 0) return null
      
      // Get the most recent record (last one in the array since they should be chronologically ordered)
      const mostRecentRecord = todayRecords[todayRecords.length - 1]
      return mostRecentRecord.occupancy
    },

    // Get maximum capacity for current pool
    currentMaxCapacity: (state): number => {
      if (!state.selectedPool) return 0
      
      if (
        state.selectedPoolType === POOL_TYPES.INSIDE &&
        state.selectedPool.insidePool
      ) {
        return state.selectedPool.insidePool.maximumCapacity
      } else if (
        state.selectedPoolType === POOL_TYPES.OUTSIDE &&
        state.selectedPool.outsidePool
      ) {
        return state.selectedPool.outsidePool.maximumCapacity
      }
      
      return 0
    },

    // Check if pool is currently open
    isPoolOpen: (state): boolean => {
      if (!state.selectedPool) return false
      
      const now = new Date()
      const currentHour = now.getHours()
      const isWeekend = now.getDay() === 0 || now.getDay() === 6 // Sunday = 0, Saturday = 6
      
      let openingHours: string
      if (
        state.selectedPoolType === POOL_TYPES.INSIDE &&
        state.selectedPool.insidePool
      ) {
        openingHours = isWeekend 
          ? state.selectedPool.insidePool.weekendOpeningHours
          : state.selectedPool.insidePool.weekdaysOpeningHours
      } else if (
        state.selectedPoolType === POOL_TYPES.OUTSIDE &&
        state.selectedPool.outsidePool
      ) {
        openingHours = isWeekend 
          ? state.selectedPool.outsidePool.weekendOpeningHours
          : state.selectedPool.outsidePool.weekdaysOpeningHours
      } else {
        return false
      }
      
      // Parse opening hours (format: "6-22" or "8-21")
      const [openHour, closeHour] = openingHours.split('-').map(h => parseInt(h))
      return currentHour >= openHour && currentHour < closeHour
    },
  },

   // Get today's opening hours
   todayOpeningHours: (state): string => {
     if (!state.selectedPool) return ''
     
     const now = new Date()
     const isWeekend = now.getDay() === 0 || now.getDay() === 6 // Sunday = 0, Saturday = 6
     
     let openingHours: string
     if (
       state.selectedPoolType === POOL_TYPES.INSIDE &&
       state.selectedPool.insidePool
     ) {
       openingHours = isWeekend 
         ? state.selectedPool.insidePool.weekendOpeningHours
         : state.selectedPool.insidePool.weekdaysOpeningHours
     } else if (
       state.selectedPoolType === POOL_TYPES.OUTSIDE &&
       state.selectedPool.outsidePool
     ) {
       openingHours = isWeekend 
         ? state.selectedPool.outsidePool.weekendOpeningHours
         : state.selectedPool.outsidePool.weekdaysOpeningHours
     } else {
       return ''
     }
     
     return openingHours
   },
  actions: {
    loadPoolsConfig() {
      try {
        this.pools = poolsConfig

        // Auto-select first pool that has outside pool configuration
        if (!this.selectedPool) {
          const firstPoolWithOutside = this.pools.find(pool => pool.outsidePool)
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

    async loadAndProcessOccupancyData() {
      if (!this.selectedPool || !this.csvFileName) {
        this.error = 'No pool selected or CSV file not found'
        return
      }

      this.isLoading = true
      this.error = null

      try {
        // Fetch CSV data directly
        const csvUrl = this.csvUrl

        const response = await $fetch<string>(csvUrl)

        if (!response) {
          throw new Error('No data received from CSV file')
        }

        // Parse CSV data
        const occupancyData = parseOccupancyCSV(response)
        
        // Store raw occupancy data
        this.rawOccupancyData = occupancyData

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
