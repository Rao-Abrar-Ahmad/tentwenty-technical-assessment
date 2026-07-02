import { z } from "zod";
import { PROJECTS, TYPES_OF_WORK } from "./constants";

export const entryInputSchema = z.object({
  date: z.coerce.date(),
  project: z.enum(PROJECTS, { message: 'Project is required' }),
  typeOfWork: z.enum(TYPES_OF_WORK, { message: 'Type of work is required' }),
  taskDescription: z.string().min(1, 'Task description is required'),
  hoursWorked: z.number().positive('Hours must be greater than 0'),
});

export const createTimesheetSchema = z.object({
  year: z.number(),
  weekNumber: z.number().min(1).max(53),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
