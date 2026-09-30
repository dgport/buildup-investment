import { NextResponse } from "next/server";

/** Resolve missing records before React streams a successful HTTP response. */
export function missingRecordResponse(locale: string) {
  const en = locale === "/en";
  const title = en ? "Page not found" : "გვერდი ვერ მოიძებნა";
  const description = en ? "This listing is unavailable or has been removed." : "ეს განცხადება მიუწვდომელია ან წაშლილია.";
  const label = en ? "Back to home" : "მთავარ გვერდზე დაბრუნება";
  return new NextResponse(`<!doctype html><html lang="${en ? "en" : "ka"}"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,follow"><title>${title} · BuildUp</title>
    <style>body{margin:0;background:#f5f8f7;color:#042f2e;font-family:system-ui,sans-serif;min-height:100svh;display:grid;place-items:center}main{text-align:center;padding:32px;max-width:620px}img{width:72px;height:84px;object-fit:contain}p{line-height:1.7}a{display:inline-block;margin-top:24px;padding:16px 24px;background:#fbbf24;border-radius:12px;color:#042f2e;font-weight:700;text-decoration:none}strong{display:block;margin-top:24px;color:#64748b;font-size:20px}</style>
    </head><body><main><img src="/Logo.png" alt="BuildUp"><strong>404</strong><h1>${title}</h1><p>${description}</p><a href="${en ? "/en" : "/"}">${label}</a></main></body></html>`, {
    status: 404,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex, follow", "Cache-Control": "no-store" },
  });
}
