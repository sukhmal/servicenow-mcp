# ServiceNow MCP Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A comprehensive MCP (Model Context Protocol) server that gives AI assistants expert-level access to any ServiceNow module. Connects to a ServiceNow instance via Basic Auth and provides tools for debugging, inspecting configuration, and building features across the entire platform.

## Capabilities

This server covers **every major ServiceNow module** — giving an AI assistant the same investigative and development power as a senior ServiceNow developer:

| Module | What you can do |
|--------|----------------|
| **Schema & Metadata** | Inspect table structures, columns, field types, choices, inheritance hierarchies, and reference relationships |
| **Table API** | Query, create, update, delete records on any table |
| **Scripts** | List, read, search, create, and update business rules, script includes, client scripts, and fix scripts |
| **ACLs & Security** | Inspect and manage access control lists, UI policies, UI actions |
| **Users & Groups** | Look up users, roles, group memberships, role hierarchies — debug permission issues |
| **Update Sets** | List, inspect, and create update sets — review all changes in an update set |
| **Flows & Workflows** | Inspect Flow Designer flows and legacy workflows, trace execution history, debug workflow paths |
| **Service Catalog** | Browse catalog items, variables, variable sets, catalog client scripts, RITMs, and catalog tasks |
| **Notifications & Events** | List email notifications, query email logs and event logs — debug why emails aren't sent |
| **Scripted REST APIs** | Inspect REST API definitions and resources, including scripts |
| **CMDB** | Browse Configuration Items, relationships, CI classes across the CMDB hierarchy |
| **Import Sets** | Inspect import sets, rows, transform maps, field mappings, and transform scripts |
| **UI Components** | Inspect UI pages, macros, scripts, form layouts, sections, and related lists |
| **Service Portal** | Browse portals, pages, widgets (with full HTML/CSS/scripts), and Angular providers |
| **SLAs** | Inspect SLA definitions and active task SLA tracking records |
| **System Config** | Search system properties, scheduled jobs, application scopes, and modules |
| **Script Execution** | Run arbitrary server-side JavaScript on the instance — like Background Scripts but via API. Full GlideRecord/GlideSystem access. |
| **Logs & Diagnostics** | Query syslog, transaction logs, get aggregate statistics for any table, analyze all customizations on a table |

## Modes

- **Debug mode** (default) — Read-only tools for safe investigation
- **Develop mode** — Full CRUD for building features (includes all debug tools plus create/update/delete operations)

## Setup

```bash
npm install
npm run build
```

Copy `.env.example` to `.env` and fill in your credentials:

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

## Tool Reference

### Schema & Metadata
| Tool | Mode | Description |
|------|------|-------------|
| `sn_schema_tables` | Both | List/search tables — find tables by name or label |
| `sn_schema_columns` | Both | List all columns for a table with types, references, defaults |
| `sn_schema_choices` | Both | Get choice list values for any field |
| `sn_schema_table_hierarchy` | Both | Get full parent/child inheritance chain for a table |
| `sn_schema_references` | Both | Find all reference fields pointing to/from a table |

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

### ACLs, UI Policies & UI Actions
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

### Users, Groups & Roles
| Tool | Mode | Description |
|------|------|-------------|
| `sn_user_list` | Both | Search users by name, email, username |
| `sn_user_roles` | Both | List roles assigned to a user |
| `sn_user_groups` | Both | List groups a user belongs to |
| `sn_group_list` | Both | Search groups by name, type |
| `sn_group_members` | Both | List members of a group |
| `sn_group_roles` | Both | List roles assigned to a group |
| `sn_role_list` | Both | Search roles by name |
| `sn_role_contains` | Both | Show role inheritance hierarchy |

### Update Sets
| Tool | Mode | Description |
|------|------|-------------|
| `sn_update_set_list` | Both | List update sets with state and scope |
| `sn_update_set_get` | Both | Get update set details |
| `sn_update_set_changes` | Both | List all changes in an update set |
| `sn_update_set_create` | Develop | Create a new update set |
| `sn_update_set_update` | Develop | Update an existing update set |

### Flow Designer
| Tool | Mode | Description |
|------|------|-------------|
| `sn_flow_list` | Both | List flows with status, scope, trigger type |
| `sn_flow_get` | Both | Get full flow details |
| `sn_flow_list_actions` | Both | List flow actions/subflows |
| `sn_flow_create` | Develop | Create a new flow |
| `sn_flow_update` | Develop | Update a flow |

### Workflows (Legacy)
| Tool | Mode | Description |
|------|------|-------------|
| `sn_workflow_list` | Both | List legacy workflows |
| `sn_workflow_get` | Both | Get workflow details |
| `sn_workflow_versions` | Both | List workflow versions (published vs draft) |
| `sn_workflow_activities` | Both | List activities/steps in a workflow version |
| `sn_workflow_context_list` | Both | List workflow executions for a record |
| `sn_workflow_execution_history` | Both | Trace execution path through a workflow |

### Service Catalog
| Tool | Mode | Description |
|------|------|-------------|
| `sn_catalog_category_list` | Both | List catalog categories |
| `sn_catalog_item_list` | Both | List catalog items (standard, record producers, order guides) |
| `sn_catalog_item_get` | Both | Get catalog item with all its variables |
| `sn_catalog_variable_sets` | Both | List variable sets for a catalog item |
| `sn_catalog_client_script_list` | Both | List catalog client scripts |
| `sn_catalog_client_script_get` | Both | Get catalog client script with source |
| `sn_ritm_list` | Both | List requested items (RITMs) |
| `sn_sc_task_list` | Both | List catalog tasks |

### Notifications & Events
| Tool | Mode | Description |
|------|------|-------------|
| `sn_notification_list` | Both | List email notifications for a table |
| `sn_notification_get` | Both | Get full notification details with template |
| `sn_email_log` | Both | Query email delivery logs |
| `sn_event_log` | Both | Query event processing log |

### Scripted REST APIs
| Tool | Mode | Description |
|------|------|-------------|
| `sn_rest_api_list` | Both | List Scripted REST APIs |
| `sn_rest_api_get` | Both | Get REST API with all its resources |
| `sn_rest_api_resource_get` | Both | Get resource details with script |
| `sn_rest_api_create` | Develop | Create a new Scripted REST API |
| `sn_rest_api_resource_create` | Develop | Create a new API resource |
| `sn_rest_api_resource_update` | Develop | Update an API resource |

### CMDB
| Tool | Mode | Description |
|------|------|-------------|
| `sn_cmdb_ci_list` | Both | List CIs from any CI class |
| `sn_cmdb_ci_get` | Both | Get full CI details |
| `sn_cmdb_rel_list` | Both | List CI relationships (parent/child) |
| `sn_cmdb_class_list` | Both | List CMDB CI classes |

### Import Sets & Transform Maps
| Tool | Mode | Description |
|------|------|-------------|
| `sn_import_set_list` | Both | List import sets with status and row counts |
| `sn_import_set_rows` | Both | List rows in an import set |
| `sn_transform_map_list` | Both | List transform maps |
| `sn_transform_map_get` | Both | Get transform map with field mappings |
| `sn_transform_map_scripts` | Both | List transform scripts |

### UI Components
| Tool | Mode | Description |
|------|------|-------------|
| `sn_ui_page_list` | Both | List UI Pages |
| `sn_ui_page_get` | Both | Get UI Page with HTML and scripts |
| `sn_ui_macro_list` | Both | List UI Macros |
| `sn_ui_script_list` | Both | List UI Scripts |
| `sn_ui_script_get` | Both | Get UI Script with source |
| `sn_form_sections` | Both | List form sections for a table |
| `sn_form_layout` | Both | Get form field layout |
| `sn_related_lists` | Both | List related lists on a form |

### Service Portal
| Tool | Mode | Description |
|------|------|-------------|
| `sn_sp_portal_list` | Both | List Service Portals |
| `sn_sp_widget_list` | Both | List widgets |
| `sn_sp_widget_get` | Both | Get widget with HTML, CSS, client/server scripts |
| `sn_sp_page_list` | Both | List Service Portal pages |
| `sn_sp_angular_provider_list` | Both | List Angular providers |

### SLAs
| Tool | Mode | Description |
|------|------|-------------|
| `sn_sla_definition_list` | Both | List SLA definitions |
| `sn_sla_definition_get` | Both | Get SLA definition details |
| `sn_task_sla_list` | Both | List active task SLA records |

### System Configuration
| Tool | Mode | Description |
|------|------|-------------|
| `sn_sys_property_list` | Both | Search system properties |
| `sn_sys_property_get` | Both | Get a property value by name |
| `sn_sys_property_set` | Develop | Set a system property value |
| `sn_scheduled_job_list` | Both | List scheduled jobs |
| `sn_scheduled_job_get` | Both | Get scheduled job details |
| `sn_app_list` | Both | List application scopes |
| `sn_app_get` | Both | Get application details |
| `sn_app_modules` | Both | List application modules |
| `sn_aggregate` | Both | Get aggregate stats (count/sum/avg/min/max) for any table |
| `sn_table_impact` | Both | Analyze all customizations affecting a table |

### Script Execution
| Tool | Mode | Description |
|------|------|-------------|
| `sn_script_execute` | Develop | Execute arbitrary server-side scripts (like Background Scripts). Full GlideRecord/GlideSystem access. Auto-provisions a Scripted REST API on first use. |
| `sn_script_execute_query` | Develop | Convenience wrapper — run a GlideRecord query with display values without writing boilerplate |

### System Logs
| Tool | Mode | Description |
|------|------|-------------|
| `sn_logs_query` | Both | Query syslog by level, source, message, time range |
| `sn_logs_get_transactions` | Both | Query transaction logs by URL, status, time range |
