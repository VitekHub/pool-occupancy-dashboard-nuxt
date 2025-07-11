export const POOL_TYPES = {
  INSIDE: 'inside',
  OUTSIDE: 'outside',
} as const

export type PoolType = (typeof POOL_TYPES)[keyof typeof POOL_TYPES]

export const isInsidePool = (poolType: PoolType): boolean => {
  return poolType === POOL_TYPES.INSIDE
}

export const VIEW_MODES = {
  OVERALL: 'overall',
  WEEKLY: 'weekly',
} as const
export type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES]

export const METRIC_TYPES = {
  MEDIAN: 'median',
  AVERAGE: 'average',
  WEIGHTED_AVERAGE: 'weightedAverage',
  PERCENTAGE: 'percentage',
  MIN_MAX: 'minMax',
} as const
export type MetricType = (typeof METRIC_TYPES)[keyof typeof METRIC_TYPES]

export const UTILIZATION_THRESHOLDS = {
  VERY_LOW: 25,
  LOW: 50,
  MEDIUM: 75,
  HIGH: 100,
} as const

export const UTILIZATION_COLORS = {
  EMPTY: 'bg-gray-100 dark:bg-gray-700',
  VERY_LOW: 'bg-blue-100 dark:bg-blue-600',
  LOW: 'bg-blue-300 dark:bg-blue-800',
  MEDIUM: 'bg-teal-300 dark:bg-teal-600',
  HIGH: 'bg-orange-300 dark:bg-orange-600',
  VERY_HIGH: 'bg-red-400 dark:bg-red-600',
} as const

interface PoolTypeConfig {
  customName?: string
  url: string
  pattern: string
  csvFile: string
  maximumCapacity: number
  totalLanes?: number
  weekdaysOpeningHours: string
  weekendOpeningHours: string
  todayClosed: boolean
  collectStats: boolean
  viewStats: boolean
  temporarilyClosed?: string
}

export interface PoolConfig {
  name: string
  insidePool?: PoolTypeConfig
  outsidePool?: Omit<PoolTypeConfig, 'totalLanes'>
}

export interface OccupancyRecord {
  date: Date
  day: string
  time: string
  occupancy: number
  hour: number
}

export interface HourlyOccupancySummary {
  day: string
  hour: number
  minOccupancy: number
  maxOccupancy: number
  averageOccupancy: number
  maximumCapacity: number
  utilizationRate: number
  remainingCapacity: number
  date: Date
}

export interface WeeklyOccupancyMap {
  [weekId: string]: {
    maxWeekValues: {
      utilizationRate: number
    }
    days: {
      [day: string]: {
        [hour: number]: HourlyOccupancySummary
        maxDayValues: {
          utilizationRate: number
        }
      }
    }
  }
}

export interface OverallUtilizationValues {
  averageUtilizationRate: number
  weightedAverageUtilizationRate: number
  medianUtilizationRate: number
}

export interface OverallOccupancyMap {
  maxOverallValues: OverallUtilizationValues
  days: {
    [day: string]: {
      [hour: number]: OverallUtilizationValues
      maxDayValues: OverallUtilizationValues
    }
  }
}

export interface BaseCellData {
  color: string
  colorFillRatio: number
  displayText: string
  title: string
  isCurrentHour: boolean
}

export interface CurrentOccupancy {
  occupancy: number
  time: string
  averageUtilizationRate: number
  currentUtilizationRate: number
}
