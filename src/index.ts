import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { ServiceNowClient } from "./client.js";
import { registerTableTools } from "./tools/table.js";
import { registerLogTools } from "./tools/logs.js";
import { registerScriptTools } from "./tools/script.js";
import { registerConfigItemTools } from "./tools/config-items.js";
import { registerFlowTools } from "./tools/flow.js";

const config = loadConfig();
const client = new ServiceNowClient(config);

const server = new McpServer({
  name: "servicenow-mcp",
  version: "1.0.0",
});

// Register all tool modules — each respects mode internally
registerTableTools(server, client, config.mode);
registerLogTools(server, client, config.mode);
registerScriptTools(server, client, config.mode);
registerConfigItemTools(server, client, config.mode);
registerFlowTools(server, client, config.mode);

const debugToolCount = 17;
const developToolCount = 28;
const toolCount = config.mode === "develop" ? developToolCount : debugToolCount;

console.error(
  `ServiceNow MCP Server started (mode: ${config.mode}, ${toolCount} tools registered)`
);
console.error(`Instance: ${config.instanceUrl}`);

const transport = new StdioServerTransport();
await server.connect(transport);
