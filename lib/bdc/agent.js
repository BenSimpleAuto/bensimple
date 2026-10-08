import { ToolLoopAgent, isStepCount, tool } from "ai";
import { z } from "zod";
import { decodeVin, getRecalls } from "../nhtsa";
import { BDC_POLICY } from "./policy";

const INVENTORY_LINKS = {
  all: "https://www.butteauto.com/all-inventory/index.htm",
  new: "https://www.butteauto.com/new-inventory/index.htm",
  used: "https://www.butteauto.com/used-inventory/index.htm"
};

export function createBdcAgent(model, context) {
  return new ToolLoopAgent({
    model,
    instructions: `${BDC_POLICY}\n\nCURRENT STRUCTURED CONTEXT\n${JSON.stringify(context)}`,
    stopWhen: isStepCount(5),
    tools: {
      decodeVin: tool({
        description: "Decode a complete 17-character VIN with official NHTSA vPIC data.",
        inputSchema: z.object({ vin: z.string().length(17) }),
        execute: ({ vin }) => decodeVin(vin)
      }),
      checkRecalls: tool({
        description: "Find official NHTSA model-level recall records by year, make, and model.",
        inputSchema: z.object({ year: z.string(), make: z.string(), model: z.string() }),
        execute: (input) => getRecalls(input)
      }),
      getButteAutoInventoryLinks: tool({
        description: "Return the official Butte Auto inventory links. Never provide listing prices or guarantee availability.",
        inputSchema: z.object({ condition: z.enum(["new", "used", "either"]).default("either") }),
        execute: ({ condition }) => ({
          source: "Butte Auto official inventory",
          url: condition === "new" ? INVENTORY_LINKS.new : condition === "used" ? INVENTORY_LINKS.used : INVENTORY_LINKS.all,
          rule: "Do not expose price. Ben must verify availability and current details."
        })
      })
    }
  });
}

