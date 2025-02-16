import { getAuth } from "@/db/dbreq";
import main from "@/db/tests/presentations";
import { NextResponse } from "next/server";

type Params = {
  slug: string;
};

export async function GET(
  request: Request,
  context: { params: Promise<Params> },
) {
  const selfUser = await getAuth();
  if (!selfUser?.permissions.includes("admin"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slug = (await context.params).slug;
  // Expected URL format: /api/test/<connectionLimit>,<queueLimit>,<NUM_TEST_USERS>,<REQUESTS_PER_USER>
  // Example: /api/test/10,0,550,1
  const slugParts = slug.split(",");
  if (slugParts.length !== 4) {
    return NextResponse.json(
      {
        error:
          "Invalid slug. Expected format: connectionLimit,queueLimit,NUM_TEST_USERS,REQUESTS_PER_USER",
      },
      { status: 400 },
    );
  }

  const [connectionLimit, queueLimit, NUM_TEST_USERS, REQUESTS_PER_USER] =
    slugParts.map(Number);
  if (
    [connectionLimit, queueLimit, NUM_TEST_USERS, REQUESTS_PER_USER].some(isNaN)
  ) {
    return NextResponse.json(
      { error: "Invalid number in slug parameters." },
      { status: 400 },
    );
  }

  const data = await main({
    t_connectionLimit: connectionLimit,
    t_queueLimit: queueLimit,
    t_NUM_TEST_USERS: NUM_TEST_USERS,
    t_REQUESTS_PER_USER: REQUESTS_PER_USER,
  });

  return NextResponse.json({ data });
}
