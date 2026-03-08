import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServiceNowClient } from "../client.js";
import type { Mode } from "../types.js";
import { errorResult, jsonResult, textResult } from "../utils.js";

const SCRIPT_RUNNER_API = "/api/global/mcp_script_runner/execute";

const SCRIPT_RUNNER_DEFINITION = {
  name: "MCP Script Runner",
  namespace: "global",
  short_description: "Execute server-side scripts via MCP",
  active: true,
  produces: "application/json",
  consumes: "application/json",
};

const SCRIPT_RUNNER_RESOURCE = {
  name: "Execute Script",
  http_method: "POST",
  relative_path: "/execute",
  active: true,
  short_description: "Run a server-side script and return results",
  operation_script: `(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var body = request.body.data;
    var scriptText = body.script;

    if (!scriptText) {
      response.setStatus(400);
      response.setBody({success: false, error: 'Missing script parameter'});
      return;
    }

    var tempId = null;
    try {
      var tempGR = new GlideRecord('sys_script_fix');
      tempGR.initialize();
      tempGR.name = 'MCP_TEMP_' + gs.generateGUID();
      tempGR.script = scriptText;
      tempId = tempGR.insert();

      var gr = new GlideRecord('sys_script_fix');
      gr.get(tempId);

      var evaluator = new GlideScopedEvaluator();
      var result = evaluator.evaluateScript(gr, 'script');

      gr.deleteRecord();

      response.setBody({
        success: true,
        result: result !== null && result !== undefined ? String(result) : null
      });
    } catch(e) {
      try {
        if (tempId) {
          var cleanup = new GlideRecord('sys_script_fix');
          if (cleanup.get(tempId)) cleanup.deleteRecord();
        }
      } catch(ignore) {}

      response.setBody({
        success: false,
        error: String(e.message || e)
      });
    }
  })(request, response);`,
};

async function ensureScriptRunner(client: ServiceNowClient): Promise<boolean> {
  // Check if the API already exists
  try {
    await client.restApi("POST", SCRIPT_RUNNER_API, { script: "1;" });
    return true;
  } catch {
    // API doesn't exist, try to create it
  }

  try {
    const scopes = await client.query("sys_scope", {
      sysparm_query: "scope=global",
      sysparm_fields: "sys_id",
      sysparm_limit: 1,
    });
    const globalScopeId = (scopes.records[0] as { sys_id: string })?.sys_id ?? "global";

    const api = await client.create<{ sys_id: string }>("sys_ws_definition", {
      ...SCRIPT_RUNNER_DEFINITION,
      sys_scope: globalScopeId,
    });

    await client.create("sys_ws_operation", {
      ...SCRIPT_RUNNER_RESOURCE,
      web_service_definition: api.sys_id,
      sys_scope: globalScopeId,
    });

    return true;
  } catch {
    return false;
  }
}

export function registerExecuteTools(
  server: McpServer,
  client: ServiceNowClient,
  mode: Mode
): void {
  if (mode !== "develop") return;

  server.tool(
    "sn_script_execute",
    "Execute a server-side GlideRecord/GlideSystem script on the ServiceNow instance (like Background Scripts). Returns the last expression value. Use JSON.stringify() for complex return values. Auto-provisions the MCP Script Runner REST API on first use.",
    {
      script: z
        .string()
        .describe(
          "Server-side JavaScript to execute. Has access to GlideRecord, GlideSystem (gs), GlideAggregate, etc. The value of the last expression is returned as the result. Use JSON.stringify() to return objects/arrays."
        ),
    },
    async ({ script }) => {
      try {
        // Ensure the script runner API exists
        const ready = await ensureScriptRunner(client);
        if (!ready) {
          return errorResult(
            new Error(
              "Could not provision MCP Script Runner API on the instance. " +
              "Ensure the user has admin rights and can create Scripted REST APIs."
            )
          );
        }

        const response = await client.restApi<{ result: { success: boolean; result?: string; error?: string } }>(
          "POST",
          SCRIPT_RUNNER_API,
          { script }
        );

        const body = response.result;

        if (!body.success) {
          return errorResult(new Error(body.error ?? "Script execution failed"));
        }

        // Try to parse JSON result for pretty printing
        if (body.result) {
          try {
            const parsed = JSON.parse(body.result);
            return jsonResult({ result: parsed });
          } catch {
            // Not JSON, return as text
          }
          return textResult(body.result);
        }

        return textResult("Script executed successfully (no return value)");
      } catch (error) {
        return errorResult(error);
      }
    }
  );

  server.tool(
    "sn_script_execute_query",
    "Execute a GlideRecord query and return results as JSON. A convenience wrapper that builds the GlideRecord boilerplate for you.",
    {
      table: z.string().describe("Table to query, e.g. 'incident'"),
      query: z.string().optional().describe("Encoded query string, e.g. 'active=true^priority=1'"),
      fields: z
        .array(z.string())
        .describe("Fields to return, e.g. ['number', 'short_description', 'state']"),
      limit: z.number().min(1).max(100).optional().describe("Max records (default 20)"),
      order_by: z.string().optional().describe("Field to order by"),
      order_dir: z.enum(["asc", "desc"]).optional().describe("Order direction (default 'asc')"),
    },
    async ({ table, query, fields, limit, order_by, order_dir }) => {
      try {
        const ready = await ensureScriptRunner(client);
        if (!ready) {
          return errorResult(new Error("Could not provision MCP Script Runner API"));
        }

        const maxRows = limit ?? 20;
        const script = `
var gr = new GlideRecord('${table}');
${query ? `gr.addEncodedQuery('${query.replace(/'/g, "\\'")}');` : ""}
${order_by ? (order_dir === "desc" ? `gr.orderByDesc('${order_by}');` : `gr.orderBy('${order_by}');`) : ""}
gr.setLimit(${maxRows});
gr.query();
var results = [];
while (gr.next()) {
  var row = {};
  ${fields.map((f) => `row['${f}'] = gr.getDisplayValue('${f}') || gr.getValue('${f}') || '';`).join("\n  ")}
  results.push(row);
}
JSON.stringify({ count: results.length, records: results }, null, 2);
`;

        const response = await client.restApi<{ result: { success: boolean; result?: string; error?: string } }>(
          "POST",
          SCRIPT_RUNNER_API,
          { script }
        );

        const body = response.result;

        if (!body.success) {
          return errorResult(new Error(body.error ?? "Query execution failed"));
        }

        if (body.result) {
          try {
            return jsonResult(JSON.parse(body.result));
          } catch {
            return textResult(body.result);
          }
        }

        return jsonResult({ count: 0, records: [] });
      } catch (error) {
        return errorResult(error);
      }
    }
  );
}
