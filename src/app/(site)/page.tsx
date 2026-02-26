import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata = {
  metadataBase: new URL("https://allindiaboards.com"),
  title: {
    default: "All India Boards | LED LCD TV Motherboards & Spare Parts",
    template: "%s | All India Boards",
  },
  description:
    "Buy genuine LED LCD TV motherboards, power supply boards, T-Con boards and spare parts online at All India Boards with fast delivery across India.",
  keywords: [
    "LED TV motherboard",
    "LCD TV spare parts",
    "TV repair parts",
    "T-Con board",
    "Power supply board",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://allindiaboards.com",
    siteName: "All India Boards",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "All India Boards - LED LCD TV Spare Parts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "All India Boards",
    description:
      "India’s trusted store for LED LCD TV motherboards and spare parts.",
    images: ["/og-home.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
