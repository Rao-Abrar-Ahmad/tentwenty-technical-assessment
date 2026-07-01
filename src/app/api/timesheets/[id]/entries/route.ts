import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { entryInputSchema } from "@/lib/zodSchemas";
import { getSupabaseAdmin } from "@/lib/supabase";
import { mapTimesheet, SupabaseTimesheetRow } from "@/lib/supabaseMappers";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getOwnedTimesheet(id: string, userId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("timesheets")
    .select("id, user_id, year, week_number, week_start, week_end, created_at, updated_at, entries:timesheet_entries(id, date, project, type_of_work, task_description, hours_worked, created_at)")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapTimesheet(data as SupabaseTimesheetRow) : null;
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
  }

  const { id } = await props.params;

  if (!uuidPattern.test(id)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const body = await req.json();
    const result = entryInputSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: result.error.issues }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const timesheet = await getOwnedTimesheet(id, session.user.id);

    if (!timesheet) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const { date, project, typeOfWork, taskDescription, hoursWorked } = result.data;
    const entryDate = new Date(date);
    const day = entryDate.getUTCDay();
    if (day === 0 || day === 6) {
      return new NextResponse(JSON.stringify({ error: "Entries can only be added for weekdays (Monday to Friday)" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const entryTime = entryDate.getTime();
    const startTime = new Date(timesheet.weekStart).getTime();
    const endTime = new Date(timesheet.weekEnd).getTime();
    
    if (entryTime < startTime || entryTime > endTime) {
      return new NextResponse(JSON.stringify({ error: "Date must fall within the timesheet week" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const { error: insertError } = await getSupabaseAdmin()
      .from("timesheet_entries")
      .insert({
        timesheet_id: id,
        date: entryDate.toISOString(),
        project,
        type_of_work: typeOfWork,
        task_description: taskDescription,
        hours_worked: hoursWorked,
      });

    if (insertError) {
      throw insertError;
    }

    await getSupabaseAdmin()
      .from("timesheets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", id);

    const updatedTimesheet = await getOwnedTimesheet(id, session.user.id);
    return NextResponse.json(updatedTimesheet);
  } catch (error) {
    console.error("Error creating entry:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}


