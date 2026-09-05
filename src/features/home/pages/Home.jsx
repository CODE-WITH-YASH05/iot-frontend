import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import ImageWithFallback from "../../../components/ImageWithFallback";
import { useProducts } from "../../products/hooks/useProducts";
import { mapProduct } from "../../products/utils/productMapper";
import { useHome } from "../hooks/useHome";

// ==========================================================
// ANIMATIONS
// ==========================================================

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

// ==========================================================
// DEFAULT FALLBACK DATA
// ==========================================================

const DEFAULT_ADVENTURES = [
  {
    id: "learn",
    icon: "auto_stories",
    eyebrow: "Curious minds welcome",
    title: "Learn",
    description:
      "Friendly science lessons that turn big ideas into small, satisfying discoveries.",
    color: "from-teal-400 to-teal-600",
    button_text: "Explore lessons",
    button_link: "#learn",
    is_active: true,
  },
  {
    id: "build",
    icon: "handyman",
    eyebrow: "Make it real",
    title: "Build",
    description:
      "Follow guided projects and turn everyday materials into clever connected things.",
    color: "from-violet-500 to-[#6D3CFF]",
    button_text: "Start building",
    button_link: "#projects",
    is_active: true,
  },
  {
    id: "shop",
    icon: "sensors",
    eyebrow: "Useful technology",
    title: "Shop",
    description:
      "Find reliable IoT devices and kits for your home, school, garden, and more.",
    color: "from-pink-500 to-[#EC3BB8]",
    button_text: "Visit IoT shop",
    button_link: "/shop",
    is_active: true,
  },
];

const DEFAULT_PROJECTS = [
  {
    id: "smart-plant",
    title: "Smart Plant",
    description: "Let your plant tell you when it is thirsty.",
    tag: "Beginner · 35 min",
    icon: "potted_plant",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
  {
    id: "temperature-monitor",
    title: "Temperature Monitor",
    description: "Build a tiny station that watches your room climate.",
    tag: "Beginner · 45 min",
    icon: "device_thermostat",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
  {
    id: "motion-alarm",
    title: "Motion Alarm",
    description: "Use a sensor to create a gentle safety alert.",
    tag: "Explorer · 55 min",
    icon: "sensors",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
];

const DEFAULT_PRODUCT_USES = [
  {
    id: "smart-home",
    icon: "home",
    title: "Smart Home",
    description:
      "Control the comfort and care of your home from one simple place.",
    feature: "Lights · climate · routines",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
  {
    id: "learning-kits",
    icon: "school",
    title: "Learning Kits",
    description:
      "Give students the components and guides to turn a lesson into a working project.",
    feature: "Sensors · boards · guides",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
  {
    id: "smart-garden",
    icon: "yard",
    title: "Smart Garden",
    description:
      "Monitor soil and weather conditions to make plant care more thoughtful.",
    feature: "Soil · water · weather",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
];

const DEFAULT_JOURNEY = [
  {
    id: "discover",
    number: "01",
    title: "Discover how things work",
    description:
      "Explore sensors, electronics, networking, and data through simple lessons and real examples.",
    icon: "science",
    image:
      "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
  {
    id: "build",
    number: "02",
    title: "Build useful projects",
    description:
      "Connect components, test ideas, collect data, and create smart solutions for everyday problems.",
    icon: "handyman",
    image:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
  {
    id: "program",
    number: "03",
    title: "Program your way",
    description:
      "Begin with visual GUI blocks, then move to CLI programming when you are ready for more control.",
    icon: "code",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
  {
    id: "innovator",
    number: "04",
    title: "Grow into an innovator",
    description:
      "Build skills for robotics, automation, AI, portfolios, competitions, and future technology careers.",
    icon: "rocket_launch",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=900&q=85",
    is_active: true,
  },
];

// ==========================================================
// IMAGE HELPER
// ==========================================================

const getImageUrl = (item) => {
  if (!item) return "";

  // Check for image_display (from serializer)
  if (item.image_display) return item.image_display;

  // Check for image_url
  if (item.image_url) return item.image_url;

  // Check for image field (could be URL or path)
  if (item.image) return item.image;

  // Fallback to thumbnail
  if (item.thumbnail) return item.thumbnail;

  return "";
};

// ==========================================================
// HERO BANNER
// ==========================================================

const HeroBanner = ({ banners, isLoading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners]);

  useEffect(() => {
    if (currentSlide >= banners.length) {
      setCurrentSlide(0);
    }
  }, [banners.length, currentSlide]);

  if (isLoading) {
    return (
      <div className="relative mx-auto min-h-[470px] w-full max-w-[560px]">
        <div className="absolute inset-8 rotate-3 rounded-[3rem] bg-gradient-to-br from-violet-500 via-[#8b5cf6] to-pink-500 shadow-2xl" />
        <div className="absolute inset-7 -rotate-2 animate-pulse overflow-hidden rounded-[2.7rem] bg-slate-900 shadow-2xl">
          <div className="h-full w-full bg-slate-800" />
        </div>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="relative mx-auto min-h-[470px] w-full max-w-[560px]">
        <div className="absolute inset-8 rotate-3 rounded-[3rem] bg-gradient-to-br from-violet-500 via-[#8b5cf6] to-pink-500 shadow-2xl" />
        <div className="absolute inset-7 -rotate-2 overflow-hidden rounded-[2.7rem] bg-slate-900 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1100&q=85"
            alt="IoT technology"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-violet-600/20" />
          <div className="absolute bottom-7 left-7 right-7 rounded-2xl bg-white/90 p-4 backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-widest text-[#14B8A6]">
              Discover
            </p>
            <p className="mt-1 font-black text-slate-900">
              Build smarter things
            </p>
          </div>
        </div>
      </div>
    );
  }

  const banner = banners[currentSlide];

  return (
    <div className="relative mx-auto min-h-[470px] w-full max-w-[560px]">
      <div className="absolute inset-8 rotate-3 rounded-[3rem] bg-gradient-to-br from-violet-500 via-[#8b5cf6] to-pink-500 shadow-2xl shadow-violet-300/40" />
      <div className="absolute inset-7 -rotate-2 overflow-hidden rounded-[2.7rem] bg-slate-900 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={banner.id || currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.7 }}
            className="h-full w-full"
          >
            <img
              src={getImageUrl(banner)}
              alt={banner.title || "Home banner"}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="rounded-2xl bg-white/95 p-4 backdrop-blur">
            {banner.eyebrow && (
              <p className="text-xs font-bold uppercase tracking-widest text-[#14B8A6]">
                {banner.eyebrow}
              </p>
            )}
            <p className="mt-1 font-black text-slate-900">
              {banner.title || "Discover IoT"}
            </p>
            {banner.description && (
              <p className="mt-1 text-sm text-slate-600">
                {banner.description}
              </p>
            )}
            {banner.button_text && banner.button_link && (
              <Link
                to={banner.button_link}
                className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#6D3CFF] px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                {banner.button_text}
                <span className="material-symbols-outlined text-base">
                  arrow_forward
                </span>
              </Link>
            )}
          </div>
        </div>

        {banners.length > 1 && (
          <div className="absolute right-4 top-4 flex gap-1.5">
            {banners.map((item, index) => (
              <button
                key={item.id || index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================
// PRODUCT CARD
// ==========================================================

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-xl">
        <div className="relative flex h-48 items-center justify-center bg-gray-50 p-4">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
            fallbackSrc="/placeholder-image.png"
          />
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="absolute left-2 top-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-2.5 py-1 text-xs font-bold text-white">
              {Math.round((1 - product.discountPrice / product.price) * 100)}%
              OFF
            </span>
          )}
          {product.inStock && (
            <span className="absolute right-2 top-2 rounded-full bg-green-500 px-2.5 py-1 text-xs font-bold text-white">
              In Stock
            </span>
          )}
        </div>
        <div className="p-4">
          <div className="mb-1 flex items-center gap-1">
            <span className="text-xs text-yellow-500">⭐</span>
            <span className="text-xs text-gray-500">
              {product.rating || 4.5}
            </span>
            <span className="text-xs text-gray-400">
              ({product.reviews || 0})
            </span>
          </div>
          <h3 className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
            {product.name}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
            {product.category}
          </p>
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
            <div>
              <span className="text-base font-black text-indigo-600">
                ₹{product.price?.toLocaleString() || 0}
              </span>
              {product.originalPrice > product.price && (
                <span className="ml-1.5 text-xs text-gray-400 line-through">
                  ₹{product.originalPrice?.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 text-sm font-semibold text-indigo-600">
              View
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ==========================================================
// MAIN HOME
// ==========================================================

export default function Home() {
  // ========================================================
  // PUBLIC HOME DATA
  // ========================================================

  const {
    home: homeConfig,
    loading: configLoading,
    error: configError,
    isActive,
    refetch,
  } = useHome();

  // ========================================================
  // PRODUCTS
  // ========================================================

  const { products: apiProducts, isLoading: productsLoading } = useProducts();

  // ========================================================
  // ACTIVE DATA - Filter only active items
  // ========================================================

  const banners = useMemo(() => {
    if (!Array.isArray(homeConfig?.banners)) return [];
    return homeConfig.banners.filter((item) => item.is_active !== false);
  }, [homeConfig]);

  const adventures = useMemo(() => {
    const data = homeConfig?.adventures;
    if (Array.isArray(data) && data.length > 0) {
      return data.filter((item) => item.is_active !== false);
    }
    return DEFAULT_ADVENTURES;
  }, [homeConfig]);

  const projects = useMemo(() => {
    const data = homeConfig?.projects;
    if (Array.isArray(data) && data.length > 0) {
      return data.filter((item) => item.is_active !== false);
    }
    return DEFAULT_PROJECTS;
  }, [homeConfig]);

  const productUses = useMemo(() => {
    const data = homeConfig?.product_uses;
    if (Array.isArray(data) && data.length > 0) {
      return data.filter((item) => item.is_active !== false);
    }
    return DEFAULT_PRODUCT_USES;
  }, [homeConfig]);

  const journeyItems = useMemo(() => {
    const data = homeConfig?.journey_items;
    if (Array.isArray(data) && data.length > 0) {
      return data.filter((item) => item.is_active !== false);
    }
    return DEFAULT_JOURNEY;
  }, [homeConfig]);

  // ========================================================
  // PRODUCTS MAP
  // ========================================================

  const allProducts = useMemo(() => {
    if (!Array.isArray(apiProducts)) return [];
    return apiProducts.map(mapProduct).filter(Boolean);
  }, [apiProducts]);

  const featuredProducts = useMemo(() => {
    const count = Number(homeConfig?.products_count) || 4;
    return allProducts.slice(0, count);
  }, [allProducts, homeConfig]);

  // ========================================================
  // CHECK IF HOME IS INACTIVE - FIRST CHECK
  // ========================================================

  // If home is explicitly inactive, show Under Construction
  if (homeConfig && homeConfig.is_active === false) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-5xl text-gray-300">
                construction
              </span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">
              Page Under Construction
            </h2>
            <p className="text-gray-500">
              We're working on something amazing. Please check back soon!
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Browse Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ========================================================
  // LOADING
  // ========================================================

  if (configLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F8FAFF]">
        <Navbar />
        <div className="flex flex-grow items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="animate-pulse text-gray-500">Loading home page...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ========================================================
  // RENDER - Only if home is active
  // ========================================================

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8FAFF] text-[#111827]">
      <Navbar />

      <main>
        {/* ======================================================
            HERO SECTION
        ====================================================== */}

        {homeConfig?.hero_section_active !== false && (
          <section className="relative overflow-hidden pb-20 pt-12 lg:pb-24 lg:pt-14">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -top-32 left-[8%] h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
              <div className="absolute right-[4%] top-24 h-96 w-96 rounded-full bg-pink-100/70 blur-3xl" />
              <svg
                className="absolute inset-0 h-full w-full opacity-40"
                viewBox="0 0 1440 700"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M-30 495C154 395 194 586 364 486S633 335 754 440s202 99 337 3 229-64 378-145"
                  stroke="#6D3CFF"
                  strokeWidth="1.5"
                  strokeDasharray="6 10"
                />
                <circle cx="364" cy="486" r="7" fill="#14B8A6" />
                <circle cx="754" cy="440" r="7" fill="#FBBF24" />
                <circle cx="1091" cy="443" r="7" fill="#EC3BB8" />
              </svg>
            </div>

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
              <motion.div
                initial="hidden"
                animate="visible"
                transition={{ staggerChildren: 0.12 }}
                className="max-w-2xl"
              >
                <motion.div
                  variants={fadeUp}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-2 text-sm font-bold text-violet-700 shadow-sm"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#14B8A6]" />
                  {homeConfig?.hero_badge_text || "Vigyantra Discovery Lab"}
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mt-7 text-5xl font-black leading-[.95] tracking-[-.055em] sm:text-6xl lg:text-7xl"
                  dangerouslySetInnerHTML={{
                    __html:
                      homeConfig?.hero_title ||
                      "Learn Science.<br />Build Smart Things.",
                  }}
                />

                <motion.p
                  variants={fadeUp}
                  className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl"
                >
                  {homeConfig?.hero_subtitle ||
                    "Explore easy science lessons, build exciting IoT projects, and discover devices that make everyday life smarter."}
                </motion.p>

                <motion.div
                  variants={fadeUp}
                  className="mt-9 flex flex-wrap gap-3"
                >
                  <a
                    href={homeConfig?.cta_primary_link || "#learn"}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#6D3CFF] px-6 py-3.5 font-bold text-white shadow-lg shadow-violet-300/60 transition hover:-translate-y-0.5 hover:bg-violet-700"
                  >
                    {homeConfig?.cta_primary_text || "Start Learning"}
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </a>

                  <a
                    href={homeConfig?.cta_secondary_link || "#projects"}
                    className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-white px-6 py-3.5 font-bold text-violet-700 transition hover:-translate-y-0.5 hover:border-violet-400"
                  >
                    {homeConfig?.cta_secondary_text || "Explore Projects"}
                  </a>

                  <Link
                    to={homeConfig?.cta_tertiary_link || "/shop"}
                    className="inline-flex items-center gap-2 rounded-2xl border border-pink-200 bg-pink-50 px-6 py-3.5 font-bold text-pink-600 transition hover:-translate-y-0.5 hover:bg-pink-100"
                  >
                    {homeConfig?.cta_tertiary_text || "Shop IoT Devices"}
                  </Link>
                </motion.div>
              </motion.div>

              <HeroBanner banners={banners} isLoading={configLoading} />
            </div>
          </section>
        )}

        {/* ======================================================
            ADVENTURES SECTION
        ====================================================== */}

        {homeConfig?.adventures_section_active !== false && (
          <section id="learn" className="scroll-mt-20 py-20">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[.18em] text-[#14B8A6]">
                  {homeConfig?.adventures_subtitle || "Choose your adventure"}
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  {homeConfig?.adventures_title ||
                    "There's more than one way to discover."}
                </h2>
              </div>

              <div className="mt-11 grid gap-6 md:grid-cols-3">
                {adventures.map((item, index) => (
                  <motion.div
                    key={item.id || `${item.title}-${index}`}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    variants={fadeUp}
                    className="group rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${
                        item.color || "from-violet-500 to-purple-600"
                      } text-white shadow-lg`}
                    >
                      <span className="material-symbols-outlined text-3xl">
                        {item.icon || "auto_stories"}
                      </span>
                    </div>
                    <p className="mt-7 text-xs font-bold uppercase tracking-widest text-slate-400">
                      {item.eyebrow}
                    </p>
                    <h3 className="mt-2 text-2xl font-black">{item.title}</h3>
                    <p className="mt-3 leading-relaxed text-slate-500">
                      {item.description || item.text}
                    </p>
                    {(item.button_link || item.href) && (
                      <Link
                        to={item.button_link || item.href}
                        className="mt-7 inline-flex items-center gap-1 font-bold text-violet-700"
                      >
                        {item.button_text || item.action || "Explore"}
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            LEARNING JOURNEY SECTION
        ====================================================== */}

        {homeConfig?.journey_section_active !== false && (
          <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="max-w-3xl"
              >
                <p className="text-sm font-bold uppercase tracking-[.18em] text-[#EC3BB8]">
                  {homeConfig?.journey_subtitle || "What is Vigyantra?"}
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  {homeConfig?.journey_title ||
                    "A practical path from curious learner to smart creator."}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-slate-600">
                  {homeConfig?.journey_description ||
                    "Vigyantra combines hands-on lessons, guided IoT projects, programming tools, and useful devices."}
                </p>
              </motion.div>

              <div className="mt-11 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {journeyItems.map((item, index) => (
                  <motion.article
                    key={item.id || index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    variants={fadeUp}
                    className="group overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-sm transition hover:shadow-xl"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={getImageUrl(item)}
                        alt={item.title || ""}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" />
                      <span className="absolute bottom-4 left-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
                        <span className="material-symbols-outlined text-violet-600">
                          {item.icon || "science"}
                        </span>
                      </span>
                      <span className="absolute bottom-4 right-5 text-3xl font-black text-white/90">
                        {item.number || String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-black leading-tight">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-500">
                        {item.description || item.text}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            PRODUCTS SECTION
        ====================================================== */}

        {homeConfig?.products_section_active !== false && (
          <section className="relative overflow-hidden bg-[#111827] py-20 text-white">
            <div className="absolute inset-0 opacity-20" aria-hidden="true">
              <div className="absolute -left-32 top-8 h-96 w-96 rounded-full bg-[#14B8A6] blur-3xl" />
              <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#6D3CFF] blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.18em] text-[#FBBF24]">
                    {homeConfig?.products_subtitle ||
                      "IoT devices that solve real problems"}
                  </p>
                  <h2 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
                    {homeConfig?.products_title ||
                      "Choose technology that makes everyday life easier."}
                  </h2>
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
                    {homeConfig?.products_description ||
                      "Explore reliable devices and starter kits for living, learning, growing, and staying informed."}
                  </p>
                </div>
                <Link
                  to={homeConfig?.products_cta_link || "/shop"}
                  className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 font-bold text-[#6D3CFF] transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  {homeConfig?.products_cta_text || "Explore the shop"}
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                </Link>
              </div>

              {productsLoading ? (
                <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl bg-white/5 p-4"
                    >
                      <div className="h-40 rounded-xl bg-white/10" />
                      <div className="mt-3 h-4 w-3/4 rounded bg-white/10" />
                    </div>
                  ))}
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
                  {featuredProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      variants={fadeUp}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="mt-10 text-center text-slate-400">
                  No products available yet.
                </div>
              )}
            </div>
          </section>
        )}

        {/* ======================================================
            PROJECTS SECTION
        ====================================================== */}

        {homeConfig?.projects_section_active !== false && (
          <section id="projects" className="scroll-mt-20 py-20">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[.18em] text-[#6D3CFF]">
                    {homeConfig?.projects_subtitle ||
                      "Build your first IoT project"}
                  </p>
                  <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                    {homeConfig?.projects_title ||
                      "Big curiosity. Small first steps."}
                  </h2>
                </div>
                <a
                  href={homeConfig?.projects_cta_link || "#learn"}
                  className="font-bold text-violet-700"
                >
                  {homeConfig?.projects_cta_text || "See all projects →"}
                </a>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-3">
                {projects.map((project, index) => (
                  <motion.article
                    key={project.id || index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    variants={fadeUp}
                    className="group overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(project)}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    </div>
                    <div className="p-6">
                      {(project.tag || project.level || project.duration) && (
                        <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                          {project.tag ||
                            `${project.level || ""}${project.duration ? ` · ${project.duration}` : ""}`}
                        </span>
                      )}
                      <h3 className="mt-4 text-xl font-black">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-slate-500">
                        {project.description || project.text}
                      </p>
                      {(project.button_text || project.button_link) && (
                        <Link
                          to={project.button_link || "#"}
                          className="mt-5 flex items-center gap-2 font-bold text-violet-700"
                        >
                          {project.button_text || "Build this"}
                          <span className="material-symbols-outlined text-lg">
                            arrow_forward
                          </span>
                        </Link>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            PRODUCT USES SECTION
        ====================================================== */}

        {homeConfig?.product_uses_section_active !== false && (
          <section className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[.18em] text-[#14B8A6]">
                  Real-world uses
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                  Technology for everyday life.
                </h2>
              </div>

              <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {productUses.map((item, index) => (
                  <motion.article
                    key={item.id || index}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    variants={fadeUp}
                    className="group overflow-hidden rounded-[1.8rem] border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={getImageUrl(item)}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-slate-900/20" />
                    </div>
                    <div className="p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                        <span className="material-symbols-outlined">
                          {item.icon || "devices"}
                        </span>
                      </div>
                      <h3 className="mt-4 text-xl font-black">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        {item.description || item.text}
                      </p>
                      {item.feature && (
                        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-violet-600">
                          {item.feature}
                        </p>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================
            CONTACT SECTION
        ====================================================== */}

        {homeConfig?.contact_section_active !== false && (
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 md:p-16 border border-indigo-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                    {homeConfig?.contact_title || "Ready to Go Smart?"}
                  </h2>
                  <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
                    {homeConfig?.contact_subtitle ||
                      "Join thousands of happy customers who transformed their homes with Vigyaan."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to={homeConfig?.contact_cta_link || "/shop"}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl transition-all"
                      >
                        {homeConfig?.contact_cta_text || "Start Shopping"}
                      </motion.button>
                    </Link>
                    <Link
                      to={homeConfig?.contact_cta_secondary_link || "/contact"}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-10 py-5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-indigo-300 transition-all"
                      >
                        {homeConfig?.contact_cta_secondary_text ||
                          "Contact Sales"}
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* API ERROR - DEVELOPMENT DEBUG */}
        {configError && import.meta.env.DEV && (
          <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 shadow-xl">
            Home API failed. Check:{" "}
            <code className="ml-1">/api/v1/home/home-config/</code>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
