"use client";

import { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Link from "next/link";

export default function BestSeller() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || "https://all-india-boards-admin-backend.onrender.com/api";
    fetch(`${url}/products?bestSeller=true`)
      .then((r) => r.json())
      .then((d) =>
        setProducts(
          (d.products || []).map((item: any) => {
            const images = Array.isArray(item.images)
              ? item.images.filter((image: unknown) => typeof image === "string" && image.trim())
              : [];
            const productImages = images.length ? images : ["/images/hero/new-01.png"];

            return {
              ...item,
              id: item.id || item._id,
              title: item.title || item.name || "Product",
              discountedPrice: item.discountedPrice ?? item.price ?? 0,
              reviews: item.reviews ?? item.reviewCount ?? 0,
              imgs: {
                thumbnails: productImages,
                previews: productImages,
              },
            };
          })
        )
      )
      .catch(console.error);
  }, []);
  return <section className="overflow-hidden"><div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0"><div className="mb-10"><span className="font-medium text-dark">This Month</span><h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Best Sellers</h2></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">{products.map((item) => <SingleItem item={item} key={item._id} />)}</div><div className="text-center mt-12.5"><Link href="/shop-with-sidebar" className="inline-flex font-medium text-custom-sm py-3 px-7 rounded-md border">View All</Link></div></div></section>;
}
