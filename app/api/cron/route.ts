import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");

  const { execSync } = require("child_process");

  const command = "python3 components/helyettesites/getTable.py";
  const output = execSync(command, { encoding: "utf-8" }); // Capture output

  console.log(output); // Print the output of the command
  console.log(new Date());

  return new Response(output, { status: 200 });
}
