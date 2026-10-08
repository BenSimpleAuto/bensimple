const VPIC = "https://vpic.nhtsa.dot.gov/api/vehicles";
const RECALLS = "https://api.nhtsa.gov/recalls/recallsByVehicle";

async function getJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "BenSimpleAuto/1.0" },
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`NHTSA request failed with ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function decodeVin(vin) {
  const normalized = String(vin || "").trim().toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalized)) throw new Error("A complete 17-character VIN is required.");
  const data = await getJson(`${VPIC}/DecodeVinValuesExtended/${encodeURIComponent(normalized)}?format=json`);
  const row = data.Results?.[0];
  if (!row || (!row.Make && !row.Model)) throw new Error("NHTSA could not decode that VIN.");
  return {
    source: "NHTSA vPIC",
    vin: normalized,
    year: row.ModelYear || null,
    make: row.Make || null,
    model: row.Model || null,
    trim: row.Trim || null,
    vehicleType: row.VehicleType || row.BodyClass || null,
    bodyClass: row.BodyClass || null,
    driveType: row.DriveType || null,
    engine: [row.EngineCylinders && `${row.EngineCylinders} cylinders`, row.DisplacementL && `${row.DisplacementL}L`, row.FuelTypePrimary].filter(Boolean).join(" · ") || null,
    errorCode: row.ErrorCode || null,
    errorText: row.ErrorText || null
  };
}

export async function getRecalls({ year, make, model }) {
  if (!year || !make || !model) throw new Error("Year, make, and model are required for the NHTSA recall search.");
  const url = new URL(RECALLS);
  url.searchParams.set("modelYear", String(year));
  url.searchParams.set("make", make);
  url.searchParams.set("model", model);
  const data = await getJson(url.toString());
  return {
    source: "NHTSA Recalls API",
    vehicle: { year: String(year), make, model },
    count: Number(data.Count || data.results?.length || 0),
    recalls: (data.results || []).slice(0, 8).map((recall) => ({
      campaign: recall.NHTSACampaignNumber || null,
      component: recall.Component || null,
      summary: recall.Summary || null,
      consequence: recall.Consequence || null,
      remedy: recall.Remedy || null,
      manufacturer: recall.Manufacturer || null,
      reportDate: recall.ReportReceivedDate || null
    })),
    disclaimer: "These are model-level NHTSA recall records. Confirm open VIN-specific recalls at NHTSA.gov/recalls or with the manufacturer."
  };
}

export async function getModelsForMakeYear({ year, make }) {
  if (!year || !make) throw new Error("Year and make are required.");
  const data = await getJson(`${VPIC}/GetModelsForMakeYear/make/${encodeURIComponent(make)}/modelyear/${encodeURIComponent(year)}?format=json`);
  return (data.Results || []).map((row) => row.Model_Name).filter(Boolean);
}

