const TURSO_API_BASE = "https://api.turso.tech";

function headers() {
  return {
    Authorization: `Bearer ${process.env.TURSO_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

function orgSlug() {
  return process.env.TURSO_ORG_SLUG!;
}

/** Returns true if Turso Platform API is configured */
export function isTursoConfigured() {
  return !!(process.env.TURSO_API_TOKEN && process.env.TURSO_ORG_SLUG);
}

export async function createDatabase(name: string) {
  const res = await fetch(
    `${TURSO_API_BASE}/v1/organizations/${orgSlug()}/databases`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name,
        group: "default",
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create database "${name}": ${res.status} ${body}`);
  }

  return res.json() as Promise<{
    database: { Name: string; Hostname: string };
  }>;
}

export async function createAuthToken(dbName: string) {
  const res = await fetch(
    `${TURSO_API_BASE}/v1/organizations/${orgSlug()}/databases/${dbName}/auth/tokens`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ authorization: "full-access" }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create auth token for "${dbName}": ${res.status} ${body}`);
  }

  return res.json() as Promise<{ jwt: string }>;
}

export async function deleteDatabase(name: string) {
  const res = await fetch(
    `${TURSO_API_BASE}/v1/organizations/${orgSlug()}/databases/${name}`,
    {
      method: "DELETE",
      headers: headers(),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to delete database "${name}": ${res.status} ${body}`);
  }
}
