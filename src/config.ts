import { z } from "zod";
import dotenv from "dotenv";
import type { ServiceNowConfig } from "./types.js";

dotenv.config({ path: process.env.SERVICENOW_ENV_FILE || ".env" });

const configSchema = z.object({
  SERVICENOW_INSTANCE_URL: z
    .string()
    .url("SERVICENOW_INSTANCE_URL must be a valid URL")
    .refine((url) => !url.endsWith("/"), {
      message: "SERVICENOW_INSTANCE_URL must not end with a trailing slash",
    }),
  SERVICENOW_USERNAME: z
    .string()
    .min(1, "SERVICENOW_USERNAME is required"),
  SERVICENOW_PASSWORD: z
    .string()
    .min(1, "SERVICENOW_PASSWORD is required"),
  SERVICENOW_MODE: z
    .enum(["debug", "develop"])
    .default("debug"),
});

export function loadConfig(): ServiceNowConfig {
  const result = configSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error(`Configuration error:\n${errors}`);
    process.exit(1);
  }

  return {
    instanceUrl: result.data.SERVICENOW_INSTANCE_URL,
    username: result.data.SERVICENOW_USERNAME,
    password: result.data.SERVICENOW_PASSWORD,
    mode: result.data.SERVICENOW_MODE,
  };
}
