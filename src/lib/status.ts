export interface Entry {
  hoursWorked: number;
  [key: string]: any;
}

export function getStatus(entries: Entry[]): 'Missing' | 'Incomplete' | 'Completed' {
  if (!entries || entries.length === 0) return 'Missing';
  const total = entries.reduce((sum, e) => sum + e.hoursWorked, 0);
  return total >= 40 ? 'Completed' : 'Incomplete';
}

export function getISOWeekDetails(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    weekNumber: weekNo,
  };
}

export function getWeekStartAndEnd(year: number, weekNumber: number) {
  const simple = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = simple.getUTCDay() || 7;
  const monday = new Date(simple.getTime() - (dayOfWeek - 1) * 86400000);
  const targetMonday = new Date(monday.getTime() + (weekNumber - 1) * 7 * 86400000);
  const targetFriday = new Date(targetMonday.getTime() + 4 * 86400000);

  targetMonday.setUTCHours(0, 0, 0, 0);
  targetFriday.setUTCHours(23, 59, 59, 999);

  return {
    weekStart: targetMonday,
    weekEnd: targetFriday,
  };
}

export function getWeeksInIntersection(from: Date, to: Date) {
  const weeks: Array<{ year: number; weekNumber: number; weekStart: Date; weekEnd: Date }> = [];
  
  const fromWeek = getISOWeekDetails(from);
  const startWeekInfo = getWeekStartAndEnd(fromWeek.year, fromWeek.weekNumber);
  
  let currentMonday = new Date(startWeekInfo.weekStart);
  
  while (currentMonday <= to) {
    const { year, weekNumber } = getISOWeekDetails(currentMonday);
    const { weekStart, weekEnd } = getWeekStartAndEnd(year, weekNumber);
    weeks.push({ year, weekNumber, weekStart, weekEnd });
    
    currentMonday = new Date(currentMonday.getTime() + 7 * 86400000);
  }
  
  return weeks;
}

export function formatWeekRange(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  
  const startDay = start.getUTCDate();
  const startMonth = start.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const startYear = start.getUTCFullYear();
  
  const endDay = end.getUTCDate();
  const endMonth = end.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const endYear = end.getUTCFullYear();
  
  if (startYear !== endYear) {
    return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
  }
  
  if (startMonth !== endMonth) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }
  
  return `${startDay}–${endDay} ${startMonth} ${startYear}`;
}
