import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Your Cart | All India Boards",
  description: "Review your selected LED LCD TV motherboards and spare parts before checkout. Secure and fast ordering at All India Boards.",
  // other metadata
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
