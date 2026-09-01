"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://all-india-boards-admin-backend.onrender.com/api";
      const response = await fetch(`${apiUrl}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, accountType: "user" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      toast.success(data.message);
    } catch (error: any) { toast.error(error.message || "Could not request a reset link"); }
    finally { setLoading(false); }
  };
  return <main className="min-h-screen bg-gray-2 px-4 py-20"><form onSubmit={submit} className="mx-auto max-w-md rounded-xl bg-white p-7 shadow-1 sm:p-10"><h1 className="text-2xl font-semibold text-dark">Forgot password?</h1><p className="mt-2 text-dark-4">Enter your account email and we’ll send a reset link.</p><label className="mt-7 block text-sm text-dark">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-3 bg-gray-1 px-4 py-3 outline-none focus:ring-2 focus:ring-blue/20" placeholder="you@example.com" /></label><button disabled={loading} className="mt-6 w-full rounded-lg bg-dark py-3 font-medium text-white hover:bg-blue disabled:bg-gray-4">{loading ? "Sending…" : "Send reset link"}</button><Link href="/signin" className="mt-5 block text-center text-sm text-blue">Back to sign in</Link></form></main>;
}
