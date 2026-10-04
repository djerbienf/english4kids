import { setCorsHeaders } from "./_lib/aiHandlers";

export default function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  return res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Guided English Learning Platform API",
  });
}
