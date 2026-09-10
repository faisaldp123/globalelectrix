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
  const cartItems =
    useAppSelector(selectCartItems);

  const totalPrice =
    useAppSelector(selectTotalPrice);

  const dispatch = useDispatch();
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  /* =========================================================
     HANDLE CHECKOUT
  ========================================================= */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    /* -----------------------------------------
       PREVENT DOUBLE CLICK
    ----------------------------------------- */

    if (loading) {
      return;
    }

    /* -----------------------------------------
       CHECK CART
    ----------------------------------------- */

    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      toast.error(
        "Your cart is empty"
      );

      return;
    }

    /* -----------------------------------------
       CHECK LOGIN
    ----------------------------------------- */

    const token =
      localStorage.getItem(
        "userToken"
      );

    if (!token) {
      toast.error(
        "Please sign in to place an order"
      );

      router.push(
        "/signin"
      );

      return;
    }

    try {
      setLoading(true);

      /* -----------------------------------------
         FORM DATA
      ----------------------------------------- */

      const formData =
        new FormData(
          e.currentTarget
        );

      const firstName =
        String(
          formData.get(
            "firstName"
          ) || ""
        ).trim();

      const lastName =
        String(
          formData.get(
            "lastName"
          ) || ""
        ).trim();

      const address =
        String(
          formData.get(
            "address"
          ) || ""
        ).trim();

      const town =
        String(
          formData.get(
            "town"
          ) || ""
        ).trim();

      const stateVal =
        String(
          formData.get(
            "state"
          ) || ""
        ).trim();

      const pincode =
        String(
          formData.get(
            "pincode"
          ) || ""
        ).trim();

      const phone =
        String(
          formData.get(
            "phone"
          ) || ""
        ).trim();

      const paymentMethod =
        String(
          formData.get(
            "paymentMethod"
          ) || "COD"
        ).trim();

      /* -----------------------------------------
         VALIDATE ADDRESS
      ----------------------------------------- */

      if (
        !firstName ||
        !lastName ||
        !address ||
        !town ||
        !stateVal ||
        !pincode ||
        !phone
      ) {
        toast.error(
          "Please fill in all required billing details"
        );

        return;
      }

      /* -----------------------------------------
         PINCODE
      ----------------------------------------- */

      if (
        !/^\d{6}$/.test(
          pincode
        )
      ) {
        toast.error(
          "Please enter a valid 6-digit pincode"
        );

        return;
      }

      /* -----------------------------------------
         PHONE
      ----------------------------------------- */

      const cleanPhone =
        phone.replace(
          /\D/g,
          ""
        );

      if (
        !/^\d{10}$/.test(
          cleanPhone
        )
      ) {
        toast.error(
          "Please enter a valid 10-digit phone number"
        );

        return;
      }

      /* -----------------------------------------
         SHIPPING ADDRESS
      ----------------------------------------- */

      const shippingAddress = {
        fullName:
          `${firstName} ${lastName}`.trim(),

        phone:
          cleanPhone,

        address,

        city:
          town,

        state:
          stateVal,

        pincode,
      };

      /* -----------------------------------------
         PRODUCTS
      ----------------------------------------- */

      const products =
        cartItems.map(
          (item) => ({
            productId:
              item.id,

            name:
              item.title,

            price:
              Number(
                item.discountedPrice ||
                  0
              ),

            quantity:
              Number(
                item.quantity ||
                  0
              ),
          })
        );

      /* -----------------------------------------
         PRODUCT VALIDATION
      ----------------------------------------- */

      const invalidProduct =
        products.some(
          (item) =>
            !item.productId ||
            !Number.isInteger(
              item.quantity
            ) ||
            item.quantity <= 0
        );

      if (
        invalidProduct
      ) {
        toast.error(
          "One or more cart items are invalid"
        );

        return;
      }

      /* -----------------------------------------
         API URL
      ----------------------------------------- */

      const API_URL =
        process.env
          .NEXT_PUBLIC_API_URL ||
        "https://all-india-boards-admin-backend.onrender.com/api";

      console.log(
        "Creating order..."
      );

      /* -----------------------------------------
         REQUEST TIMEOUT
      ----------------------------------------- */

      const controller =
        new AbortController();

      const timeoutId =
        window.setTimeout(
          () => {
            controller.abort();
          },
          30000
        );

      let response: Response;

      try {
        response =
          await fetch(
            `${API_URL}/orders`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  products,
                  shippingAddress,
                  paymentMethod,
                }),

              signal:
                controller.signal,

              cache:
                "no-store",
            }
          );
      } catch (error: any) {
        /* -----------------------------------------
           REQUEST TIMEOUT
        ----------------------------------------- */

        if (
          error?.name ===
          "AbortError"
        ) {
          throw new Error(
            "The server took too long to respond. Please try again."
          );
        }

        throw new Error(
          "Unable to connect to the order server. Please check your internet connection and try again."
        );
      } finally {
        window.clearTimeout(
          timeoutId
        );
      }

      /* -----------------------------------------
         READ RESPONSE
      ----------------------------------------- */

      const responseText =
        await response.text();

      let data: any = {};

      if (
        responseText
      ) {
        try {
          data =
            JSON.parse(
              responseText
            );
        } catch {
          data = {
            message:
              responseText,
          };
        }
      }

      /* -----------------------------------------
         API ERROR
      ----------------------------------------- */

      if (
        !response.ok
      ) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to place order"
        );
      }

      /* -----------------------------------------
         GET ORDER ID
      ----------------------------------------- */

      const orderId =
        data?.order?._id ||
        data?._id ||
        data?.order?.id ||
        data?.id;

      if (
        !orderId
      ) {
        console.error(
          "Order API response:",
          data
        );

        throw new Error(
          "Order was created, but the order ID was not returned by the server."
        );
      }

      console.log(
        "Order created successfully:",
        data
      );

      console.log(
        "Order ID:",
        orderId
      );

      /* -----------------------------------------
         SUCCESS
      ----------------------------------------- */

      toast.success(
        "Order placed successfully!"
      );

      /* -----------------------------------------
         CLEAR CART
         
         ONLY after successful order creation.
      ----------------------------------------- */

      dispatch(
        removeAllItemsFromCart()
      );

      /* -----------------------------------------
         SUCCESS PAGE
      ----------------------------------------- */

      router.push(
        `/mail-success?orderId=${encodeURIComponent(
          orderId
        )}`
      );
    } catch (error: any) {
      console.error(
        "CHECKOUT ERROR:",
        error
      );

      toast.error(
        error?.message ||
          "Something went wrong while placing your order."
      );
    } finally {
      /* -----------------------------------------
         ALWAYS RESET LOADING
      ----------------------------------------- */

      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb
        title="Checkout"
        pages={[
          "checkout",
        ]}
      />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">

              {/* =====================================================
                  LEFT SIDE
              ===================================================== */}

              <div className="lg:max-w-[670px] w-full">

                {/* LOGIN */}
                <Login />

                {/* BILLING */}
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
                      Other Notes
                      (optional)
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

              {/* =====================================================
                  RIGHT SIDE
              ===================================================== */}

              <div className="max-w-[455px] w-full">

                {/* =================================================
                    ORDER SUMMARY
                ================================================= */}

                <div className="bg-white shadow-1 rounded-[10px]">

                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">

                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>

                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">

                    {/* PRODUCT HEADER */}

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">

                      <h4 className="font-medium text-dark">
                        Product
                      </h4>

                      <h4 className="font-medium text-dark text-right">
                        Subtotal
                      </h4>

                    </div>

                    {/* PRODUCTS */}

                    {cartItems.map(
                      (
                        item,
                        key
                      ) => (
                        <div
                          key={`${item.id}-${key}`}
                          className="flex items-center justify-between py-5 border-b border-gray-3 gap-4"
                        >

                          <div className="min-w-0">

                            <p className="text-dark break-words">
                              {
                                item.title
                              }{" "}
                              (x
                              {
                                item.quantity
                              })
                            </p>

                          </div>

                          <div className="shrink-0">

                            <p className="text-dark text-right">

                              ₹
                              {(
                                Number(
                                  item.discountedPrice ||
                                    0
                                ) *
                                Number(
                                  item.quantity ||
                                    0
                                )
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </p>

                          </div>

                        </div>
                      )
                    )}

                    {/* SHIPPING */}

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">

                      <p className="text-dark">
                        Shipping Fee
                      </p>

                      <p className="text-dark text-right">
                        Free
                      </p>

                    </div>

                    {/* TOTAL */}

                    <div className="flex items-center justify-between pt-5">

                      <p className="font-medium text-lg text-dark">
                        Total
                      </p>

                      <p className="font-medium text-lg text-dark text-right">
                        ₹
                        {Number(
                          totalPrice ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* COUPON */}

                <Coupon />

                {/* SHIPPING METHOD */}

                <ShippingMethod />

                {/* PAYMENT METHOD */}

                <PaymentMethod />

                {/* =================================================
                    CHECKOUT BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    cartItems.length === 0
                  }
                  aria-busy={
                    loading
                  }
                  className="w-full flex items-center justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-4 disabled:cursor-not-allowed"
                >

                  {loading ? (
                    <>
                      <span
                        className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                        aria-hidden="true"
                      />

                      Processing
                      Order...
                    </>
                  ) : (
                    "Proceed to Checkout"
                  )}

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