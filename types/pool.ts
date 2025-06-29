export const POOL_TYPES = {
  INSIDE: 'inside',
  OUTSIDE: 'outside'
} as const;

export type PoolType = typeof POOL_TYPES[keyof typeof POOL_TYPES];

export const isInsidePool = (poolType: PoolType): boolean => {
  return poolType === POOL_TYPES.INSIDE;
}

interface PoolTypeConfig {
  customName?: string;
  url: string;
  pattern: string;
  csvFile: string;
  maximumCapacity: number;
  totalLanes?: number;
  weekdaysOpeningHours: string;
  weekendOpeningHours: string;
  collectStats: boolean;
  viewStats: boolean;
  temporarilyClosed?: string;
}

export interface PoolConfig {
  name: string;
  icon?: string; // Icon name for UIcon component (e.g., 'i-heroicons-users')
  insidePool?: PoolTypeConfig;
  outsidePool?: Omit<PoolTypeConfig, 'totalLanes'>;
}

export interface OccupancyRecord {
  date: Date;
  day: string;
  time: string;
  occupancy: number;
  hour: number;
}

export interface HourlyOccupancySummary {
  day: string;
  hour: number;
  minOccupancy: number;
  maxOccupancy: number;
  averageOccupancy: number;
  maximumCapacity: number;
  utilizationRate: number;
  remainingCapacity: number;
  date: Date;
}

export interface HourlyOccupancySummaryWithLanes extends HourlyOccupancySummary {
  lanes?: {
    current: number;
    total: number;
    colorFillRatio: number;
  };
}

export interface WeeklyOccupancyMap {
  [weekId: string]: {
    [day: string]: {
      [hour: number]: HourlyOccupancySummaryWithLanes;
      maxDayValues: {
        utilizationRate: number;
        maxOccupancy: number;
      };
    };
  };
}

export interface OverallOccupancyMap {
  [day: string]: {
    [hour: number]: {
      averageUtilizationRate: number;
    };
    maxDayValues: {
      averageUtilizationRate: number;
    };
  };
}
