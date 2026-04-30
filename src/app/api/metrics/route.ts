import { computeMetrics } from "@/lib/metrics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const metrics = await computeMetrics(30);
  return Response.json(metrics);
}
