import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Animated Counter
function CountUp({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

export default function Home() {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const [currentBanner, setCurrentBanner] = useState(0);

  const bannerSlides = [
    {
      title: "Smart Home Bundle",
      subtitle: "Save 40%",
      desc: "Complete ecosystem with Hub, 4 Sensors & 2 Cameras",
      price: "49999",
      originalPrice: "84999",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDawT4c6FLQbaD9htQ0f3eHwMiXn27BwWedEaaemhw5tloqbBdAxqIKsWqC9NT0D_Yh0jzk_P1d8GEctLwSspvrAaRjx8E-voXEjwxLiAWpHPkUgCMbVcOrErKBsfq9Mbe19OL3AH1548gUybmpgRSm8z0Tc_auG7AVpu3IbbCngw-Uh4SEL6pRm5walo0JeCmdg2JmBiDs17r9tVMvg1q9lpLCXKvbcLDx1Rr1sA3z622z2Jl272rE2fL6ATEReilZ0uTFHzNzgtk",
      gradient: "from-indigo-600 via-purple-600 to-pink-500",
      bgGradient: "from-indigo-50 via-purple-50 to-pink-50",
    },
    {
      title: "Aero Cam 4K",
      subtitle: "New Release",
      desc: "Ultra-wide 160° view with AI night vision",
      price: "19999",
      originalPrice: "24999",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkQ_xYBwh6Qc-Bjr6Q0SH27gjpZiJ0iL3d-eVoB6S5_KzyCND4Pu9pr_aLTpV9ICbmv670Gbyi520A2TBtpssolpMzf2CaZLN1A691P8g7eKBXyt3tVxGaoksU2RuGXRkYJ6Kd7nUAHquLnhoSbQpm2_I-H2G8IvfNRmylzjwl-O730FmQ8a6jK896JDlSn69mBgay1TyC4Ez1IduMWdh_mVncuPFdl0u-5bVYCsFjZOFknpMJg8RL0hmjinqh2jDasJdsbFdO1_M",
      gradient: "from-blue-600 via-cyan-500 to-teal-500",
      bgGradient: "from-blue-50 via-cyan-50 to-teal-50",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = bannerSlides[currentBanner];

  const categories = [
    { icon: "🏠", name: "Smart Home", count: 45, gradient: "from-indigo-500 to-purple-500" },
    { icon: "🔒", name: "Security", count: 32, gradient: "from-blue-500 to-cyan-500" },
    { icon: "📡", name: "Sensors", count: 28, gradient: "from-emerald-500 to-green-500" },
    { icon: "📷", name: "Cameras", count: 19, gradient: "from-orange-500 to-red-500" },
    { icon: "🌡️", name: "Climate", count: 15, gradient: "from-pink-500 to-rose-500" },
    { icon: "💡", name: "Lighting", count: 24, gradient: "from-violet-500 to-purple-500" },
  ];

  const features = [
    { icon: "🚚", title: "Free Shipping", desc: "On orders above ₹999", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: "🛡️", title: "5 Year Warranty", desc: "Premium protection", color: "text-green-600", bg: "bg-green-50" },
    { icon: "🎧", title: "24/7 Support", desc: "Always here to help", color: "text-purple-600", bg: "bg-purple-50" },
    { icon: "🏆", title: "Quality Guarantee", desc: "Certified devices", color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  const ecoCards = [
    {
      title: "Smart Home", desc: "Intelligent automation that anticipates your needs, from climate control to adaptive lighting systems.",
      size: "md:col-span-8", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtL3XNMPv940p8gXMlCeqVbZ9TJ2k9_4kQUh14I1Q8fd-BOGeVpjHyuvbN9bW1UgyCNvxEd3o7XPTjB8GKv6DnRTZfU_Yjg9ZVF48UxI-rSNhjLNnF-gUBejUx2pAxBB769jcT0YiivwXy16vzJ0yESGFTca-JjGtPTUMoluAojLbCqe-0snkATdX0pXXaImzbKTo_3FQn1vo5x7wWVeo4DI_YEp4NjZHwonJxDSPWCCWRe4kS5dCrWxTitYyt2Kq_n_YguJrWFzw",
    },
    { title: "Wearables", desc: "Biometric monitoring redefined with titanium-grade durability.", size: "md:col-span-4", icon: "watch" },
    { title: "Security", desc: "Military-grade encryption and real-time threat detection.", size: "md:col-span-4", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2KpRRzzBM-rKi5Mhkprut3NYqO4Kh5R4b80moRmKsTQR4vpvLlLk96E55KEj8X25lFWV_aGVS8gCgDbos_dClHrKZOwb46HKxvZ9laALa8NeqKTHX5UG5x0h3VUfW-IMtx0MHh67vcFbXKEh6OlUx9ia9D1b2CxLM1JYXjXjB80q9w3OzJcw3DNtnmnEzixs2TCYWQEk8Ar6pTHDwHCEqVqpoGOdz5uILjOCTlPY2EIwjW2eMgR-U5U0WmAGLHGgBnA3y8wgYaek" },
    { title: "Robotics", desc: "Autonomous systems for modern logistics and personal assistance.", size: "md:col-span-8", features: ["Neural Pathfinding", "Haptic Dexterity"] },
  ];

  const testimonials = [
    { name: "Rajesh Kumar", role: "Smart Home Owner", avatar: "👨‍💼", rating: 5, text: "The IoT devices completely transformed my home. Best investment I ever made! The setup was incredibly easy." },
    { name: "Priya Sharma", role: "Tech Entrepreneur", avatar: "👩‍💻", rating: 5, text: "Incredible quality and features. The security cameras provide crystal clear footage. Highly recommended!" },
    { name: "Amit Verma", role: "Business Owner", avatar: "👨‍💼", rating: 5, text: "We outfitted our entire office with Vigyaan devices. Energy savings alone paid for the investment in 6 months!" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <Navbar />
      <main className="relative">
        
        {/* ============ HERO SECTION ============ */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50"></div>
            <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl"></div>
            
            {/* Floating Particles */}
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-indigo-400/20 rounded-full"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
                transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
              />
            ))}
          </div>

          <motion.div style={{ scale: heroScale, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              {/* Left Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-xl rounded-full px-5 py-2.5 border border-gray-200 shadow-sm"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-bold text-gray-700">🚀 New Collection 2026</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight"
                >
                  <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                    Smart Living
                  </span>
                  <br />
                  <span className="text-gray-900">Redefined</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed"
                >
                  Experience the next evolution of connected living with Vigyaan's aerospace-grade IoT devices.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link to="/shop">
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99,102,241,0.4)" }}
                      whileTap={{ scale: 0.95 }}
                      className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/25 transition-all flex items-center gap-3"
                    >
                      Shop Now
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </motion.button>
                  </Link>
                  <Link to="/Blog">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined">play_circle</span>
                      Watch Demo
                    </motion.button>
                  </Link>
                </motion.div>

                {/* Live Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="grid grid-cols-3 gap-4 pt-4"
                >
                  {[
                    { value: 50000, suffix: "+", label: "Active Devices", icon: "📡" },
                    { value: 99.9, suffix: "%", label: "Uptime", icon: "⚡" },
                    { value: 150, suffix: "+", label: "Countries", icon: "🌍" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all">
                      <span className="text-2xl mb-1 block">{stat.icon}</span>
                      <p className="text-xl md:text-2xl font-black text-gray-900">
                        <CountUp end={stat.value} />{stat.suffix}
                      </p>
                      <p className="text-[10px] md:text-xs text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Right - 3D Visual */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="hidden lg:flex justify-center relative"
              >
                <motion.div
                  animate={{ y: [0, -20, 0], rotateY: [0, 360] }}
                  transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" }, rotateY: { duration: 30, repeat: Infinity, ease: "linear" } }}
                  className="relative w-80 h-80 md:w-96 md:h-96"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-[40%] blur-2xl"></div>
                  <div className="absolute inset-4 bg-white rounded-[40%] border-4 border-white shadow-2xl flex items-center justify-center">
                    <span className="text-[120px] md:text-[150px]">🛸</span>
                  </div>
                  {[0, 120, 240].map((angle, i) => (
                    <motion.div key={i} className="absolute inset-0" animate={{ rotate: 360 }}
                      transition={{ duration: 10 + i * 3, repeat: Infinity, ease: "linear" }}>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ transform: `rotate(${angle}deg) translateY(-170px)` }}>
                        <motion.div animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                          className="w-14 h-14 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-2xl">
                          {["📡", "🔒", "🌡️"][i]}
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-bold">Scroll</span>
              <div className="w-7 h-12 border-2 border-gray-300 rounded-full flex justify-center p-1.5">
                <motion.div animate={{ y: [0, 14, 0] }} transition={{ duration: 2, repeat: Infinity }}
                  className="w-1.5 h-3 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============ FEATURES BAR ============ */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((f, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
                  <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{f.icon}</div>
                  <div><p className="text-sm font-bold text-gray-900">{f.title}</p><p className="text-xs text-gray-400">{f.desc}</p></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CATEGORIES ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-[0.3em]">Categories</span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-3">Explore Our Collection</h2>
            </motion.div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -8 }} className="group cursor-pointer">
                  <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                    <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <h3 className="text-sm font-bold text-gray-900">{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{cat.count} products</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PROMO BANNER ============ */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className={`max-w-7xl mx-auto rounded-3xl overflow-hidden relative bg-gradient-to-br ${banner.gradient} shadow-2xl`}>
            <div className="absolute inset-0 bg-white/5"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center p-8 md:p-12 lg:p-16">
              <div className="space-y-5">
                <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/30">
                  ⚡ {banner.subtitle}
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white">{banner.title}</h2>
                <p className="text-white/80 text-lg">{banner.desc}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-4xl md:text-5xl font-black text-white">₹{Number(banner.price).toLocaleString()}</span>
                  <span className="text-xl text-white/50 line-through">₹{Number(banner.originalPrice).toLocaleString()}</span>
                  <span className="bg-green-400/20 text-green-300 text-sm font-bold px-3 py-1.5 rounded-full border border-green-400/30">
                    Save {Math.round((1 - Number(banner.price) / Number(banner.originalPrice)) * 100)}%
                  </span>
                </div>
                <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 hover:shadow-xl transition-all">
                  Shop Bundle <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
              <div className="flex justify-center lg:justify-end">
                <motion.img animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                  src={banner.img} alt={banner.title} className="w-48 sm:w-64 md:w-80 h-auto object-contain drop-shadow-2xl" />
              </div>
            </div>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {bannerSlides.map((_, i) => (
                <button key={i} onClick={() => setCurrentBanner(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentBanner ? "bg-white w-8" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* ============ BENTO GRID ============ */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
              <span className="text-xs text-indigo-600 font-bold uppercase tracking-[0.3em]">Core Verticals</span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-3">The Vigyaan Ecosystem</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:h-[700px]">
              {ecoCards.map((card, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }} className={`${card.size} bg-white rounded-2xl p-6 md:p-8 flex flex-col justify-between group overflow-hidden relative border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer`}>
                  <div className="z-10"><h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2">{card.title}</h3><p className="text-sm text-gray-500 max-w-sm">{card.desc}</p></div>
                  {card.img && <div className="absolute bottom-0 right-0 w-1/2 h-full transform group-hover:scale-110 transition-transform duration-700 pointer-events-none"><div className="w-full h-full bg-cover bg-right-bottom bg-no-repeat opacity-60" style={{ backgroundImage: `url(${card.img})` }}></div></div>}
                  {card.icon && <div className="mt-6 z-10"><span className="material-symbols-outlined text-5xl text-indigo-500">{card.icon}</span></div>}
                  {card.features && <div className="mt-6 z-10"><ul className="space-y-2">{card.features.map((f, j) => <li key={j} className="flex items-center gap-2 text-sm text-gray-600"><span className="material-symbols-outlined text-cyan-500 text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>{f}</li>)}</ul></div>}
                  <Link to="/shop" className="mt-6 z-10 flex items-center gap-2 text-indigo-600 text-xs uppercase tracking-wider font-bold hover:gap-3 transition-all">Explore {card.title} <span className="material-symbols-outlined text-base">arrow_forward</span></Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TESTIMONIALS ============ */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="text-xs text-yellow-600 font-bold uppercase tracking-[0.3em]">Testimonials</span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-3">Loved by Customers</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -5 }} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex gap-1 mb-4">{[...Array(5)].map((_, j) => <span key={j} className="text-yellow-500 text-lg">★</span>)}</div>
                  <p className="text-gray-600 leading-relaxed mb-6 text-sm">"{t.text}"</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <span className="text-4xl">{t.avatar}</span>
                    <div><p className="text-sm font-bold text-gray-900">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ CTA ============ */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-10 md:p-16 border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">Ready to Go Smart?</h2>
                <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">Join thousands of happy customers who transformed their homes with Vigyaan.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/shop">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/25 hover:shadow-2xl transition-all">
                      Start Shopping
                    </motion.button>
                  </Link>
                  <Link to="/contact">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className="px-10 py-5 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold text-lg hover:border-indigo-300 transition-all">
                      Contact Sales
                    </motion.button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}