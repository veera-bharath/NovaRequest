export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HeaderRow {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  id?: string;
  name?: string;
  method: Method;
  url: string;
  headers: HeaderRow[];
  body: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  error?: string;
}

export interface SavedRequest {
  id: string;
  name: string;
  method: Method;
  url: string;
  headers: HeaderRow[];
  body: string;
  createdAt: number;
}
