import { getAuth } from "@/db/dbreq";
import main from "@/db/tests/presentations";
import { NextResponse } from "next/server";

export async function GET() {
  const selfUser = await getAuth();
  if (!selfUser?.permissions.includes("admin"))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    data: await main({
      t_connectionLimit: 10,
      t_queueLimit: 0,
      t_NUM_TEST_USERS: 550,
      t_REQUESTS_PER_USER: 1,
    }),
  });
}
