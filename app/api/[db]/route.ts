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

async function main(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const selfUser = await getAuth();
  const method = (await params).slug;

  if (request.headers.get("module") === "parlement") {
    const body = await request.json();

    try {
      const mod = await import("@/db/parlament");

      if (typeof (mod as { [key: string]: any })[method] === "function") {
        console.log("body:", body);
        return NextResponse.json(
          await (mod as { [key: string]: any })[method](
            selfUser,
            ...Object.values(body),
          ),
        );
      } else {
        console.error(`Invalid method: ${method} is not a function`);
        return NextResponse.json(
          { error: `Invalid method: ${method}` },
          { status: 400 },
        );
      }
    } catch (error) {
      console.error("Error in parlement module:", error);
      return NextResponse.json(
        { error: "Failed to process request in parlement module" },
        { status: 500 },
      );
    }
  }

  if (!selfUser) {
    return NextResponse.json(
      { error: "Please log in to use this API" },
      { status: 400 },
    );
  }

  if (apioptions.includes(method as any) === false) {
    return NextResponse.json(
      { error: "Invalid API endpoint" },
      { status: 400 },
    );
  }

  const user = await getUser(selfUser.email ?? undefined);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 500 });
  }

  const userPermissionsSet = new Set(user.permissions);
  const gatePermissions = new Set(apireq[method as apireqType].perm);

  if (
    apireq[method as apireqType].perm != null &&
    !Array.from(gatePermissions).some((item) => userPermissionsSet.has(item))
  ) {
    return NextResponse.json(
      {
        error: `You do not have permission to use this API\nYour permissions: ${user.name}`,
      },
      { status: 403 },
    );
  }

  let bodyData: string | Promise<string>;
  try {
    bodyData = JSON.parse(await request.text());
  } catch (error) {
    bodyData = "";
  }

  try {
    const data = await defaultApiReq(method as apireqType, bodyData);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return await main(request, { params });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  return await main(request, { params });
}
