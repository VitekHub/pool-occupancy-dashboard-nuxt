import { parse, startOfWeek, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

// Prague timezone constant
const PRAGUE_TIMEZONE = 'Europe/Prague'

// Create a new Date in Prague timezone
export const createPragueDate = (date?: string | number | Date): Date => {
  if (date) {
    // If a date is provided, convert it to Prague timezone
    const utcDate = new Date(date)
    return toZonedTime(utcDate, PRAGUE_TIMEZONE)
  }
  // If no date provided, get current time in Prague timezone
  const now = new Date()
  return toZonedTime(now, PRAGUE_TIMEZONE)
}

// Get current time in Prague timezone
export const nowInPrague = (): Date => {
  return createPragueDate()
}

export const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'dd.MM.yyyy', new Date())
}

export const getWeekId = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Week starts on Monday
  return format(weekStart, 'yyyy-MM-dd')
}

export const formatWeekId = (weekId: string, locale: string): string => {
  try {
    const date = new Date(weekId)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return weekId
  }
}

export const getHourFromTime = (timeStr: string): number => {
  const hourStr = timeStr.split(':')[0]
  return parseInt(hourStr, 10)
}

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export const isDayToday = (day: string): boolean => {
  return day.toLowerCase() === getDayName(new Date()).toLowerCase()
}
