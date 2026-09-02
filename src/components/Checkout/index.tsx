"use client";

import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { useAppSelector } from "@/redux/store";
import {
  selectCartItems,
  selectTotalPrice,
  removeAllItemsFromCart,
} from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Checkout = () => {
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);

  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    // -----------------------------------------
    // CHECK CART
    // -----------------------------------------
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // -----------------------------------------
    // CHECK LOGIN
    // -----------------------------------------
    const token = localStorage.getItem("userToken");

    if (!token) {
      toast.error("Please sign in to place an order");
      router.push("/signin");
      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------
      // GET FORM DATA
      // -----------------------------------------
      const formData = new FormData(e.currentTarget);

      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const address = formData.get("address") as string;
      const town = formData.get("town") as string;
      const stateVal = formData.get("state") as string;
      const pincode = formData.get("pincode") as string;
      const phone = formData.get("phone") as string;

      const paymentMethod =
        (formData.get("paymentMethod") as string) || "COD";

      // -----------------------------------------
      // VALIDATE BILLING DETAILS
      // -----------------------------------------
      if (
        !firstName ||
        !lastName ||
        !address ||
        !town ||
        !stateVal ||
        !pincode ||
        !phone
      ) {
        toast.error("Please fill in all required billing details");
        setLoading(false);
        return;
      }

      // -----------------------------------------
      // SHIPPING ADDRESS
      // -----------------------------------------
      const shippingAddress = {
        fullName: `${firstName} ${lastName}`,
        phone,
        address,
        city: town,
        state: stateVal,
        pincode,
      };

      // -----------------------------------------
      // ORDER PRODUCTS
      // -----------------------------------------
      const products = cartItems.map((item) => ({
        productId: item.id,
        name: item.title,
        price: item.discountedPrice,
        quantity: item.quantity,
      }));

      // -----------------------------------------
      // API URL
      // -----------------------------------------
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://all-india-boards-admin-backend.onrender.com/api";

      // -----------------------------------------
      // CREATE ORDER
      // -----------------------------------------
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          products,
          shippingAddress,
          paymentMethod,
        }),
      });

      // -----------------------------------------
      // READ RESPONSE
      // -----------------------------------------
      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to place order"
        );
      }

      // -----------------------------------------
      // IMPORTANT:
      // BACKEND MUST RETURN THE CREATED ORDER
      // WITH ITS _id
      // -----------------------------------------
      if (!data?._id) {
        console.error("Order created but order ID was not returned:", data);

        throw new Error(
          "Order was created, but the order ID could not be retrieved."
        );
      }

      console.log("Order created successfully:", data);
      console.log("New Order ID:", data._id);

      // -----------------------------------------
      // SUCCESS
      // -----------------------------------------
      toast.success("Order placed successfully!");

      // Clear cart only after successful order creation
      dispatch(removeAllItemsFromCart());

      // -----------------------------------------
      // IMPORTANT:
      // SEND ORDER ID TO MAIL SUCCESS PAGE
      // -----------------------------------------
      router.push(
        `/mail-success?orderId=${encodeURIComponent(data._id)}`
      );
    } catch (err: any) {
      console.error("CHECKOUT ERROR:", err);

      toast.error(
        err?.message ||
          "Something went wrong during checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb
        title={"Checkout"}
        pages={["checkout"]}
      />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">

              {/* =========================================
                  CHECKOUT LEFT
              ========================================= */}
              <div className="lg:max-w-[670px] w-full">

                {/* LOGIN */}
                <Login />

                {/* BILLING DETAILS */}
                <Billing />

                {/* SHIPPING */}
                <Shipping />

                {/* OTHER NOTES */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label
                      htmlFor="notes"
                      className="block mb-2.5"
                    >
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. special notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>
              </div>

              {/* =========================================
                  CHECKOUT RIGHT
              ========================================= */}
              <div className="max-w-[455px] w-full">

                {/* =========================================
                    ORDER SUMMARY
                ========================================= */}
                <div className="bg-white shadow-1 rounded-[10px]">

                  {/* HEADER */}
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">

                    {/* PRODUCT HEADER */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">
                          Product
                        </h4>
                      </div>

                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* =========================================
                        PRODUCTS
                    ========================================= */}
                    {cartItems.map((item, key) => (
                      <div
                        key={`${item.id}-${key}`}
                        className="flex items-center justify-between py-5 border-b border-gray-3 gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-dark break-words">
                            {item.title} (x{item.quantity})
                          </p>
                        </div>

                        <div className="shrink-0">
                          <p className="text-dark text-right">
                            ₹
                            {(
                              Number(item.discountedPrice || 0) *
                              Number(item.quantity || 0)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* =========================================
                        SHIPPING
                    ========================================= */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <p className="text-dark">
                          Shipping Fee
                        </p>
                      </div>

                      <div>
                        <p className="text-dark text-right">
                          Free
                        </p>
                      </div>
                    </div>

                    {/* =========================================
                        TOTAL
                    ========================================= */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">
                          Total
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          ₹
                          {Number(totalPrice || 0).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================
                    COUPON
                ========================================= */}
                <Coupon />

                {/* =========================================
                    SHIPPING METHOD
                ========================================= */}
                <ShippingMethod />

                {/* =========================================
                    PAYMENT METHOD
                ========================================= */}
                <PaymentMethod />

                {/* =========================================
                    CHECKOUT BUTTON
                ========================================= */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
                >
                  {loading
                    ? "Processing Order..."
                    : "Process to Checkout"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;