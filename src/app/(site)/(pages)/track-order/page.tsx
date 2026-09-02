import React from "react";
import TrackOrder from "@/components/TrackOrder";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track My Order | All India Boards",
  description:
    "Track your All India Boards order and check shipment status, courier details and delivery information.",
};

const TrackOrderPage = () => {
  return (
    <main>
      <TrackOrder />
    </main>
  );
};

export default TrackOrderPage;