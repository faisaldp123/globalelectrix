import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Secure Checkout | All India Boards",
  description: "Complete your order securely at All India Boards. Safe payment gateway and fast shipping across India for LED LCD TV spare parts.",
  // other metadata
};

const CheckoutPage = () => {
  return (
    <main>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
