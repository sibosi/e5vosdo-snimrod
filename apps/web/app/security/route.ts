// Serve SECURITY.md as an HTML page at /security
// Runtime must be Node.js to allow fs access
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

function htmlPage(title: string, body: string) {
  return `<!doctype html>
<html lang="hu">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${title}</title>
		<style>
			:root{color-scheme:light dark}
			body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.5;padding:2rem;max-width:960px}
			main{margin:0 auto}
			h1,h2,h3{line-height:1.2}
			h1{font-size:2rem;margin-top:0}
			h2{margin-top:2rem}
			a{color:#2563eb;text-decoration:none}
			a:hover{text-decoration:underline}
			code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace}
			pre{background:rgba(0,0,0,.05);padding:1rem;border-radius:.5rem;overflow:auto}
			table{border-collapse:collapse;width:100%;overflow:auto;display:block}
			th,td{border:1px solid rgba(0,0,0,.15);padding:.5rem;text-align:left}
			blockquote{margin:1rem 0;padding:.5rem 1rem;border-left:4px solid rgba(0,0,0,.2)}
			.topbar{display:flex;gap:.75rem;align-items:center;margin-bottom:1.5rem}
			.badge{font-size:.75rem;border:1px solid currentColor;border-radius:999px;padding:.1rem .5rem;opacity:.7}
		</style>
	</head>
	<body>
		<main>
			<div class="topbar">
				<a href="/">← Vissza a főoldalra</a>
			</div>
			${body}
		</main>
	</body>
</html>`;
}

export async function GET() {
  try {
    const mdPath = path.join(process.cwd(), "SECURITY.md");
    const markdown = await readFile(mdPath, "utf8");

    // Configure marked if needed
    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    const content = await marked.parse(markdown);

    const titleExec = /^#\s+(.+)$/m.exec(markdown);
    const title = titleExec?.[1] ?? "Adatkezelési tájékoztató";

    const body = htmlPage(title, content as string);

    return new NextResponse(body, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    const message =
      process.env.NODE_ENV === "development"
        ? String(err?.stack || err?.message || err)
        : "Hiba történt.";
    return new NextResponse(
      `<!doctype html><meta charset="utf-8"><title>Hiba</title><pre>${message}</pre>`,
      {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      },
    );
  }
}

export async function HEAD() {
  const res = await GET();
  return new NextResponse(null, { status: res.status, headers: res.headers });
}
