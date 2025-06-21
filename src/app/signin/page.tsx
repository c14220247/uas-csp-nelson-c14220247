"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../lib/supabase";
import { setSession } from "../utils/auth";

const IconMail = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
);

const IconLock = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-slate-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

const IconAlert = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-red-400 mr-3"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (loginError || !loginData.user) {
      setError("Login gagal: Periksa kembali email atau password Anda.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("persons")
      .select()
      .eq("id", loginData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setError("Gagal mengambil data profile pengguna.");
      setLoading(false);
      return;
    }

    setSession({ ...profile, email: loginData.user.email });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-800/50 border border-slate-700 rounded-lg shadow-2xl shadow-green-500/10 p-8 space-y-6 backdrop-blur-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-50">UAS CSP</h1>
          <p className="text-slate-400 mt-2">Welcome Please Log In First.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex items-center">
              <IconAlert />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-400 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconMail />
              </div>
              <input
                id="email"
                type="email"
                required
                className="w-full bg-slate-900 pl-10 p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder-slate-500 text-slate-50"
                placeholder="your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-400 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IconLock />
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full bg-slate-900 pl-10 p-3 border border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition placeholder-slate-500 text-slate-50"
                placeholder="your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-green-600 text-slate-900 py-3 rounded-md font-bold hover:bg-green-500 transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0.3)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 disabled:bg-slate-600 disabled:shadow-none disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? "Memproses..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
