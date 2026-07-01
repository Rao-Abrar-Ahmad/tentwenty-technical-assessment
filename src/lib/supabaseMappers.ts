export type SupabaseEntryRow = {
  id: string;
  date: string;
  project: string;
  type_of_work: string;
  task_description: string;
  hours_worked: number;
  created_at?: string;
};

export type SupabaseTimesheetRow = {
  id: string;
  user_id: string;
  year: number;
  week_number: number;
  week_start: string;
  week_end: string;
  created_at: string;
  updated_at: string;
  entries?: SupabaseEntryRow[];
};

export function mapEntry(row: SupabaseEntryRow) {
  return {
    _id: row.id,
    date: row.date,
    project: row.project,
    typeOfWork: row.type_of_work,
    taskDescription: row.task_description,
    hoursWorked: row.hours_worked,
  };
}

export function mapTimesheet(row: SupabaseTimesheetRow) {
  return {
    _id: row.id,
    userId: row.user_id,
    year: row.year,
    weekNumber: row.week_number,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    entries: (row.entries ?? []).map(mapEntry),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

