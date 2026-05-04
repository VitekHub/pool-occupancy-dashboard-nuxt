import { startOfWeek, format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const PRAGUE_TIMEZONE = 'Europe/Prague'

export const nowInPrague = (): Date => {
  return toZonedTime(new Date(), PRAGUE_TIMEZONE)
}

export const getWeekId = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Week starts on Monday
  return format(weekStart, 'yyyy-MM-dd')
}

export const formatWeekId = (weekId: string, locale: string): string => {
  const date = new Date(weekId)
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  return weekId
}

export const getDayName = (date: Date): string => {
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export const isDayToday = (day: string): boolean => {
  return day.toLowerCase() === getDayName(nowInPrague()).toLowerCase()
}
