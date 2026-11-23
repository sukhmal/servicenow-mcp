import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServiceNowClient } from "../../client.js";
import type { Mode } from "../../types.js";
import { errorResult, jsonResult } from "../../utils.js";
import { EXECUTE } from "../../annotations.js";

export function registerBatchTools(
  server: McpServer,
  client: ServiceNowClient,
  mode: Mode
): void {
  server.tool(
    "sn_batch_request",
    "Execute multiple REST API calls in a single batch request (/api/now/v1/batch). Reduces round trips and improves performance by up to 66%. All requests must be independent (no data dependencies between them). In debug mode only GET requests are permitted.",
    {
      requests: z.array(z.object({
        id: z.string().describe("Unique request identifier"),
        url: z.string().describe("API path (e.g., '/api/now/table/incident?sysparm_limit=1')"),
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).describe("HTTP method"),
        body: z.record(z.string(), z.unknown()).optional().describe("Request body for POST/PUT/PATCH"),
      })).describe("Array of REST API requests to execute in batch"),
    },
    EXECUTE,
    async ({ requests }) => {
      try {
        if (mode !== "develop") {
          const writes = requests.filter((r) => r.method !== "GET");
          if (writes.length > 0) {
            const ids = writes.map((r) => `${r.id} (${r.method})`).join(", ");
            return errorResult(
              `Write requests are not allowed in debug mode. Set SERVICENOW_MODE=develop to perform writes. Offending requests: ${ids}`
            );
          }
        }
        const result = await client.batchRequest(requests);
        return jsonResult(result);
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
