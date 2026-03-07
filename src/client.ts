import type { ServiceNowConfig, QueryParams, PaginatedResult } from "./types.js";

export class ServiceNowApiError extends Error {
  constructor(
    public statusCode: number,
    public detail: string,
    public method: string,
    public path: string
  ) {
    super(`ServiceNow API error ${statusCode} ${method} ${path}: ${detail}`);
    this.name = "ServiceNowApiError";
  }
}

export class ServiceNowClient {
  private instanceUrl: string;
  private baseUrl: string;
  private authHeader: string;

  constructor(config: ServiceNowConfig) {
    this.instanceUrl = config.instanceUrl;
    this.baseUrl = `${config.instanceUrl}/api/now/table`;
    this.authHeader =
      "Basic " +
      Buffer.from(`${config.username}:${config.password}`).toString("base64");
  }

  private buildUrl(tableName: string, sysId?: string): string {
    let url = `${this.baseUrl}/${tableName}`;
    if (sysId) url += `/${sysId}`;
    return url;
  }

  private buildQueryString(params: QueryParams): string {
    const searchParams = new URLSearchParams();
    if (params.sysparm_query) searchParams.set("sysparm_query", params.sysparm_query);
    if (params.sysparm_fields) searchParams.set("sysparm_fields", params.sysparm_fields);
    if (params.sysparm_limit !== undefined)
      searchParams.set("sysparm_limit", String(params.sysparm_limit));
    if (params.sysparm_offset !== undefined)
      searchParams.set("sysparm_offset", String(params.sysparm_offset));
    if (params.sysparm_display_value)
      searchParams.set("sysparm_display_value", params.sysparm_display_value);
    const qs = searchParams.toString();
    return qs ? `?${qs}` : "";
  }

  private async request<T>(
    method: string,
    url: string,
    body?: Record<string, unknown>
  ): Promise<{ data: T; totalCount?: number }> {
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let detail: string;
      try {
        const errBody = (await response.json()) as { error?: { message?: string; detail?: string } };
        detail = errBody?.error?.message || errBody?.error?.detail || response.statusText;
      } catch {
        detail = response.statusText;
      }
      throw new ServiceNowApiError(
        response.status,
        detail,
        method,
        url.replace(this.baseUrl, "")
      );
    }

    const totalCountHeader = response.headers.get("X-Total-Count");
    const totalCount = totalCountHeader ? parseInt(totalCountHeader, 10) : undefined;

    // DELETE returns 204 No Content
    if (response.status === 204) {
      return { data: {} as T, totalCount };
    }

    const data = (await response.json()) as T;
    return { data, totalCount };
  }

  async query<T = Record<string, unknown>>(
    tableName: string,
    params: QueryParams = {}
  ): Promise<PaginatedResult<T>> {
    const limit = params.sysparm_limit ?? 20;
    const offset = params.sysparm_offset ?? 0;
    const url =
      this.buildUrl(tableName) +
      this.buildQueryString({ ...params, sysparm_limit: limit, sysparm_offset: offset });

    const { data, totalCount } = await this.request<{ result: T[] }>("GET", url);
    return {
      records: data.result,
      totalCount: totalCount ?? data.result.length,
      limit,
      offset,
    };
  }

  async getById<T = Record<string, unknown>>(
    tableName: string,
    sysId: string,
    fields?: string
  ): Promise<T> {
    const params: QueryParams = {};
    if (fields) params.sysparm_fields = fields;
    const url = this.buildUrl(tableName, sysId) + this.buildQueryString(params);
    const { data } = await this.request<{ result: T }>("GET", url);
    return data.result;
  }

  async create<T = Record<string, unknown>>(
    tableName: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const url = this.buildUrl(tableName);
    const { data } = await this.request<{ result: T }>("POST", url, body);
    return data.result;
  }

  async update<T = Record<string, unknown>>(
    tableName: string,
    sysId: string,
    body: Record<string, unknown>
  ): Promise<T> {
    const url = this.buildUrl(tableName, sysId);
    const { data } = await this.request<{ result: T }>("PATCH", url, body);
    return data.result;
  }

  async delete(tableName: string, sysId: string): Promise<void> {
    const url = this.buildUrl(tableName, sysId);
    await this.request("DELETE", url);
  }

  async aggregate(
    tableName: string,
    params: {
      sysparm_query?: string;
      sysparm_group_by?: string;
      sysparm_count?: boolean;
      sysparm_avg_fields?: string;
      sysparm_sum_fields?: string;
      sysparm_min_fields?: string;
      sysparm_max_fields?: string;
    }
  ): Promise<Record<string, unknown>[]> {
    const searchParams = new URLSearchParams();
    if (params.sysparm_query) searchParams.set("sysparm_query", params.sysparm_query);
    if (params.sysparm_group_by) searchParams.set("sysparm_group_by", params.sysparm_group_by);
    if (params.sysparm_count) searchParams.set("sysparm_count", "true");
    if (params.sysparm_avg_fields) searchParams.set("sysparm_avg_fields", params.sysparm_avg_fields);
    if (params.sysparm_sum_fields) searchParams.set("sysparm_sum_fields", params.sysparm_sum_fields);
    if (params.sysparm_min_fields) searchParams.set("sysparm_min_fields", params.sysparm_min_fields);
    if (params.sysparm_max_fields) searchParams.set("sysparm_max_fields", params.sysparm_max_fields);
    const qs = searchParams.toString();
    const url = `${this.instanceUrl}/api/now/stats/${tableName}${qs ? `?${qs}` : ""}`;
    const { data } = await this.request<{ result: Record<string, unknown>[] }>("GET", url);
    return data.result;
  }

  async restApi<T = Record<string, unknown>>(
    method: string,
    apiPath: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.instanceUrl}${apiPath}`;
    const { data } = await this.request<T>(method, url, body);
    return data;
  }
}
