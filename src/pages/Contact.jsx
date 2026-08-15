import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      inquiryType: "general",
    });
  };

  const locations = [
    {
      city: "Raipur",
      country: "India",
      address: "Vigyaan-IOT Systems, Innov8 Building, Raipur, CG - 492001",
      phone: "+91 771 4567 8901",
      email: "india@vigyaan-iot.com",
      flag: "🇮🇳",
      hours: "Mon-Sat: 9:00 AM - 7:00 PM IST",
    },
    {
      city: "San Francisco",
      country: "USA",
      address:
        "Vigyaan Inc., 456 Tech Park Drive, Suite 200, San Francisco, CA 94105",
      phone: "+1 (415) 555-0198",
      email: "usa@vigyaan-iot.com",
      flag: "🇺🇸",
      hours: "Mon-Fri: 8:00 AM - 5:00 PM PST",
    },
  ];

  const contactInfo = [
    {
      icon: "call",
      label: "Phone",
      value: "+91 1800-123-VIGYAAN",
      link: "tel:+9118001238449",
    },
    {
      icon: "mail",
      label: "Email",
      value: "support@vigyaan-iot.com",
      link: "mailto:support@vigyaan-iot.com",
    },
    { icon: "chat", label: "Live Chat", value: "Available 24/7", link: "#" },
    {
      icon: "schedule",
      label: "Response Time",
      value: "Under 2 hours",
      link: "#",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />
      <main className="pt-24 pb-20 px-5 md:px-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-indigo-600 font-bold mb-3 block">
            Get In Touch
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Have questions about our products? Need technical support? Our team
            is here to help.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {contactInfo.map((item, index) => (
            <motion.a
              key={index}
              href={item.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 text-center border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {item.value}
              </p>
            </motion.a>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Send Us a Message
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                Fill out the form below and we'll get back to you within 2
                hours.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { label: "Full Name *", key: "name", type: "text" },
                    { label: "Email Address *", key: "email", type: "email" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 font-semibold">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        required
                        value={form[f.key]}
                        onChange={(e) =>
                          setForm({ ...form, [f.key]: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 font-semibold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 font-semibold">
                      Inquiry Type
                    </label>
                    <select
                      value={form.inquiryType}
                      onChange={(e) =>
                        setForm({ ...form, inquiryType: e.target.value })
                      }
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer"
                    >
                      {[
                        "General Inquiry",
                        "Sales & Pricing",
                        "Technical Support",
                        "Partnership",
                        "Enterprise Solutions",
                        "Other",
                      ].map((t) => (
                        <option key={t} value={t.toLowerCase()}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 font-semibold">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2 font-semibold">
                    Message *
                  </label>
                  <textarea
                    required
                    rows="5"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                  ></textarea>
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${submitted ? "bg-green-50 text-green-600 border border-green-200" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"}`}
                >
                  {submitted ? "✓ Message Sent Successfully!" : "Send Message"}
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900">Our Offices</h2>
            <p className="text-gray-500 text-sm">
              Visit us at one of our global locations.
            </p>
            {locations.map((loc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{loc.flag}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {loc.city}{" "}
                      <span className="text-xs text-gray-400 font-normal">
                        {loc.country}
                      </span>
                    </h3>
                    <div className="space-y-1.5 mt-2 text-sm text-gray-500">
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-indigo-500 text-base mt-0.5">
                          location_on
                        </span>
                        {loc.address}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500 text-base">
                          call
                        </span>
                        <a
                          href={`tel:${loc.phone}`}
                          className="hover:text-indigo-600"
                        >
                          {loc.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500 text-base">
                          mail
                        </span>
                        <a
                          href={`mailto:${loc.email}`}
                          className="hover:text-indigo-600"
                        >
                          {loc.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-indigo-500 text-base">
                          schedule
                        </span>
                        <span className="text-gray-400 text-xs">
                          {loc.hours}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
