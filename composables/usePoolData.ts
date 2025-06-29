import type { OccupancyRecord } from '~/types'

export const usePoolData = () => {
  const { data: csvData, pending, error, refresh } = useFetch<string>(
    'https://raw.githubusercontent.com/VitekHub/pool-occupancy-tracker/main/data/kravi_hora_outside_pool_occupancy.csv',
    {
      key: 'pool-occupancy-data',
      default: () => '',
    }
  )

  // Parse CSV data into OccupancyRecord array
  const occupancyData = computed<OccupancyRecord[]>(() => {
    if (!csvData.value) return []

    try {
      return parseOccupancyCSV(csvData.value)
    } catch (error) {
      console.error('Error parsing CSV data:', error)
      return []
    }
  })

  return {
    occupancyData: readonly(occupancyData),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
  }
}