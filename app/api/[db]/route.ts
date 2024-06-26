import { NextResponse } from "next/server";
import { apioptions, apireq, apireqType } from "@/db/dbreq";

type Params = {
  db: string;
};

export const GET = async (request: Request, context: { params: Params }) => {
  const gate = context.params.db;
  if (apioptions.includes(gate) === false) {
    return NextResponse.json(
      { error: "Invalid API endpoint" },
      { status: 400 }
    );
  }
  try {
    const events = await apireq[gate as apireqType["gate"]]();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
};
