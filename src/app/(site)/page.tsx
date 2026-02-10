import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All India Boards – India’s Trusted LED TV Parts Store",
  description: "All India Boards is your trusted online store for LED TV motherboards, LCD panels, electronic spare parts, and accessories across India. Shop high-quality products at affordable prices with fast delivery, secure checkout, and reliable customer support.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
