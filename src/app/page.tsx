import Link from "next/link";
import { auth } from "@/auth/session";

export default async function Home() {
  const session = await auth();

  return (
    <main style={{ padding: 16, display: "grid", gap: 12 }}>
      <h1>MediStore Frontend</h1>
      <p>Backend: {process.env.NEXT_PUBLIC_BACKEND_URL}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/login">Login</Link>
        <Link href="/me">Protected SSR page</Link>
        <Link href="/api/health">Frontend API: /api/health</Link>
      </div>
      <pre>{JSON.stringify(session?.user ?? null, null, 2)}</pre>
    </main>
  );
}
