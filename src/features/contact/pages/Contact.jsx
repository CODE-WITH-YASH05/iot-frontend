import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

// UI Icons
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
  Map,
  ChevronDown,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  Building2,
  LocateFixed,
  ExternalLink,
} from "lucide-react";

// Social Media Brand Icons
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import useContact from "../hooks/useContact";

// ==========================================================
// CONTACT ICON
// ==========================================================

const ContactIcon = ({ icon: Icon, label, value, href, color = "indigo" }) => {
  const colors = {
    indigo: "bg-indigo-50/80 text-indigo-600 border-indigo-100",
    green: "bg-emerald-50/80 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50/80 text-blue-600 border-blue-100",
    purple: "bg-purple-50/80 text-purple-600 border-purple-100",
    red: "bg-rose-50/80 text-rose-600 border-rose-100",
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
    >
      <div
        className={`w-14 h-14 rounded-2xl ${colors[color]} flex items-center justify-center border transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
      >
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <h3 className="mt-5 font-bold text-gray-900 tracking-tight">{label}</h3>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
        >
          {value || "Not available"}
        </a>
      ) : (
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          {value || "Not available"}
        </p>
      )}
    </motion.div>
  );
};

// ==========================================================
// SOCIAL ICON
// ==========================================================

const SocialIcon = ({ href, icon: Icon, label, hoverColorClass }) => {
  return (
    <motion.a
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm transition-all duration-300 ${hoverColorClass}`}
      title={label}
    >
      <Icon size={20} />
    </motion.a>
  );
};

// ==========================================================
// FAQ ITEM
// ==========================================================

const FAQItem = ({ faq, isOpen, onToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
        isOpen
          ? "border-indigo-200 shadow-md ring-4 ring-indigo-50/50"
          : "border-gray-100 shadow-sm hover:shadow-md"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors"
      >
        <span
          className={`font-semibold transition-colors ${isOpen ? "text-indigo-700" : "text-gray-900"}`}
        >
          {faq.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-colors ${
            isOpen ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          <ChevronDown size={18} strokeWidth={2} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 text-gray-600 leading-relaxed pt-2">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==========================================================
// MAIN CONTACT PAGE
// ==========================================================

export default function Contact() {
  const {
    settings,
    offices,
    faqs,
    loading,
    submitting,
    error,
    submitError,
    success,
    submitInquiry,
  } = useContact();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    inquiry_type: "other",
    order_id: "",
    subject: "",
    message: "",
    attachment: null,
  });

  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedOfficeId, setSelectedOfficeId] = useState(null);

  // Select first office by default
  const selectedOffice = useMemo(() => {
    if (!offices?.length) return null;
    if (selectedOfficeId) {
      return (
        offices.find((office) => office.id === selectedOfficeId) || offices[0]
      );
    }
    return offices[0];
  }, [offices, selectedOfficeId]);

  const handleChange = (event) => {
    const { name, value, files } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, value);
        }
      });
      await submitInquiry(formData);
      setForm({
        name: "",
        email: "",
        mobile: "",
        inquiry_type: "other",
        order_id: "",
        subject: "",
        message: "",
        attachment: null,
      });
      toast.success("Message sent successfully! 🎉");
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="mt-4 text-slate-500 font-medium animate-pulse">
              Loading contact details...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <AlertCircle
              className="w-16 h-16 text-rose-500 mx-auto mb-4"
              strokeWidth={1.5}
            />
            <h2 className="text-2xl font-bold text-slate-900">
              Unable to load page
            </h2>
            <p className="text-slate-500 mt-2">
              {typeof error === "string"
                ? error
                : "Please check your connection and try again."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />

      <main className="flex-grow pt-24 md:pt-32 pb-16 relative">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply" />
        <div className="absolute top-40 left-[10%] w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply" />

        {/* HERO SECTION */}
        <section className="px-4 py-10 md:py-16 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100/50 mb-6">
              <MessageSquare size={16} /> Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Let's Talk About Your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                IoT Needs
              </span>
            </h1>
            <p className="max-w-2xl mx-auto mt-6 text-gray-500 text-lg md:text-xl leading-relaxed">
              Have a question about our products or services? Our expert
              engineering team is here to help you build the future.
            </p>
          </motion.div>
        </section>

        {/* CONTACT INFORMATION CARDS */}
        {settings && (
          <section className="max-w-7xl mx-auto px-4 mt-8 md:mt-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <ContactIcon
                icon={Phone}
                label="Call Us"
                value={settings.support_phone}
                href={`tel:${settings.support_phone}`}
                color="indigo"
              />
              <ContactIcon
                icon={MessageCircle}
                label="WhatsApp"
                value={settings.whatsapp_number}
                href={`https://wa.me/${settings.whatsapp_number?.replace(/\D/g, "")}`}
                color="green"
              />
              <ContactIcon
                icon={Mail}
                label="Support Email"
                value={settings.support_email}
                href={`mailto:${settings.support_email}`}
                color="blue"
              />
              <motion.div
                whileHover={{ y: -4 }}
                className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-50/80 text-purple-600 border border-purple-100 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Clock size={24} strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-bold text-gray-900 tracking-tight">
                  Working Hours
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {settings.working_days}
                </p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {settings.working_hours}
                </p>
              </motion.div>
            </motion.div>
          </section>
        )}

        {/* ==========================================================
            VISIT US & CONTACT FORM SECTION
        ========================================================== */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            {settings?.contact_form_enabled && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2rem] border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 md:p-10"
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    Send Us a Message
                  </h2>
                  <p className="text-gray-500 mt-2 text-sm">
                    Fill out the form below and our team will get back to you
                    within 24 hours.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        required
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Inquiry Type <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          name="inquiry_type"
                          value={form.inquiry_type}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 appearance-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        >
                          <option value="product">Product Inquiry</option>
                          <option value="order">Order Related</option>
                          <option value="technical">Technical Support</option>
                          <option value="warranty">Warranty</option>
                          <option value="return">Return / Replacement</option>
                          <option value="bulk">Bulk / B2B Order</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                          size={20}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Subject <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Brief subject of your inquiry"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="How can we help you today?"
                      rows={4}
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50/50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Attachment{" "}
                      <span className="text-gray-400 font-normal ml-1">
                        (Optional, Max 5MB)
                      </span>
                    </label>
                    <input
                      type="file"
                      name="attachment"
                      onChange={handleChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                    />
                  </div>

                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
                          <AlertCircle
                            className="text-rose-500 shrink-0 mt-0.5"
                            size={20}
                          />
                          <div>
                            <p className="font-semibold text-rose-800 text-sm">
                              Error Submitting Form
                            </p>
                            <p className="text-rose-600 text-sm mt-1">
                              {typeof submitError === "string"
                                ? submitError
                                : "Unable to send your message."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    {success && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 flex items-start gap-3">
                          <CheckCircle2
                            className="text-emerald-500 shrink-0 mt-0.5"
                            size={20}
                          />
                          <div>
                            <p className="font-semibold text-emerald-800 text-sm">
                              Message Sent Successfully!
                            </p>
                            <p className="text-emerald-600 text-sm mt-1">
                              Thank you for reaching out. Our team will contact
                              you shortly.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-base shadow-[0_8px_20px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_25px_rgba(79,70,229,0.3)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> Sending
                        Message...
                      </>
                    ) : (
                      <>
                        Send Message <Send size={18} className="ml-1" />
                      </>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* =========================================================
                VISIT US — DYNAMIC OFFICE LOCATION
            ========================================================== */}
            {offices.length > 0 && selectedOffice && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden bg-slate-950 rounded-[2rem] border border-slate-800 shadow-[0_20px_60px_rgba(15,23,42,0.22)]"
              >
                {/* Decorative background */}
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-28 -left-20 w-64 h-64 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

                <div className="relative p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <MapPin size={14} />
                        Our Location
                      </div>

                      <h2 className="mt-3 text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                        Visit Us
                      </h2>

                      <p className="mt-1 text-sm text-slate-400">
                        Find the office nearest to you.
                      </p>
                    </div>

                    {selectedOffice.is_active !== false && (
                      <span className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Open Office
                      </span>
                    )}
                  </div>

                  {/* Office selector */}
                  {offices.length > 1 && (
                    <div className="mb-6">
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {offices.map((office) => {
                          const active = selectedOffice.id === office.id;

                          return (
                            <button
                              key={office.id}
                              type="button"
                              onClick={() => setSelectedOfficeId(office.id)}
                              className={`group shrink-0 min-w-[150px] text-left px-4 py-3 rounded-2xl border transition-all duration-300 ${
                                active
                                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/30"
                                  : "bg-slate-900/70 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600"
                              }`}
                            >
                              <span
                                className={`block text-[11px] uppercase tracking-wider font-semibold ${
                                  active ? "text-indigo-100" : "text-slate-500"
                                }`}
                              >
                                Office
                              </span>
                              <span className="block mt-0.5 font-semibold truncate">
                                {office.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Map card */}
                  <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-700 bg-slate-900">
                    <div className="h-[280px] md:h-[330px]">
                      {selectedOffice.latitude && selectedOffice.longitude ? (
                        <iframe
                          title={`${selectedOffice.name} location`}
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            `${selectedOffice.latitude},${selectedOffice.longitude}`,
                          )}&z=15&output=embed`}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          className="block"
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-slate-900 to-slate-800">
                          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center mb-4">
                            <MapPin size={30} className="text-indigo-400" />
                          </div>
                          <p className="text-white font-semibold">
                            Location not available
                          </p>
                          <p className="text-slate-400 text-sm mt-1 max-w-xs">
                            The admin has not added map coordinates for this
                            office yet.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Map location badge */}
                    {selectedOffice.latitude && selectedOffice.longitude && (
                      <div className="absolute left-4 bottom-4 right-4 pointer-events-none">
                        <div className="inline-flex max-w-full items-center gap-3 px-4 py-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-white/10 shadow-xl">
                          <div className="w-9 h-9 shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center">
                            <MapPin size={18} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm font-bold truncate">
                              {selectedOffice.name}
                            </p>
                            <p className="text-slate-400 text-xs truncate">
                              {selectedOffice.city}
                              {selectedOffice.state
                                ? `, ${selectedOffice.state}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Office details */}
                  <div className="mt-6 grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 flex gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                      <div className="w-11 h-11 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center">
                        <MapPin size={20} className="text-indigo-400" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Address
                        </p>
                        <h3 className="mt-1 text-white font-bold">
                          {selectedOffice.name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                          {selectedOffice.address || "Address not available"}
                          {selectedOffice.city
                            ? `, ${selectedOffice.city}`
                            : ""}
                          {selectedOffice.state
                            ? `, ${selectedOffice.state}`
                            : ""}
                          {selectedOffice.pincode
                            ? ` - ${selectedOffice.pincode}`
                            : ""}
                          {selectedOffice.country
                            ? `, ${selectedOffice.country}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    {selectedOffice.phone && (
                      <a
                        href={`tel:${selectedOffice.phone}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Phone size={18} className="text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                            Phone
                          </p>
                          <p className="text-sm text-slate-200 truncate group-hover:text-white">
                            {selectedOffice.phone}
                          </p>
                        </div>
                      </a>
                    )}

                    {selectedOffice.email && (
                      <a
                        href={`mailto:${selectedOffice.email}`}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900 transition-all group"
                      >
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center">
                          <Mail size={18} className="text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                            Email
                          </p>
                          <p className="text-sm text-slate-200 truncate group-hover:text-white">
                            {selectedOffice.email}
                          </p>
                        </div>
                      </a>
                    )}

                    {selectedOffice.working_hours && (
                      <div className="md:col-span-2 flex items-center gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Clock size={18} className="text-amber-400" />
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                            Working Hours
                          </p>
                          <p className="text-sm text-slate-200 mt-0.5">
                            {selectedOffice.working_days || "Working days"}{" "}
                            {selectedOffice.working_hours
                              ? `• ${selectedOffice.working_hours}`
                              : ""}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Coordinates */}
                  {selectedOffice.latitude && selectedOffice.longitude && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        Lat:{" "}
                        <span className="text-slate-200 font-medium">
                          {selectedOffice.latitude}
                        </span>
                      </span>
                      <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                        Lng:{" "}
                        <span className="text-slate-200 font-medium">
                          {selectedOffice.longitude}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-5 grid sm:grid-cols-2 gap-3">
                    {selectedOffice.google_maps_url ? (
                      <a
                        href={selectedOffice.google_maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-900/25 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <LocateFixed size={18} />
                        Get Directions
                        <ExternalLink size={15} />
                      </a>
                    ) : selectedOffice.latitude && selectedOffice.longitude ? (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${selectedOffice.latitude},${selectedOffice.longitude}`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-indigo-900/25 transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <LocateFixed size={18} />
                        Open in Google Maps
                        <ExternalLink size={15} />
                      </a>
                    ) : null}

                    {selectedOffice.phone && (
                      <a
                        href={`tel:${selectedOffice.phone}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-bold transition-all duration-300"
                      >
                        <Phone size={18} className="text-emerald-400" />
                        Call Office
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* FAQ SECTION */}
        {faqs.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mb-4">
                <HelpCircle size={24} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openFaqIndex === index}
                  onToggle={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {/* SOCIAL MEDIA */}
        {settings && (
          <section className="max-w-4xl mx-auto px-4 py-16 border-t border-gray-200/60 text-center">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mb-8">
              Connect With Us Everywhere
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {settings.facebook_url && (
                <SocialIcon
                  href={settings.facebook_url}
                  icon={FaFacebookF}
                  label="Facebook"
                  hoverColorClass="hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5 hover:shadow-[#1877F2]/20"
                />
              )}
              {settings.instagram_url && (
                <SocialIcon
                  href={settings.instagram_url}
                  icon={FaInstagram}
                  label="Instagram"
                  hoverColorClass="hover:text-[#E4405F] hover:border-[#E4405F]/30 hover:bg-[#E4405F]/5 hover:shadow-[#E4405F]/20"
                />
              )}
              {settings.youtube_url && (
                <SocialIcon
                  href={settings.youtube_url}
                  icon={FaYoutube}
                  label="YouTube"
                  hoverColorClass="hover:text-[#FF0000] hover:border-[#FF0000]/30 hover:bg-[#FF0000]/5 hover:shadow-[#FF0000]/20"
                />
              )}
              {settings.linkedin_url && (
                <SocialIcon
                  href={settings.linkedin_url}
                  icon={FaLinkedinIn}
                  label="LinkedIn"
                  hoverColorClass="hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/5 hover:shadow-[#0A66C2]/20"
                />
              )}
              {settings.twitter_url && (
                <SocialIcon
                  href={settings.twitter_url}
                  icon={FaXTwitter}
                  label="Twitter / X"
                  hoverColorClass="hover:text-[#000000] hover:border-gray-400 hover:bg-gray-100 hover:shadow-gray-300/30"
                />
              )}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
