"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Order {
  _id: string;
  orderStatus?: string;
  trackingId?: string;
  courierName?: string;
  trackingUrl?: string;
  trackingStatus?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://all-india-boards-admin-backend.onrender.com/api";

const MailSuccess = () => {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("userToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${API_URL}/orders/${encodeURIComponent(orderId)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          throw new Error("Unable to fetch order");
        }

        const data = await res.json();

        setOrder(data);
      } catch (error) {
        console.error("SUCCESS PAGE ORDER ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const trackingAvailable = Boolean(
    order?.trackingId
  );

  return (
    <>
      <Breadcrumb
        title="Order Success"
        pages={["Order Success"]}
      />

      <section className="overflow-hidden bg-gray-2 py-12 sm:py-16 lg:py-20">
        <div className="mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="rounded-xl bg-white px-4 py-10 shadow-1 sm:px-8 sm:py-15 lg:px-12 lg:py-20">

            <div className="mx-auto max-w-[700px] text-center">

              {/* SUCCESS ICON */}

              <div className="mb-6 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-green-600"
                  >
                    <path
                      d="M20 6L9 17L4 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="mb-5 text-3xl font-bold text-blue sm:text-4xl lg:text-[45px]">
                Order Placed Successfully!
              </h2>

              <h3 className="mb-3 text-xl font-medium text-dark sm:text-2xl">
                Thank you for your order
              </h3>

              <p className="mx-auto mb-8 max-w-[560px] text-gray-600">
                Your order has been received successfully. We will
                process your order and keep you updated about its
                delivery.
              </p>

              {/* ORDER INFO */}

              {loading ? (
                <div className="mb-8 rounded-lg border border-gray-200 px-5 py-6">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-blue" />

                  <p className="mt-3 text-sm text-gray-500">
                    Loading your order details...
                  </p>
                </div>
              ) : order ? (
                <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 text-left">

                  <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-500">
                      Order ID
                    </span>

                    <span className="break-all font-semibold text-dark">
                      #{order._id}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-500">
                      Order Status
                    </span>

                    <span className="font-medium text-blue">
                      {order.orderStatus || "Pending"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-gray-500">
                      AWB / Tracking ID
                    </span>

                    <span className="font-medium text-dark">
                      {order.trackingId ||
                        "Available after shipping"}
                    </span>
                  </div>

                </div>
              ) : orderId ? (
                <div className="mb-8 rounded-lg border border-gray-200 px-5 py-5">
                  <p className="text-sm text-gray-600">
                    Order #{orderId} has been placed successfully.
                  </p>
                </div>
              ) : null}

              {/* TRACKING MESSAGE */}

              {!trackingAvailable && (
                <div className="mb-8 rounded-lg bg-blue-50 px-5 py-4">
                  <p className="text-sm leading-6 text-gray-700">
                    Your tracking details will become available once
                    your order has been shipped and a courier has
                    been assigned.
                  </p>
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">

                <Link
                  href={
                    orderId
                      ? `/track-order?orderId=${encodeURIComponent(
                          orderId
                        )}`
                      : "/track-order"
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue px-6 py-3 font-medium text-white transition hover:bg-blue-dark sm:w-auto"
                >
                  Track My Order
                </Link>

                {trackingAvailable &&
                  order?.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center rounded-md border border-blue px-6 py-3 font-medium text-blue transition hover:bg-blue hover:text-white sm:w-auto"
                    >
                      Track Shipment
                    </a>
                  )}

                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-6 py-3 font-medium text-dark transition hover:bg-gray-100 sm:w-auto"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default MailSuccess;