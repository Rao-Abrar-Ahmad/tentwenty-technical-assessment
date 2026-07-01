import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../src/models/User";
import { Timesheet } from "../src/models/Timesheet";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable in .env.local");
  process.exit(1);
}

async function seed() {
  console.log('Start connecting to DB')
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB for seeding.");

  await User.deleteMany({});
  await Timesheet.deleteMany({});
  console.log("Cleared existing users and timesheets.");

  const passwordHash = await bcrypt.hash("password123", 10);

  const user1 = await User.create({
    email: "user@example.com",
    name: "John Doe",
    passwordHash,
    createdAt: new Date(),
  });

  const user2 = await User.create({
    email: "user1@example.com",
    name: "Jane Smith",
    passwordHash,
    createdAt: new Date(),
  });

  console.log("Seeded Users:");
  console.log("1. Email: user@example.com, Password: password123");
  console.log("2. Email: user1@example.com, Password: password123");

  const parseDate = (d: string) => new Date(Date.parse(d));

  // Week 25: June 15-19, 2026 (Completed, 42 hours)
  const w25Start = parseDate("2026-06-15T00:00:00Z");
  const w25End = parseDate("2026-06-19T23:59:59Z");
  await Timesheet.create({
    userId: user1._id,
    year: 2026,
    weekNumber: 25,
    weekStart: w25Start,
    weekEnd: w25End,
    entries: [
      {
        date: parseDate("2026-06-15T09:00:00Z"),
        project: "Client Website Redesign",
        typeOfWork: "Development",
        taskDescription: "Setup layout and landing page sections",
        hoursWorked: 8,
      },
      {
        date: parseDate("2026-06-16T10:00:00Z"),
        project: "Client Website Redesign",
        typeOfWork: "Design",
        taskDescription: "Create wireframes and assets",
        hoursWorked: 8,
      },
      {
        date: parseDate("2026-06-17T09:00:00Z"),
        project: "Mobile App",
        typeOfWork: "Development",
        taskDescription: "Integrate push notifications",
        hoursWorked: 10,
      },
      {
        date: parseDate("2026-06-18T09:00:00Z"),
        project: "Internal Tools",
        typeOfWork: "Meeting",
        taskDescription: "Weekly team alignment meeting",
        hoursWorked: 8,
      },
      {
        date: parseDate("2026-06-19T09:00:00Z"),
        project: "Client Website Redesign",
        typeOfWork: "QA/Testing",
        taskDescription: "Responsive testing and bug fixing",
        hoursWorked: 8,
      },
    ],
  });

  // Week 26: June 22-26, 2026 (Incomplete, 15 hours)
  const w26Start = parseDate("2026-06-22T00:00:00Z");
  const w26End = parseDate("2026-06-26T23:59:59Z");
  await Timesheet.create({
    userId: user1._id,
    year: 2026,
    weekNumber: 26,
    weekStart: w26Start,
    weekEnd: w26End,
    entries: [
      {
        date: parseDate("2026-06-22T09:00:00Z"),
        project: "Marketing Site",
        typeOfWork: "Development",
        taskDescription: "Drafting SEO content changes",
        hoursWorked: 5,
      },
      {
        date: parseDate("2026-06-23T09:00:00Z"),
        project: "Internal Tools",
        typeOfWork: "Code Review",
        taskDescription: "Reviewing PRs for timesheet app",
        hoursWorked: 10,
      },
    ],
  });

  // Week 27: June 29 - July 3, 2026 (Missing, 0 entries)
  const w27Start = parseDate("2026-06-29T00:00:00Z");
  const w27End = parseDate("2026-07-03T23:59:59Z");
  await Timesheet.create({
    userId: user1._id,
    year: 2026,
    weekNumber: 27,
    weekStart: w27Start,
    weekEnd: w27End,
    entries: [],
  });

  console.log("Seeded sample timesheets for john@example.com (Completed, Incomplete, Missing).");
  await mongoose.disconnect();
  console.log("Database disconnected. Seeding done.");
}

seed().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
