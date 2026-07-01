import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { mapTimesheet, SupabaseTimesheetRow } from "@/lib/supabaseMappers";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
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

  const { data, error } = await getSupabaseAdmin()
    .from("timesheets")
    .select("id, user_id, year, week_number, week_start, week_end, created_at, updated_at, entries:timesheet_entries(id, date, project, type_of_work, task_description, hours_worked, created_at)")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching timesheet:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "content-type": "application/json" } });
  }

  if (!data) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const timesheet = mapTimesheet(data as SupabaseTimesheetRow);
  timesheet.entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return NextResponse.json(timesheet);
}


