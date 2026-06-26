"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SignInPage({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const oauthError = searchParams.get("error");

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Registration failed");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 sm:p-10"
      >
        <div className="mb-8">
          <span className="h-5 w-1 rounded-full bg-gradient-to-b from-[var(--gradient-from)] to-[var(--gradient-to)]" />
          <h1 className="page-title mt-4">
            {isRegister ? "Create account" : "Welcome back"}
          </h1>
          <p className="page-subtitle">
            {isRegister ? "Start tracking your study sessions" : "Sign in to continue"}
          </p>
        </div>

        {googleEnabled ? (
          <>
            <button onClick={() => signIn("google", { callbackUrl })} className="btn-secondary mb-6 w-full">
              Continue with Google
            </button>
            <div className="relative my-6">
              <div className="divider" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] px-3 text-xs text-[var(--text-muted)]">
                or
              </span>
            </div>
          </>
        ) : null}

        <div className="space-y-3">
          {isRegister && (
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
        </div>

        {(error || oauthError) && (
          <p className="mt-3 text-sm text-red-400">
            {error || "Sign-in failed. Use email and password, or try again later."}
          </p>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary mt-6 w-full">
          {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
        </button>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          {isRegister ? "Already have an account?" : "No account yet?"}{" "}
          <button onClick={() => { setIsRegister(!isRegister); setError(""); }} className="text-[var(--primary)] hover:underline">
            {isRegister ? "Sign in" : "Sign up"}
          </button>
        </p>

        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-[var(--text)]">Continue without signing in</Link>
        </p>
      </motion.div>
    </div>
  );
}
