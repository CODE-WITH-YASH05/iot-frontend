import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../features/cart/hooks/useCart";
import { tokenManager } from "../api/token-manager";
import { useProducts } from "../features/products/hooks/useProducts";
import { mapProduct } from "../features/products/utils/productMapper";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // Fetch products for categories
  const { products: apiProducts, isLoading } = useProducts();

  // Get unique categories with sub-categories from products
  const categoryData = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    const products = apiProducts.map(mapProduct).filter(Boolean);
    const categoryMap = new Map();

    products.forEach((product) => {
      if (product.category) {
        const slug =
          product.categorySlug ||
          product.category.toLowerCase().replace(/\s+/g, "-");
        if (!categoryMap.has(slug)) {
          categoryMap.set(slug, {
            name: product.category,
            slug: slug,
            count: 0,
            products: [],
          });
        }
        categoryMap.get(slug).count += 1;
        categoryMap.get(slug).products.push(product);
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [apiProducts]);

  // Get unique brands
  const brands = useMemo(() => {
    if (!apiProducts || !Array.isArray(apiProducts)) return [];
    const products = apiProducts.map(mapProduct).filter(Boolean);
    const brandMap = new Map();

    products.forEach((product) => {
      if (product.brand) {
        const slug =
          product.brandSlug || product.brand.toLowerCase().replace(/\s+/g, "-");
        if (!brandMap.has(slug)) {
          brandMap.set(slug, {
            name: product.brand,
            slug: slug,
            count: 0,
          });
        }
        brandMap.get(slug).count += 1;
      }
    });

    return Array.from(brandMap.values()).sort((a, b) => b.count - a.count);
  }, [apiProducts]);

  // Check authentication status
  useEffect(() => {
    const accessToken = tokenManager.getAccessToken();

    const userData = localStorage.getItem("user");

    if (accessToken) {
      setIsAuthenticated(true);

      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setCategoriesOpen(false);
    setBrandsOpen(false);
  }, [location.pathname]);

  const isCheckout = location.pathname === "/checkout";

  const navLinks = [
    { name: "Home", path: "/", icon: "home" },
    { name: "Shop", path: "/shop", icon: "store" },
    { name: "Blog", path: "/blog", icon: "article" },
    { name: "Contact", path: "/contact", icon: "contact_support" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    tokenManager.clear();

    localStorage.removeItem("user");

    setIsAuthenticated(false);
    setUser(null);

    navigate("/");
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-lg shadow-gray-100/50"
            : "bg-white/80 backdrop-blur-xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-16">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <span
                    className="material-symbols-outlined text-white text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    hexagon
                  </span>
                </div>
              </div>
              <span className="font-display text-xl md:text-2xl font-bold">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Vigyaan
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isCheckout && (
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                      location.pathname === link.path
                        ? "text-indigo-600 bg-indigo-50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {link.icon}
                    </span>
                    {link.name}
                    {location.pathname === link.path && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></span>
                    )}
                  </Link>
                ))}

                {/* Categories Dropdown with Sub-categories */}
                {categoryData.length > 0 && (
                  <div
                    className="relative"
                    onMouseEnter={() => setCategoriesOpen(true)}
                    onMouseLeave={() => setCategoriesOpen(false)}
                  >
                    <button
                      className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                        location.pathname.includes("/category/")
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        category
                      </span>
                      Categories
                      <span className="material-symbols-outlined text-sm">
                        expand_more
                      </span>
                    </button>

                    {/* Categories Dropdown Menu */}
                    <AnimatePresence>
                      {categoriesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                          <div className="p-3 max-h-96 overflow-y-auto custom-scrollbar">
                            <Link
                              to="/shop"
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                              onClick={() => setCategoriesOpen(false)}
                            >
                              <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">
                                  view_list
                                </span>
                                All Categories
                              </span>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {apiProducts?.length || 0}
                              </span>
                            </Link>
                            <div className="h-px bg-gray-100 my-1"></div>

                            {categoryData.map((cat) => (
                              <Link
                                key={cat.slug}
                                to={`/category/${cat.slug}`}
                                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                                onClick={() => setCategoriesOpen(false)}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="material-symbols-outlined text-base group-hover:rotate-12 transition-transform">
                                    label
                                  </span>
                                  {cat.name}
                                </span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                                  {cat.count}
                                </span>
                              </Link>
                            ))}
                          </div>

                          {/* Footer */}
                          <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-gray-100">
                            <Link
                              to="/shop"
                              className="flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                              onClick={() => setCategoriesOpen(false)}
                            >
                              <span className="material-symbols-outlined text-base">
                                arrow_forward
                              </span>
                              View All Products
                            </Link>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Brands Dropdown */}
                {brands.length > 0 && (
                  <div
                    className="relative"
                    onMouseEnter={() => setBrandsOpen(true)}
                    onMouseLeave={() => setBrandsOpen(false)}
                  >
                    <button
                      className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                        location.pathname.includes("/brand/")
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">
                        storefront
                      </span>
                      Brands
                      <span className="material-symbols-outlined text-sm">
                        expand_more
                      </span>
                    </button>

                    {/* Brands Dropdown Menu */}
                    <AnimatePresence>
                      {brandsOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                          <div className="p-3 max-h-80 overflow-y-auto custom-scrollbar">
                            <Link
                              to="/brands"
                              className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                              onClick={() => setBrandsOpen(false)}
                            >
                              <span className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">
                                  view_list
                                </span>
                                All Brands
                              </span>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {brands.length}
                              </span>
                            </Link>
                            <div className="h-px bg-gray-100 my-1"></div>

                            {brands.map((brand) => (
                              <Link
                                key={brand.slug}
                                to={`/brand/${brand.slug}`}
                                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                                onClick={() => setBrandsOpen(false)}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-600 transition-all">
                                    {brand.name.charAt(0).toUpperCase()}
                                  </span>
                                  {brand.name}
                                </span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                                  {brand.count}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">
                  search
                </span>
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-xl">
                    shopping_cart
                  </span>
                </button>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30 px-1.5"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </Link>

              {/* User Profile / Authentication */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  {/* Dashboard / Profile */}
                  <Link
                    to="/dashboard"
                    title="My Dashboard"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-2xl">
                      account_circle
                    </span>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">
                      logout
                    </span>
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block">
                    <button className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all">
                      Sign In
                    </button>
                  </Link>

                  <Link to="/signup" className="hidden sm:block">
                    <button className="px-5 py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">
                  {mobileOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 bg-white shadow-lg overflow-hidden"
            >
              <form
                onSubmit={handleSearch}
                className="max-w-2xl mx-auto px-4 py-5"
              >
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search for smart devices, sensors, hubs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-20 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition-all text-base"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
                  >
                    Search
                  </button>
                </div>
                {/* Quick Links */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-xs text-gray-400 font-medium py-1">
                    Popular:
                  </span>
                  {[
                    "Smart Hub",
                    "Security Cam",
                    "Thermostat",
                    "Door Lock",
                    "Sensor",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSearchQuery(tag);
                        navigate(`/shop?search=${encodeURIComponent(tag)}`);
                        setSearchOpen(false);
                      }}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            ></div>

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                  <Link
                    to="/"
                    className="flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-white text-lg"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        hexagon
                      </span>
                    </div>
                    <span className="font-display text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Vigyaan
                    </span>
                  </Link>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xl">
                      close
                    </span>
                  </button>
                </div>

                {/* User Profile - Mobile */}
                {isAuthenticated ? (
                  <div className="mb-6">
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-2xl">
                          account_circle
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-gray-900">
                          {user?.name || "My Account"}
                        </p>

                        <p className="text-xs text-gray-500">View Dashboard</p>
                      </div>
                    </Link>

                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileOpen(false);
                      }}
                      className="mt-3 w-full py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">
                        logout
                      </span>
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="mb-6 grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold">
                        Sign In
                      </button>
                    </Link>

                    <Link to="/signup" onClick={() => setMobileOpen(false)}>
                      <button className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-semibold">
                        Sign Up
                      </button>
                    </Link>
                  </div>
                )}
                {/* Mobile Nav Links */}
                <div className="space-y-1 mb-6">
                  {[
                    { name: "Home", path: "/", icon: "home" },
                    { name: "Shop All", path: "/shop", icon: "store" },
                    { name: "Blog", path: "/blog", icon: "article" },
                    {
                      name: "Contact",
                      path: "/contact",
                      icon: "contact_support",
                    },
                  ].map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === link.path
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {link.icon}
                      </span>
                      {link.name}
                    </Link>
                  ))}
                </div>

                {/* Categories - Mobile */}
                {categoryData.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold mb-3 px-4 flex items-center justify-between">
                      <span>Categories</span>
                      <span className="text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full text-[10px]">
                        {categoryData.length}
                      </span>
                    </p>
                    <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                      <Link
                        to="/shop"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">
                            view_list
                          </span>
                          All Products
                        </span>
                        <span className="text-xs text-indigo-400 bg-indigo-100 px-2 py-0.5 rounded-full">
                          {apiProducts?.length || 0}
                        </span>
                      </Link>

                      {categoryData.slice(0, 8).map((cat) => (
                        <Link
                          key={cat.slug}
                          to={`/category/${cat.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-base">
                              label
                            </span>
                            {cat.name}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {cat.count}
                          </span>
                        </Link>
                      ))}
                      {categoryData.length > 8 && (
                        <Link
                          to="/shop"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          View All Categories
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                {/* Brands - Mobile */}
                {brands.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold mb-3 px-4 flex items-center justify-between">
                      <span>Brands</span>
                      <span className="text-gray-300 bg-gray-100 px-2 py-0.5 rounded-full text-[10px]">
                        {brands.length}
                      </span>
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                      {brands.slice(0, 5).map((brand) => (
                        <Link
                          key={brand.slug}
                          to={`/brand/${brand.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                        >
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                              {brand.name.charAt(0).toUpperCase()}
                            </span>
                            {brand.name}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {brand.count}
                          </span>
                        </Link>
                      ))}
                      {brands.length > 5 && (
                        <Link
                          to="/brands"
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          View All Brands
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <hr className="border-gray-100 mb-6" />

                {/* Mobile Actions */}
                <div className="space-y-2">
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-3.5 rounded-xl bg-gray-50 text-gray-900 hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl text-indigo-600">
                        shopping_cart
                      </span>
                      <span className="text-sm font-semibold">Cart</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        {cartCount} items
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                  >
                    <span className="material-symbols-outlined text-xl">
                      account_circle
                    </span>
                    My Account
                  </Link>
                </div>

                {/* Mobile CTA */}
                <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
                  <p className="text-sm font-bold text-indigo-600 mb-1">
                    Need Help?
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Our support team is available 24/7 to assist you.
                  </p>
                  <Link to="/contact" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                      Contact Support
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}
