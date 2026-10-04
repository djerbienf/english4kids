import { generateTestHandler } from "./_lib/aiHandlers";

export default async function handler(req: any, res: any) {
  return generateTestHandler(req, res);
}
