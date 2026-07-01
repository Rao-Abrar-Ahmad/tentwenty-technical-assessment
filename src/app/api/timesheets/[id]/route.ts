import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Timesheet } from "@/models/Timesheet";
import mongoose from "mongoose";

export async function GET(
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

  await connectDB();

  const timesheet = await Timesheet.findOne({
    _id: id,
    userId: session.user.id,
  });

  if (!timesheet) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(timesheet);
}
