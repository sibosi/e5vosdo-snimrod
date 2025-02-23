import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import * as Module from "@/db/presentationSignup";

type Params = {
  method: string;
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  const selfEmail = (await auth())?.user?.email;
  if (!selfEmail)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const method = (await context.params).method;
  const body = request.method === "POST" ? await request.json() : {};
  const funct: Function | undefined = Module[method as keyof typeof Module];
  if (funct === undefined)
    return NextResponse.json(
      { error: `Invalid method: ${method}` },
      { status: 400 },
    );

  const result = await funct(selfEmail, ...Object.values(body));
  if (result?.success === false)
    return NextResponse.json({ error: result }, { status: 400 });
  return NextResponse.json(result);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  return await POST(request, context);
}
