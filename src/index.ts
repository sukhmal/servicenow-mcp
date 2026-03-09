import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ServiceNowClient } from "./client.js";
import { registerTableTools } from "./tools/table.js";
import { registerLogTools } from "./tools/logs.js";
import { registerScriptTools } from "./tools/script.js";
import { registerConfigItemTools } from "./tools/config-items.js";
import { registerFlowTools } from "./tools/flow.js";
import { registerSchemaTools } from "./tools/schema.js";
import { registerUpdateSetTools } from "./tools/update-set.js";
import { registerSystemTools } from "./tools/system.js";
import { registerNotificationTools } from "./tools/notification.js";
import { registerRestApiTools } from "./tools/rest-api.js";
import { registerCatalogTools } from "./tools/catalog.js";
import { registerWorkflowTools } from "./tools/workflow.js";
import { registerCmdbTools } from "./tools/cmdb.js";
import { registerImportSetTools } from "./tools/import-set.js";
import { registerSecurityTools } from "./tools/security.js";
import { registerUiTools } from "./tools/ui.js";
import { registerSlaTools } from "./tools/sla.js";
import { registerExecuteTools } from "./tools/execute.js";
import { registerDataPolicyTools } from "./tools/data-policy.js";
import { registerProcurementTools } from "./tools/procurement.js";
import { registerS2pTools } from "./tools/s2p.js";

const config = loadConfig();
const client = new ServiceNowClient(config);

const server = new McpServer({
  name: "servicenow-mcp",
  version: "2.0.0",
});

const registrars = [
  registerTableTools,
  registerLogTools,
  registerScriptTools,
  registerConfigItemTools,
  registerFlowTools,
  registerSchemaTools,
  registerUpdateSetTools,
  registerSystemTools,
  registerNotificationTools,
  registerRestApiTools,
  registerCatalogTools,
  registerWorkflowTools,
  registerCmdbTools,
  registerImportSetTools,
  registerSecurityTools,
  registerUiTools,
  registerSlaTools,
  registerExecuteTools,
  registerDataPolicyTools,
  registerProcurementTools,
  registerS2pTools,
];

for (const register of registrars) {
  register(server, client, config.mode);
}

console.error(
  `ServiceNow MCP Server v2.0.0 started (mode: ${config.mode})`
);
console.error(`Instance: ${config.instanceUrl}`);

const transport = new StdioServerTransport();
await server.connect(transport);
