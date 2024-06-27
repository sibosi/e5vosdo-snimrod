import { NextResponse } from "next/server";
import {
  apioptions,
  apireq,
  apireqType,
  defaultApiReq,
  getUser,
} from "@/db/dbreq";
import { auth } from "@/auth";

type Params = {
  db: string;
};

type User = {
  email: string;
  name: string;
  image: string;
  last_login: string;
};

export const GET = async (request: Request, context: { params: Params }) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Please log in to use this API" },
      { status: 400 }
    );
  }

  const gate = context.params.db;
  if (apioptions.includes(gate) === false) {
    return NextResponse.json(
      { error: "Invalid API endpoint" },
      { status: 400 }
    );
  }

  const user_pack = await getUser(session.user.email ?? undefined);
  const user = (user_pack as any)[0];
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 500 });
  }

  if (
    apireq[gate as apireqType["gate"]].perm != null &&
    !user.permissions?.includes(
      apireq[gate as apireqType["gate"]].perm as string
    )
  ) {
    return NextResponse.json(
      {
        error: `You do not have permission to use this API\nYour permissions: ${user.name}`,
      },
      { status: 403 }
    );
  }

  try {
    const data = await defaultApiReq(gate as apireqType["gate"], request.body);
    console.log(data);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request, context: { params: Params }) => {
  return await GET(request, context);
};
