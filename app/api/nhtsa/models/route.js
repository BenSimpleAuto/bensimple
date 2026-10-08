import { getModelsForMakeYear } from "../../../../lib/nhtsa";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get("year");
  const make = searchParams.get("make");
  if (!year || !make) return Response.json({ error: "Year and make are required." }, { status: 400 });
  try {
    const models = await getModelsForMakeYear({ year, make });
    return Response.json({ source: "NHTSA vPIC", year, make, models });
  } catch {
    return Response.json({ error: "NHTSA model data is temporarily unavailable.", models: [] }, { status: 503 });
  }
}

