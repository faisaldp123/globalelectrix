"use client";

import { FormEvent, useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import toast from "react-hot-toast";

type Address = { fullName?: string; phone?: string; address?: string; city?: string; state?: string; pincode?: string };
type User = { name?: string; email?: string; phone?: string; createdAt?: string; address?: Address };
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://all-india-boards-admin-backend.onrender.com/api";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const token = localStorage.getItem("userToken");
    const saved = localStorage.getItem("userInfo");
    if (saved) try { setUser(JSON.parse(saved)); } catch { /* ignore invalid local data */ }
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${apiUrl}/auth/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) return;
      const profile = await response.json();
      setUser(profile);
      localStorage.setItem("userInfo", JSON.stringify(profile));
    } catch { /* keep cached profile */ } finally { setLoading(false); }
  };

  useEffect(() => { loadProfile(); }, []);

  const saveDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const token = localStorage.getItem("userToken");
    if (!token) return toast.error("Please sign in to update your account");
    try {
      const response = await fetch(`${apiUrl}/auth/profile`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: String(data.get("name") || "").trim(), phone: String(data.get("phone") || "").trim() }) });
      if (!response.ok) throw new Error();
      const profile = await response.json();
      setUser(profile); localStorage.setItem("userInfo", JSON.stringify(profile)); toast.success("Account details saved");
    } catch { toast.error("Could not save account details"); }
  };

  const address = user?.address;
  const hasAddress = Boolean(address && Object.values(address).some(Boolean));
  const menu = [["dashboard", "Dashboard"], ["orders", "Orders"], ["addresses", "Addresses"], ["account-details", "Account Details"]] as const;

  return <>
    <Breadcrumb title="My Account" pages={["my account"]} />
    <section className="overflow-hidden bg-gray-2 py-20"><div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0"><div className="flex flex-col gap-7.5 xl:flex-row">
      <aside className="w-full rounded-xl bg-white shadow-1 xl:max-w-[320px]"><div className="border-b border-gray-3 px-6 py-7"><p className="font-medium text-dark">{user?.name || (loading ? "Loading account…" : "Guest user")}</p><p className="mt-1 text-custom-xs">{user?.email || "Sign in to view your account"}</p>{user?.createdAt && <p className="mt-1 text-custom-xs">Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</p>}</div><nav className="flex flex-wrap gap-3 p-5 xl:flex-col">{menu.map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} className={`rounded-md px-4 py-3 text-left ${activeTab === id ? "bg-blue text-white" : "bg-gray-1 text-dark hover:bg-blue hover:text-white"}`}>{label}</button>)}<button onClick={() => { localStorage.removeItem("userToken"); localStorage.removeItem("userInfo"); window.location.href = "/"; }} className="rounded-md bg-gray-1 px-4 py-3 text-left text-red hover:bg-red hover:text-white">Sign out</button></nav></aside>
      <div className="w-full xl:max-w-[770px]">
        {activeTab === "dashboard" && <div className="rounded-xl bg-white p-7 shadow-1 sm:p-10"><h2 className="text-xl font-semibold text-dark">Hello, {user?.name || "there"}</h2><p className="mt-4">View your orders, manage a saved address, and update your account details here.</p></div>}
        {activeTab === "orders" && <div className="rounded-xl bg-white shadow-1"><Orders /></div>}
        {activeTab === "addresses" && <div className="rounded-xl bg-white p-7 shadow-1 sm:p-10"><div className="flex items-center justify-between gap-4"><h2 className="text-xl font-semibold text-dark">Saved address</h2><button onClick={() => setAddressModal(true)} className="rounded-md bg-blue px-5 py-2.5 text-white">{hasAddress ? "Edit address" : "Add address"}</button></div>{hasAddress ? <div className="mt-6 leading-7 text-dark"><p>{address?.fullName || user?.name}</p><p>{address?.phone || user?.phone}</p><p>{address?.address}</p><p>{[address?.city, address?.state, address?.pincode].filter(Boolean).join(", ")}</p></div> : <p className="mt-6 text-dark-4">No address has been saved yet.</p>}</div>}
        {activeTab === "account-details" && <form onSubmit={saveDetails} className="rounded-xl bg-white p-7 shadow-1 sm:p-10"><h2 className="mb-6 text-xl font-semibold text-dark">Account details</h2><label className="mb-5 block">Name<input required name="name" defaultValue={user?.name || ""} className="mt-2 w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 outline-none focus:ring-2 focus:ring-blue/20" /></label><label className="mb-5 block">Email<input disabled value={user?.email || ""} className="mt-2 w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 text-dark-4" /></label><label className="mb-6 block">Phone<input name="phone" defaultValue={user?.phone || ""} className="mt-2 w-full rounded-md border border-gray-3 bg-gray-1 px-5 py-2.5 outline-none focus:ring-2 focus:ring-blue/20" /></label><button type="submit" className="rounded-md bg-blue px-7 py-3 text-white">Save changes</button></form>}
      </div>
    </div></div></section>
    <AddressModal isOpen={addressModal} closeModal={() => setAddressModal(false)} onSaved={loadProfile} />
  </>;
};

export default MyAccount;
