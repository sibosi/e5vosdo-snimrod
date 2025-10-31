import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import * as Module from "@/db/presentationSignup";

type Params = {
  method: string;
};

const allowedFunctionsForUnauthorized = new Set<string>([
  "getSlots",
  "getPresentations",
  "getPresentationSlots",
  "getPresentationsBySlot",
  "getPresentationsCapacity",
]);

const allowedForExternalSignups = new Set<string>([
  "signUpForPresentation",
  "getMySignups",
]);

function extractExternalEmail(body: any): string | null {
  if (!body.details) return null;

  try {
    const detailsObj = JSON.parse(body.details);
    if (detailsObj.omId) {
      return `om_${detailsObj.omId}@external.signup`;
    }
  } catch (e) {
    console.error("Failed to parse external signup details:", e);
  }

  return null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> },
) {
  const selfEmail = (await auth())?.user?.email;
  const method = (await context.params).method;
  const externalSignupsEnabled = process.env.EXTERNAL_SIGNUPS === "true";

  const isExternalSignupAllowed =
    externalSignupsEnabled && allowedForExternalSignups.has(method);

  if (
    !selfEmail &&
    !allowedFunctionsForUnauthorized.has(method) &&
    !isExternalSignupAllowed
  )
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = request.method === "POST" ? await request.json() : {};
  const funct: Function | undefined = Module[method as keyof typeof Module];
  if (funct === undefined)
    return NextResponse.json(
      { error: `Invalid method: ${method}` },
      { status: 400 },
    );

  let emailToUse = selfEmail;
  if (isExternalSignupAllowed && !selfEmail) {
    emailToUse = extractExternalEmail(body);

    if (!emailToUse) {
      return NextResponse.json(
        { error: { message: "OM ID required for external signup" } },
        { status: 400 },
      );
    }
  }

  const result = await funct(emailToUse, ...Object.values(body));
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
