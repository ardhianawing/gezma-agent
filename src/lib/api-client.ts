export class ApiError extends Error {
  public readonly status: number;
  public readonly data: { error: string; details?: Record<string, unknown> };

  constructor(status: number, data: { error: string; details?: Record<string, unknown> }) {
    super(data.error);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = '/login';
    throw new ApiError(401, { error: 'Tidak terautentikasi' });
  }

  const data = await res.json();

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

export const api = {
  get<T>(url: string): Promise<T> {
    return request<T>(url);
  },

  post<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch<T>(url: string, body: unknown): Promise<T> {
    return request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  del<T>(url: string): Promise<T> {
    return request<T>(url, { method: 'DELETE' });
  },
};
