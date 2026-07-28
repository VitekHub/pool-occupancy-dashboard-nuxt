// Easter Sunday for a given year (Meeus/Jones/Butcher Gregorian algorithm).
const easterSunday = (year: number): Date => {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

// Fixed-date Czech public holidays as "month-day" (1-indexed month).
const FIXED_HOLIDAYS = new Set<string>([
  '1-1', // New Year's Day / Restoration of the Czech State
  '5-1', // Labour Day
  '5-8', // Victory Day
  '7-5', // Saints Cyril and Methodius
  '7-6', // Jan Hus Day
  '9-28', // Czech Statehood Day
  '10-28', // Independent Czechoslovak State Day
  '11-17', // Struggle for Freedom and Democracy Day
  '12-24', // Christmas Eve
  '12-25', // Christmas Day
  '12-26', // St. Stephen's Day
])

// Determines whether a date is an official Czech public holiday.
export const isCzechPublicHoliday = (date: Date): boolean => {
  const key = `${date.getMonth() + 1}-${date.getDate()}`
  if (FIXED_HOLIDAYS.has(key)) return true

  const easter = easterSunday(date.getFullYear())
  const goodFriday = new Date(easter)
  goodFriday.setDate(easter.getDate() - 2)
  const easterMonday = new Date(easter)
  easterMonday.setDate(easter.getDate() + 1)

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  return sameDay(date, goodFriday) || sameDay(date, easterMonday)
}
