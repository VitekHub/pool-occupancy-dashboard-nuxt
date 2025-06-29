import { parse, startOfWeek, format } from 'date-fns'

export const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'dd.MM.yyyy', new Date());
};

export const getWeekId = (date: Date): string => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Week starts on Monday
  return format(weekStart, 'yyyy-MM-dd');
}

export const getHourFromTime = (timeStr: string): number => {
  const hourStr = timeStr.split(':')[0]
  return parseInt(hourStr, 10)
}