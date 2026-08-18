"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const fields = ["fullName", "phone", "address", "city", "state", "pincode"];
export default function AddressModal({ isOpen, closeModal }: { isOpen: boolean; closeModal: () => void }) {
  const [address, setAddress] = useState<Record<string, string>>({});
  useEffect(() => { if (!isOpen) return; const token = localStorage.getItem("userToken"); if (!token) return; fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://all-india-boards-admin-backend.onrender.com/api"}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(user => setAddress(user.address || { fullName: user.name || "", phone: user.phone || "" })).catch(() => {}); }, [isOpen]);
  const save = async (event: React.FormEvent) => { event.preventDefault(); const token = localStorage.getItem("userToken"); const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://all-india-boards-admin-backend.onrender.com/api"}/auth/profile`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ address, name: address.fullName, phone: address.phone }) }); if (!res.ok) return toast.error("Could not save address"); const user = await res.json(); localStorage.setItem("userInfo", JSON.stringify(user)); toast.success("Address saved"); closeModal(); };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-[99999] bg-dark/70 p-4 flex items-center justify-center"><form onSubmit={save} className="w-full max-w-[700px] rounded-xl bg-white p-7 relative"><button type="button" onClick={closeModal} className="absolute right-4 top-3 text-2xl">×</button><h2 className="text-xl font-semibold mb-5">Shipping address</h2><div className="grid sm:grid-cols-2 gap-4">{fields.map((field) => <label key={field} className={field === "address" ? "sm:col-span-2" : ""}>{field.replace(/([A-Z])/g, " $1")}<input required={field !== "address" || true} value={address[field] || ""} onChange={(e) => setAddress({ ...address, [field]: e.target.value })} className="mt-1 w-full rounded-md border border-gray-3 bg-gray-1 py-2.5 px-4" /></label>)}</div><button className="mt-6 bg-blue text-white py-3 px-7 rounded-md">Save address</button></form></div>;
}
