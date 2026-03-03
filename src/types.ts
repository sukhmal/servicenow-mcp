import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServiceNowClient } from "./client.js";

export type Mode = "debug" | "develop";

export interface ServiceNowConfig {
  instanceUrl: string;
  username: string;
  password: string;
  mode: Mode;
}

export interface QueryParams {
  sysparm_query?: string;
  sysparm_fields?: string;
  sysparm_limit?: number;
  sysparm_offset?: number;
  sysparm_display_value?: "true" | "false" | "all";
}

export interface TableResponse<T = Record<string, unknown>> {
  result: T | T[];
}

export interface PaginatedResult<T = Record<string, unknown>> {
  records: T[];
  totalCount: number;
  limit: number;
  offset: number;
}

export type RegisterTools = (
  server: McpServer,
  client: ServiceNowClient,
  mode: Mode
) => void;
