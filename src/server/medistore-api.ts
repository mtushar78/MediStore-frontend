const env = {
  NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
};

type Json = Record<string, unknown>;

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
  }
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function medistoreFetch<T>(
  path: string,
  options: RequestInit & { token?: string; next?: RequestInit["next"] } = {},
): Promise<T> {
  const url = new URL(path, env.NEXT_PUBLIC_BACKEND_URL);
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const details = await parseJsonSafe(res);
    throw new ApiError("Request failed", res.status, details);
  }
  return (await res.json()) as T;
}

export type BackendAuthResponse = {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "customer" | "seller" | "admin";
      status: string;
    };
  };
};

export async function backendLogin(email: string, password: string) {
  return medistoreFetch<BackendAuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password } satisfies Json),
  });
}
