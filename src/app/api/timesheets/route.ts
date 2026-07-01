import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Timesheet } from "@/models/Timesheet";
import { createTimesheetSchema } from "@/lib/zodSchemas";
import { getStatus, getWeeksInIntersection, getWeekStartAndEnd } from "@/lib/status";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
  }

  const { searchParams } = new URL(req.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  
  if (!fromParam || !toParam) {
    return new NextResponse(JSON.stringify({ error: "'from' and 'to' query parameters are required" }), { status: 400, headers: { "content-type": "application/json" } });
  }

  const fromDate = new Date(fromParam);
  const toDate = new Date(toParam);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return new NextResponse(JSON.stringify({ error: "Invalid date format for 'from' or 'to'" }), { status: 400, headers: { "content-type": "application/json" } });
  }

  const statusFilter = searchParams.get("status");
  const sortBy = searchParams.get("sortBy") || "week";
  const sortDir = searchParams.get("sortDir") || "asc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "5", 10);

  await connectDB();

  const weeksList = getWeeksInIntersection(fromDate, toDate);

  if (weeksList.length === 0) {
    return NextResponse.json({
      rows: [],
      total: 0,
      page,
      pageSize,
    });
  }

  const queryWeeks = weeksList.map((w) => ({ year: w.year, weekNumber: w.weekNumber }));
  
  const existingTimesheets = await Timesheet.find({
    userId: session.user.id,
    $or: queryWeeks,
  });

  let rows = weeksList.map((w) => {
    const existing = existingTimesheets.find((t) => t.year === w.year && t.weekNumber === w.weekNumber);
    const entries = existing ? existing.entries : [];
    const status = getStatus(entries);
    return {
      id: existing ? existing._id.toString() : null,
      weekNumber: w.weekNumber,
      year: w.year,
      weekStart: w.weekStart.toISOString(),
      weekEnd: w.weekEnd.toISOString(),
      status,
      action: !existing ? "Create" : status === "Completed" ? "View" : "Update",
    };
  });

  if (statusFilter && statusFilter !== "All") {
    rows = rows.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase());
  }

  const statusSeverity = {
    Missing: 0,
    Incomplete: 1,
    Completed: 2,
  };

  rows.sort((a, b) => {
    let comparison = 0;
    if (sortBy === "status") {
      comparison = statusSeverity[a.status] - statusSeverity[b.status];
    } else {
      comparison = new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime();
    }

    if (comparison === 0) {
      comparison = new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime();
    }

    return sortDir === "asc" ? comparison : -comparison;
  });

  const total = rows.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedRows = rows.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    rows: paginatedRows,
    total,
    page,
    pageSize,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
  }

  try {
    const body = await req.json();
    const result = createTimesheetSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: result.error.issues }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const { year, weekNumber } = result.data;
    await connectDB();

    let timesheet = await Timesheet.findOne({
      userId: session.user.id,
      year,
      weekNumber,
    });

    if (!timesheet) {
      const { weekStart, weekEnd } = getWeekStartAndEnd(year, weekNumber);
      timesheet = await Timesheet.create({
        userId: session.user.id,
        year,
        weekNumber,
        weekStart,
        weekEnd,
        entries: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ id: timesheet._id.toString() });
  } catch (error) {
    console.error("Error creating timesheet:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
