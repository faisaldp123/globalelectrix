import Contact from "@/components/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact All India Boards | Customer Support & TV Parts Inquiry",
  description: "Contact All India Boards for LED LCD TV motherboard inquiries, bulk orders, and customer support. We are here to help you with all TV spare parts needs.",
  // other metadata
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
