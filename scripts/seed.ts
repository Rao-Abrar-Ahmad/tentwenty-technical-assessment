import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Please define SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const parseDate = (d: string) => new Date(Date.parse(d)).toISOString();

type EntrySeed = {
  date: string;
  project: string;
  typeOfWork: string;
  taskDescription: string;
  hoursWorked: number;
};

async function createTimesheet(input: {
  userId: string;
  year: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  entries: EntrySeed[];
}) {
  const { data: timesheet, error: timesheetError } = await supabase
    .from("timesheets")
    .insert({
      user_id: input.userId,
      year: input.year,
      week_number: input.weekNumber,
      week_start: input.weekStart,
      week_end: input.weekEnd,
    })
    .select("id")
    .single();

  if (timesheetError) {
    throw timesheetError;
  }

  if (input.entries.length === 0) {
    return;
  }

  const { error: entriesError } = await supabase.from("timesheet_entries").insert(
    input.entries.map((entry) => ({
      timesheet_id: timesheet.id,
      date: entry.date,
      project: entry.project,
      type_of_work: entry.typeOfWork,
      task_description: entry.taskDescription,
      hours_worked: entry.hoursWorked,
    }))
  );

  if (entriesError) {
    throw entriesError;
  }
}

async function seed() {
  console.log("Connected to Supabase for seeding.");

  await supabase.from("timesheet_entries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("timesheets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("Cleared existing users and timesheets.");

  const passwordHash = await bcrypt.hash("password123", 10);

  const { data: users, error: usersError } = await supabase
    .from("users")
    .insert([
      {
        email: "user@example.com",
        name: "John Doe",
        password_hash: passwordHash,
      },
      {
        email: "user1@example.com",
        name: "Jane Smith",
        password_hash: passwordHash,
      },
    ])
    .select("id, email");

  if (usersError) {
    throw usersError;
  }

  const user1 = users.find((user) => user.email === "user@example.com");
  if (!user1) {
    throw new Error("Seed user was not returned by Supabase");
  }

  console.log("Seeded Users:");
  console.log("1. Email: user@example.com, Password: password123");
  console.log("2. Email: user1@example.com, Password: password123");

  await createTimesheet({
    userId: user1.id,
    year: 2026,
    weekNumber: 25,
    weekStart: parseDate("2026-06-15T00:00:00Z"),
    weekEnd: parseDate("2026-06-19T23:59:59Z"),
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

  await createTimesheet({
    userId: user1.id,
    year: 2026,
    weekNumber: 26,
    weekStart: parseDate("2026-06-22T00:00:00Z"),
    weekEnd: parseDate("2026-06-26T23:59:59Z"),
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

  await createTimesheet({
    userId: user1.id,
    year: 2026,
    weekNumber: 27,
    weekStart: parseDate("2026-06-29T00:00:00Z"),
    weekEnd: parseDate("2026-07-03T23:59:59Z"),
    entries: [],
  });

  console.log("Seeded sample timesheets for user@example.com (Completed, Incomplete, Missing).");
  console.log("Seeding done.");
}

seed().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
