import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product | Global Electrix",
  description: "Product details",
};

export default function ProductPage() {
  return <ShopDetails />;
}
