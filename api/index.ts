import { generateTestHandler, gradeWritingHandler, setCorsHeaders } from "./_lib/aiHandlers";

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const url = req.url || "";
  const cleanUrl = url.split("?")[0].replace(/\/$/, "");

  if (cleanUrl.endsWith("/generate-test")) {
    return generateTestHandler(req, res);
  }

  if (cleanUrl.endsWith("/grade-writing")) {
    return gradeWritingHandler(req, res);
  }

  if (cleanUrl.endsWith("/health") || cleanUrl === "/api" || cleanUrl === "") {
    return res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "Guided English Learning Platform API",
    });
  }

  return res.status(404).json({ error: `Not found: ${req.url}` });
}
