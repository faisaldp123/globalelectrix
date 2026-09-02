"use client";

import React, { useEffect, useMemo, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ProductItem {
  _id?: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface Order {
  _id: string;
  products: ProductItem[];
  totalPrice: number;
  shippingAddress?: ShippingAddress;
  orderStatus: string;
  paymentMethod?: string;
  paymentStatus?: string;
  trackingId?: string;
  courierName?: string;
  trackingUrl?: string;
  trackingStatus?: string;
  estimatedDelivery?: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://all-india-boards-admin-backend.onrender.com/api";

const TrackOrder = () => {
  const searchParams = useSearchParams();

  const initialOrderId = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const fetchOrder = async (id: string) => {
    const cleanId = id.trim();

    if (!cleanId) {
      setError("Please enter your Order ID.");
      setOrder(null);
      setSearched(true);
      return;
    }

    const token = localStorage.getItem("userToken");

    if (!token) {
      setError("Please sign in to track your order.");
      setOrder(null);
      setSearched(true);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const response = await fetch(
        `${API_URL}/orders/${encodeURIComponent(cleanId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to find this order."
        );
      }

      setOrder(data);
    } catch (err: any) {
      setOrder(null);
      setError(
        err?.message ||
          "Something went wrong while tracking your order."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchOrder(orderId);
  };

  const statusSteps = useMemo(() => {
    const status = order?.orderStatus || "Pending";

    const cancelled = status === "Cancelled";

    if (cancelled) {
      return [
        {
          title: "Order Placed",
          description: "Your order was received.",
          completed: true,
        },
        {
          title: "Cancelled",
          description: "This order has been cancelled.",
          completed: true,
          cancelled: true,
        },
      ];
    }

    const statusOrder = [
      "Pending",
      "Packed",
      "Shipped",
      "Delivered",
    ];

    const currentIndex = statusOrder.indexOf(status);

    return [
      {
        title: "Order Placed",
        description: "Your order has been received.",
        completed: currentIndex >= 0,
      },
      {
        title: "Order Confirmed",
        description: "Your order is being prepared.",
        completed: currentIndex >= 1,
      },
      {
        title: "Shipped",
        description: "Your order has been handed to the courier.",
        completed: currentIndex >= 2,
      },
      {
        title: "Delivered",
        description: "Your order has been delivered.",
        completed: currentIndex >= 3,
      },
    ];
  }, [order]);

  const formatDate = (date?: string) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount?: number) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const getStatusLabel = () => {
    if (!order) return "";

    if (order.orderStatus === "Pending") {
      return "Order Confirmed";
    }

    if (order.orderStatus === "Packed") {
      return "Being Prepared";
    }

    if (order.orderStatus === "Shipped") {
      return order.trackingStatus || "In Transit";
    }

    if (order.orderStatus === "Delivered") {
      return "Delivered";
    }

    if (order.orderStatus === "Cancelled") {
      return "Cancelled";
    }

    return order.orderStatus;
  };

  return (
    <>
      <Breadcrumb
        title="Track My Order"
        pages={["Track My Order"]}
      />

      <section className="overflow-hidden bg-gray-2 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">

          {/* =========================================
              SEARCH BOX
          ========================================= */}

          <div className="mx-auto mb-8 max-w-[760px]">
            <div className="rounded-xl bg-white p-5 shadow-1 sm:p-8">

              <div className="mb-6 text-center">
                <h1 className="mb-3 text-2xl font-bold text-dark sm:text-3xl">
                  Track Your Order
                </h1>

                <p className="mx-auto max-w-[570px] text-sm leading-6 text-gray-500 sm:text-base">
                  Enter your Order ID below to check your order
                  status, shipment details and delivery information.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-3 sm:flex-row">

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="Enter your Order ID"
                      className="h-12 w-full rounded-md border border-gray-3 bg-gray-1 px-4 text-dark outline-none transition focus:border-blue focus:bg-white focus:ring-2 focus:ring-blue/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 rounded-md bg-blue px-7 font-medium text-white transition duration-200 hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Tracking..." : "Track Order"}
                  </button>

                </div>
              </form>

              {error && (
                <div className="mt-5 rounded-md border border-red-100 bg-red-50 px-4 py-3">
                  <p className="text-sm text-red-600">
                    {error}
                  </p>
                </div>
              )}

            </div>
          </div>

          {/* =========================================
              LOADING
          ========================================= */}

          {loading && (
            <div className="mx-auto max-w-[900px]">
              <div className="rounded-xl bg-white p-8 text-center shadow-1">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue" />

                <p className="text-gray-500">
                  Fetching your order details...
                </p>
              </div>
            </div>
          )}

          {/* =========================================
              NO RESULT
          ========================================= */}

          {!loading && searched && !order && !error && (
            <div className="mx-auto max-w-[760px] rounded-xl bg-white p-8 text-center shadow-1">
              <h3 className="mb-2 text-xl font-semibold text-dark">
                Order not found
              </h3>

              <p className="text-gray-500">
                Please check your Order ID and try again.
              </p>
            </div>
          )}

          {/* =========================================
              ORDER DETAILS
          ========================================= */}

          {!loading && order && (
            <div className="mx-auto max-w-[1000px] space-y-6">

              {/* ORDER HEADER */}

              <div className="rounded-xl bg-white p-5 shadow-1 sm:p-7">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="mb-1 text-sm text-gray-500">
                      Order ID
                    </p>

                    <h2 className="break-all text-xl font-bold text-dark sm:text-2xl">
                      #{order._id}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="self-start sm:self-center">
                    <span
                      className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                        order.orderStatus === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.orderStatus === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-50 text-blue"
                      }`}
                    >
                      {getStatusLabel()}
                    </span>
                  </div>

                </div>
              </div>

              {/* TRACKING INFORMATION */}

              <div className="rounded-xl bg-white p-5 shadow-1 sm:p-7">

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-dark">
                    Shipment Details
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Current delivery information for your order.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="mb-1 text-xs text-gray-500">
                      Courier
                    </p>

                    <p className="font-semibold text-dark">
                      {order.courierName || "Not assigned yet"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="mb-1 text-xs text-gray-500">
                      AWB / Tracking ID
                    </p>

                    <p className="break-all font-semibold text-dark">
                      {order.trackingId || "Not available yet"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="mb-1 text-xs text-gray-500">
                      Shipment Status
                    </p>

                    <p className="font-semibold text-dark">
                      {order.trackingStatus || "Not Shipped"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <p className="mb-1 text-xs text-gray-500">
                      Estimated Delivery
                    </p>

                    <p className="font-semibold text-dark">
                      {order.estimatedDelivery
                        ? formatDate(order.estimatedDelivery)
                        : "Will be updated"}
                    </p>
                  </div>

                </div>

                {/* EXTERNAL TRACKING */}

                {order.trackingId && order.trackingUrl && (
                  <div className="mt-6">
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-md bg-blue px-6 py-3 font-medium text-white transition hover:bg-blue-dark sm:w-auto"
                    >
                      Track Shipment
                    </a>
                  </div>
                )}

                {!order.trackingId && (
                  <div className="mt-6 rounded-lg bg-blue-50 px-4 py-4">
                    <p className="text-sm leading-6 text-gray-700">
                      Your shipment tracking information will appear
                      here once your order has been shipped and a
                      courier has been assigned.
                    </p>
                  </div>
                )}

              </div>

              {/* =========================================
                  ORDER PROGRESS
              ========================================= */}

              <div className="rounded-xl bg-white p-5 shadow-1 sm:p-7">

                <h3 className="mb-8 text-xl font-semibold text-dark">
                  Order Progress
                </h3>

                <div className="relative">

                  {statusSteps.map((step, index) => (
                    <div
                      key={step.title}
                      className="relative flex gap-4 pb-8 last:pb-0"
                    >

                      {/* LINE */}

                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute left-[15px] top-8 h-full w-[2px] ${
                            step.completed
                              ? "bg-blue"
                              : "bg-gray-200"
                          }`}
                        />
                      )}

                      {/* ICON */}

                      <div
                        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          step.completed
                            ? step.cancelled
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-blue bg-blue text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {step.completed ? (
                          step.cancelled ? (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M6 6L18 18M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-gray-300" />
                        )}
                      </div>

                      {/* CONTENT */}

                      <div className="pt-0.5">
                        <h4
                          className={`font-semibold ${
                            step.completed
                              ? "text-dark"
                              : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          {step.description}
                        </p>
                      </div>

                    </div>
                  ))}

                </div>

              </div>

              {/* =========================================
                  ORDER ITEMS
              ========================================= */}

              <div className="rounded-xl bg-white shadow-1">

                <div className="border-b border-gray-200 px-5 py-5 sm:px-7">
                  <h3 className="text-xl font-semibold text-dark">
                    Order Items
                  </h3>
                </div>

                <div className="divide-y divide-gray-200">

                  {order.products?.map((item, index) => (
                    <div
                      key={
                        item.productId ||
                        item._id ||
                        index
                      }
                      className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7"
                    >
                      <div className="min-w-0">
                        <h4 className="font-medium text-dark">
                          {item.name}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="font-semibold text-dark">
                        {formatCurrency(
                          item.price * item.quantity
                        )}
                      </p>
                    </div>
                  ))}

                </div>

                <div className="border-t border-gray-200 px-5 py-5 sm:px-7">

                  <div className="flex items-center justify-between">
                    <span className="font-medium text-dark">
                      Total
                    </span>

                    <span className="text-xl font-bold text-dark">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>

                </div>

              </div>

              {/* =========================================
                  SHIPPING ADDRESS
              ========================================= */}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                <div className="rounded-xl bg-white p-5 shadow-1 sm:p-7">
                  <h3 className="mb-5 text-xl font-semibold text-dark">
                    Shipping Address
                  </h3>

                  <div className="space-y-1 text-sm leading-6 text-gray-600">
                    <p className="font-medium text-dark">
                      {order.shippingAddress?.fullName || "—"}
                    </p>

                    <p>
                      {order.shippingAddress?.address || "—"}
                    </p>

                    <p>
                      {order.shippingAddress?.city || ""}
                      {order.shippingAddress?.state
                        ? `, ${order.shippingAddress.state}`
                        : ""}
                    </p>

                    <p>
                      {order.shippingAddress?.pincode || ""}
                    </p>

                    <p className="pt-2">
                      Phone:{" "}
                      {order.shippingAddress?.phone || "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-white p-5 shadow-1 sm:p-7">
                  <h3 className="mb-5 text-xl font-semibold text-dark">
                    Payment Information
                  </h3>

                  <div className="space-y-4">

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-500">
                        Payment Method
                      </span>

                      <span className="font-medium text-dark">
                        {order.paymentMethod || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-gray-500">
                        Payment Status
                      </span>

                      <span className="font-medium text-dark">
                        {order.paymentStatus || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-gray-200 pt-4">
                      <span className="font-medium text-dark">
                        Order Total
                      </span>

                      <span className="font-bold text-dark">
                        {formatCurrency(order.totalPrice)}
                      </span>
                    </div>

                  </div>
                </div>

              </div>

              {/* BACK BUTTON */}

              <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">

                <Link
                  href="/my-orders"
                  className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-6 py-3 font-medium text-dark transition hover:bg-gray-100 sm:w-auto"
                >
                  My Orders
                </Link>

                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-md bg-blue px-6 py-3 font-medium text-white transition hover:bg-blue-dark sm:w-auto"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default TrackOrder;