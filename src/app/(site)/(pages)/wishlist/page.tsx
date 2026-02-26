import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Wishlist | Save TV Spare Parts | All India Boards",
  description: "View and manage your saved LED LCD TV motherboards and spare parts wishlist at All India Boards.",
  // other metadata
};

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
