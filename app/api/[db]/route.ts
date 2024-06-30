import { NextResponse } from "next/server";
import {
  apioptions,
  apireq,
  apireqType,
  defaultApiReq,
  getAuth,
  getUser,
} from "@/db/dbreq";

type Params = {
  db: string;
};

export const GET = async (request: Request, context: { params: Params }) => {
  const selfUser = await getAuth();
  if (!selfUser) {
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

  const user = await getUser(selfUser.email ?? undefined);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 500 });
  }

  const userPermissionsSet = new Set(user.permissions);
  const gatePermissions = new Set(apireq[gate as apireqType["gate"]].perm);

  if (
    apireq[gate as apireqType["gate"]].perm != null &&
    !Array.from(gatePermissions).some((item) => userPermissionsSet.has(item))
  ) {
    return NextResponse.json(
      {
        error: `You do not have permission to use this API\nYour permissions: ${user.name}`,
      },
      { status: 403 }
    );
  }

  // const bodyData = streamToString(request.body);
  let bodyData: string | Promise<string>;
  try {
    bodyData = JSON.parse(await request.text());
  } catch (error) {
    bodyData = "";
  }

  try {
    const data = await defaultApiReq(gate as apireqType["gate"], bodyData);
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
