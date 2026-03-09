# Contributing

## Project Structure

```
src/
├── index.ts              # Entry point — MCP server setup and tool registration
├── client.ts             # ServiceNowClient — HTTP client for all SN API calls
├── config.ts             # Environment config loading and validation
├── types.ts              # Shared TypeScript types
├── utils.ts              # Shared helpers (errorResult, jsonResult, etc.)
└── tools/
    ├── table.ts          # Generic Table API (CRUD on any table)
    ├── schema.ts         # Table metadata, columns, choices, hierarchy, references
    ├── script.ts         # Business rules, script includes, client scripts, fix scripts
    ├── config-items.ts   # ACLs, UI Policies, UI Actions
    ├── security.ts       # Users, groups, roles, role hierarchy
    ├── update-set.ts     # Update sets and customer updates
    ├── flow.ts           # Flow Designer (flows, actions)
    ├── workflow.ts       # Legacy workflows, versions, activities, execution history
    ├── catalog.ts        # Service catalog items, variables, RITMs, catalog tasks
    ├── notification.ts   # Email notifications, email logs, event logs
    ├── rest-api.ts       # Scripted REST API definitions and resources
    ├── cmdb.ts           # CMDB CIs, relationships, CI classes
    ├── import-set.ts     # Import sets, rows, transform maps, transform scripts
    ├── ui.ts             # UI pages, macros, scripts, forms, Service Portal widgets
    ├── sla.ts            # SLA definitions and task SLA records
    ├── system.ts         # System properties, scheduled jobs, app scopes, aggregates
    ├── data-policy.ts    # Data policies and field rules (server-side enforcement)
    ├── execute.ts        # Background script execution via native sys.scripts.do
    ├── procurement.ts    # Vendors, contracts, legacy POs, cost centers, expenses, approvals
    ├── s2p.ts            # Source-to-Pay: suppliers, requisitions, POs, receipts, invoices, cases
    └── logs.ts           # Syslog and transaction logs

.claude/
└── skills/
    └── servicenow-sourcing-procurement/
        └── SKILL.md      # Claude Code skill for S2P debugging & development
```

## Adding a New Tool Module

1. Create `src/tools/your-module.ts` following the pattern in any existing module
2. Export a `registerYourModuleTools(server, client, mode)` function
3. Import and add it to the `registrars` array in `src/index.ts`
4. Add tool documentation to the Tool Reference section in `README.md`
5. Run `npm run build` to verify — the TypeScript compiler catches most issues

## Adding a Tool to an Existing Module

1. Add your `server.tool(...)` call in the appropriate position:
   - Before the `if (mode !== "develop") return;` guard for read-only tools
   - After the guard for write tools
2. Use `errorResult()` and `jsonResult()` from `../utils.js`
3. Document in `README.md`

## ServiceNow API Notes

- All data access goes through the **Table API** (`/api/now/table/{tableName}`)
- Aggregate queries use the **Stats API** (`/api/now/stats/{tableName}`)
- Queries use ServiceNow's encoded query string format (field=value joined with `^`)
- Common query operators: `=`, `!=`, `LIKE`, `STARTSWITH`, `IN`, `>`, `<`, `>=`, `<=`, `ISNOTEMPTY`, `ISEMPTY`
- Ordering: `ORDERBYfield` (ascending) or `ORDERBYDESCfield` (descending)
- Use `sysparm_display_value: "true"` to get human-readable values for reference fields and choice lists
- Use `sysparm_display_value: "all"` to get both display and actual values (returned as `{ display_value, value }`)

## Testing

Currently no automated tests. Verify against a ServiceNow instance using:

```bash
SERVICENOW_ENV_FILE=.env npx @modelcontextprotocol/inspector node dist/index.js
```

## Style Guide

- TypeScript strict mode
- ES2022 target with Node16 module resolution
- Prefer `const` over `let`
- Use Zod for all tool parameter schemas with `.describe()` on every field
- Tool descriptions should explain what the tool does and when to use it
- Keep tool names concise: `sn_{module}_{action}`
