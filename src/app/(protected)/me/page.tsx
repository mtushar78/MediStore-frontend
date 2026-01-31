import { auth } from "@/auth/session";

export default async function MePage() {
  const session = await auth();

  return (
    <main style={{ padding: 16 }}>
      <h1>Me (SSR Protected)</h1>
      <pre>{JSON.stringify(session?.user ?? null, null, 2)}</pre>
    </main>
  );
}
