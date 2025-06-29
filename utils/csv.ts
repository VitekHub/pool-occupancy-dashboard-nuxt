import type { OccupancyRecord } from '~/types'
import { parseDate, getHourFromTime } from './dateUtils'

// Parse the CSV text into OccupancyRecord objects
export const parseOccupancyCSV = (csvText: string): OccupancyRecord[] => {
  const lines = csvText.trim().split('\n')

  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const parsedDate = parseDate(values[0])
    const date = createPragueDate(parsedDate)
    return {
      date,
      day: values[1],
      time: values[2],
      occupancy: parseInt(values[3], 10),
      hour: getHourFromTime(values[2]),
    }
  })
}
