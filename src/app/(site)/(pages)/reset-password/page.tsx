"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const params = useSearchParams(); const [password, setPassword] = useState(""); const [confirm, setConfirm] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (password !== confirm) return toast.error("Passwords do not match"); setLoading(true); try { const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://all-india-boards-admin-backend.onrender.com/api"; const response = await fetch(`${apiUrl}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: params.get("token"), password, accountType: "user" }) }); const data = await response.json(); if (!response.ok) throw new Error(data.message); toast.success(data.message); setPassword(""); setConfirm(""); } catch (error: any) { toast.error(error.message || "Could not reset password"); } finally { setLoading(false); } };
  return <main className="min-h-screen bg-gray-2 px-4 py-20"><form onSubmit={submit} className="mx-auto max-w-md rounded-xl bg-white p-7 shadow-1 sm:p-10"><h1 className="text-2xl font-semibold text-dark">Set a new password</h1><p className="mt-2 text-dark-4">Choose a strong password with at least 8 characters.</p><label className="mt-7 block text-sm text-dark">New password<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-3 bg-gray-1 px-4 py-3 outline-none" /></label><label className="mt-4 block text-sm text-dark">Confirm password<input required minLength={8} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-2 w-full rounded-lg border border-gray-3 bg-gray-1 px-4 py-3 outline-none" /></label><button disabled={loading} className="mt-6 w-full rounded-lg bg-dark py-3 font-medium text-white hover:bg-blue disabled:bg-gray-4">{loading ? "Updating…" : "Update password"}</button><Link href="/signin" className="mt-5 block text-center text-sm text-blue">Back to sign in</Link></form></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-screen bg-gray-2 px-4 py-20 text-center">Loading reset form…</main>}><ResetPasswordForm /></Suspense>;
}
