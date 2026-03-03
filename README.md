# ServiceNow MCP Server

An MCP (Model Context Protocol) server for ServiceNow developers that connects to a ServiceNow instance via Basic Auth. Provides tools for debugging, inspecting configuration, and building features.

## Modes

- **Debug mode** (default) — 17 read-only tools for safe investigation
- **Develop mode** — 28 tools with full CRUD for building features

## Setup

```bash
npm install
npm run build
```

Copy `.env.example` to `.env` (or a named variant like `.env`) and fill in your credentials:

```env
SERVICENOW_INSTANCE_URL=https://devXXXXX.service-now.com
SERVICENOW_USERNAME=admin
SERVICENOW_PASSWORD=your-password
SERVICENOW_MODE=debug
```

## Running

```bash
# Default (.env)
npm start

# Specific instance
SERVICENOW_ENV_FILE=.env npm start

# Development with tsx
SERVICENOW_ENV_FILE=.env npm run dev
```

## Multiple Instances

Create separate env files per instance (`.env`, `.env.prod`, etc.) and switch with `SERVICENOW_ENV_FILE`.

## Claude Code Integration

Add to `.mcp.json` in your project root:

```json
{
  "mcpServers": {
    "servicenow": {
      "command": "node",
      "args": ["/path/to/servicenow-mcp/dist/index.js"],
      "env": {
        "SERVICENOW_ENV_FILE": "/path/to/servicenow-mcp/.env"
      }
    }
  }
}
```

## MCP Inspector

```bash
SERVICENOW_ENV_FILE=.env npx @modelcontextprotocol/inspector node dist/index.js
```

## Tools

### Table API
| Tool | Mode | Description |
|------|------|-------------|
| `sn_table_query` | Both | Query records with filters, pagination, field selection |
| `sn_table_get` | Both | Get a single record by sys_id |
| `sn_table_create` | Develop | Create a new record |
| `sn_table_update` | Develop | Update a record by sys_id |
| `sn_table_delete` | Develop | Delete a record |

### Scripts
| Tool | Mode | Description |
|------|------|-------------|
| `sn_script_list` | Both | List scripts by type (business_rule, script_include, client_script, fix_script) |
| `sn_script_get` | Both | Get full script details + source code |
| `sn_script_search` | Both | Search scripts by name or body text |
| `sn_script_create` | Develop | Create a new script |
| `sn_script_update` | Develop | Update an existing script |

### Configuration Items
| Tool | Mode | Description |
|------|------|-------------|
| `sn_acl_list` | Both | List ACLs by table/operation/type |
| `sn_acl_get` | Both | Get full ACL details |
| `sn_ui_policy_list` | Both | List UI Policies |
| `sn_ui_policy_get` | Both | Get UI Policy with associated actions |
| `sn_ui_policy_actions` | Both | List UI Policy Actions for a policy |
| `sn_ui_action_list` | Both | List UI Actions (buttons, links, context menus) |
| `sn_ui_action_get` | Both | Get full UI Action details |
| `sn_acl_create` | Develop | Create a new ACL |
| `sn_acl_update` | Develop | Update an existing ACL |
| `sn_ui_policy_create` | Develop | Create a new UI Policy |
| `sn_ui_policy_update` | Develop | Update an existing UI Policy |

### Flow Designer
| Tool | Mode | Description |
|------|------|-------------|
| `sn_flow_list` | Both | List flows with status, scope, trigger type |
| `sn_flow_get` | Both | Get full flow details |
| `sn_flow_list_actions` | Both | List flow actions/subflows |
| `sn_flow_create` | Develop | Create a new flow |
| `sn_flow_update` | Develop | Update a flow |

### System Logs
| Tool | Mode | Description |
|------|------|-------------|
| `sn_logs_query` | Both | Query syslog by level, source, message, time range |
| `sn_logs_get_transactions` | Both | Query transaction logs by URL, status, time range |
