import { gradeWritingHandler } from "./_lib/aiHandlers";

export default async function handler(req: any, res: any) {
  return gradeWritingHandler(req, res);
}
