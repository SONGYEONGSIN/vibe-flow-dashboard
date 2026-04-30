import { getInboxSummary } from "@/lib/inbox";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getInboxSummary();
  return Response.json(summary);
}
