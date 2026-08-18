"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css/pagination";
import "swiper/css";

const fallback = [{ title: "All India Boards", subtitle: "Quality television boards and components", image: "/images/hero/new-01.png", href: "/shop-with-sidebar" }];
export default function HeroCarousel() {
  const [slides, setSlides] = useState(fallback);
  useEffect(() => { fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://all-india-boards-admin-backend.onrender.com/api"}/home-content`).then((r) => r.json()).then((data) => data.heroSlides?.length && setSlides(data.heroSlides)).catch(() => {}); }, []);
  return <Swiper spaceBetween={30} centeredSlides autoplay={{ delay: 3500, disableOnInteraction: false }} pagination={{ clickable: true }} modules={[Autoplay, Pagination]} className="hero-carousel">{slides.map((slide, index) => <SwiperSlide key={slide._id || index}><div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row"><div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5"><h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">{slide.title}</h1><p>{slide.subtitle}</p><a href={slide.href || "/shop-with-sidebar"} className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 hover:bg-blue mt-10">Shop Now</a></div>{slide.image && <img src={slide.image} alt={slide.title || "Banner"} className="max-w-[45%] object-contain" />}</div></SwiperSlide>)}</Swiper>;
}
