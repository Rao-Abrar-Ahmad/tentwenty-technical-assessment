import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDayLabel = (date: Date) => {
  const day = date.getUTCDate();
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${month} ${day}`;
};

export const getDayName = (date: Date) => {
  return date.toLocaleString("en-US", { weekday: "long", timeZone: "UTC" });
};

export const formatHeaderRange = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = new Date(endStr);

  const startDay = start.getUTCDate();
  const startMonth = start.toLocaleString("en-US", { month: "long", timeZone: "UTC" });

  const endDay = end.getUTCDate();
  const endMonth = end.toLocaleString("en-US", { month: "long", timeZone: "UTC" });
  const year = start.getFullYear();

  if (startMonth !== endMonth) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
  }

  return `${startDay}–${endDay} ${startMonth}, ${year}`;
};

export const isSameUTCDate = (d1: Date, d2: Date) => {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
};