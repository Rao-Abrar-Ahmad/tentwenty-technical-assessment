import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Timesheet } from "@/models/Timesheet";
import { entryInputSchema } from "@/lib/zodSchemas";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
  }

  const { id } = await props.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const body = await req.json();
    const result = entryInputSchema.safeParse(body);
    if (!result.success) {
      return new NextResponse(JSON.stringify({ error: result.error.issues }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const { date, project, typeOfWork, taskDescription, hoursWorked } = result.data;

    await connectDB();

    const timesheet = await Timesheet.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!timesheet) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const entryDate = new Date(date);
    const day = entryDate.getUTCDay(); // 0 is Sunday, 6 is Saturday
    if (day === 0 || day === 6) {
      return new NextResponse(JSON.stringify({ error: "Entries can only be added for weekdays (Monday to Friday)" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    const entryTime = entryDate.getTime();
    const startTime = new Date(timesheet.weekStart).getTime();
    const endTime = new Date(timesheet.weekEnd).getTime();
    
    if (entryTime < startTime || entryTime > endTime) {
      return new NextResponse(JSON.stringify({ error: "Date must fall within the timesheet week" }), { status: 400, headers: { "content-type": "application/json" } });
    }

    timesheet.entries.push({
      date: entryDate,
      project,
      typeOfWork,
      taskDescription,
      hoursWorked,
    });
    timesheet.updatedAt = new Date();
    await timesheet.save();

    return NextResponse.json(timesheet);
  } catch (error) {
    console.error("Error creating entry:", error);
    return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
