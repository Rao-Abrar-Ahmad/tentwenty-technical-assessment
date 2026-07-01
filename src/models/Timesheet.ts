import mongoose, { Schema, model, models } from "mongoose";

const EntrySchema = new Schema({
  date: { type: Date, required: true },
  project: { type: String, required: true },
  typeOfWork: { type: String, required: true },
  taskDescription: { type: String, required: true },
  hoursWorked: { type: Number, required: true, min: 0.01 },
});

const TimesheetSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  year: { type: Number, required: true },
  weekNumber: { type: Number, required: true },
  weekStart: { type: Date, required: true },
  weekEnd: { type: Date, required: true },
  entries: [EntrySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TimesheetSchema.index({ userId: 1, year: 1, weekNumber: 1 }, { unique: true });

export const Timesheet = models.Timesheet || model("Timesheet", TimesheetSchema);
export const Entry = models.Entry || model("Entry", EntrySchema); // optional, entry schema is nested
