import type {
  OccupancyRecord,
  PoolConfig,
  PoolType,
  WeeklyOccupancyMap,
  OverallOccupancyMap,
} from '~/types'
import { isInsidePool } from '~/types'
import OccupancyDataProcessor from './occupancyDataProcessor'

export function processAllOccupancyData(
  occupancyData: OccupancyRecord[],
  selectedPool: PoolConfig,
  selectedPoolType: PoolType
): {
  weeklyOccupancyMap: WeeklyOccupancyMap
  overallOccupancyMap: OverallOccupancyMap
} {
  const occupancyDataProcessor = new OccupancyDataProcessor()
  const maxCapacity = isInsidePool(selectedPoolType)
    ? selectedPool.insidePool?.maximumCapacity || 0
    : selectedPool.outsidePool?.maximumCapacity || 0

  occupancyData.forEach((occupancyRecord) => {
    occupancyDataProcessor.processRecord(occupancyRecord, maxCapacity)
  })
  // Finalize the last hour's statistics
  occupancyDataProcessor.finalizeProcessing()

  return {
    weeklyOccupancyMap: occupancyDataProcessor.getWeeklyOccupancyMap(),
    overallOccupancyMap: occupancyDataProcessor.getOverallOccupancyMap(),
  }
}
