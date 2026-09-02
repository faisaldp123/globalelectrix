import React from "react";
import MailSuccess from "@/components/MailSuccess";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Success | All India Boards",
  description: "Your order has been placed successfully.",
};

const MailSuccessPage = () => {
  return (
    <main>
      <MailSuccess />
    </main>
  );
};

export default MailSuccessPage;