import { listActivePlans } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const plans = await listActivePlans();
  return Response.json({ plans });
}
