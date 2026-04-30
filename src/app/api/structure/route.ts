import { getStructure } from "@/lib/structure";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const structure = await getStructure();
  return Response.json(structure);
}
