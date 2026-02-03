"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("customer1@example.com");
  const [password, setPassword] = useState("pass1234");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setPending(false);
    if (!res?.ok) {
      setError("Invalid credentials");
      return;
    }
    router.push(callbackUrl);
  }

  return (
    <main className="max-w-md mx-auto my-16 px-4">
      <div className="card p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Login to MediStore</h1>
        
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="input"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="input"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            disabled={pending}
            type="submit"
            className="btn-primary w-full py-3 text-lg"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary-700 hover:text-primary-800 font-semibold">
              Register here
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Demo Credentials:</strong>
          </p>
          <p className="text-xs text-gray-600">
            Email: customer1@example.com<br />
            Password: pass1234
          </p>
        </div>
      </div>
    </main>
  );
}
