export async function GET() {
  const { execSync } = require("child_process");

  const command = "python3 components/helyettesites/getTable.py";
  const output = execSync(command, { encoding: "utf-8" }); // Capture output

  console.log(output); // Print the output of the command

  return new Response(null, { status: 200 });
}
