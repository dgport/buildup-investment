"use client";

import { useState } from "react";
import { Facebook, Mail, Phone, MapPin, ArrowRight, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";

const ContactSection = () => {
  const t = useTranslations("contact");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [result, setResult] = useState("");
  const [sending, setSending] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    setResult("sending");
    setTimeout(() => {
      setSending(false);
      setResult("success");
      setFormData({ fullName: "", email: "", phone: "", message: "" });
      setTimeout(() => setResult(""), 5000);
    }, 1500);
  };

  return (
    <section className="min-h-screen bg-[#f3f5f4] pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-amber-400" />
            <span className="text-amber-600 text-xs font-bold uppercase tracking-[0.25em]">
              {t("label")}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-teal-950 leading-tight max-w-2xl">
            {t("heading")}
          </h1>
          <p className="mt-4 text-teal-700/60 text-lg max-w-xl leading-relaxed">
            {t("subheading")}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Form */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white rounded-3xl shadow-sm border border-teal-100 p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-teal-800 uppercase tracking-widest mb-2">
                    {t("fullName")}
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder={t("fullNamePlaceholder")}
                    className="border-teal-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl h-12 text-teal-950 placeholder:text-teal-400"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-teal-800 uppercase tracking-widest mb-2">
                      {t("email")}
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder={t("emailPlaceholder")}
                      className="border-teal-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl h-12 text-teal-950 placeholder:text-teal-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-teal-800 uppercase tracking-widest mb-2">
                      {t("phone")}
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+995 (000) 00-00-00"
                      className="border-teal-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl h-12 text-teal-950 placeholder:text-teal-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-teal-800 uppercase tracking-widest mb-2">
                    {t("message")}
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    placeholder={t("messagePlaceholder")}
                    className="border-teal-200 focus:border-amber-400 focus:ring-amber-400/20 rounded-xl text-teal-950 placeholder:text-teal-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="group w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-teal-950 font-bold text-sm uppercase tracking-widest rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-400/30"
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  {sending ? t("sending") : t("send")}
                </button>

                {result === "success" && (
                  <div className="flex items-center gap-2 text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    {t("successMessage")}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Info sidebar */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-5">
            {/* Contact cards */}
            {[
              {
                icon: MapPin,
                label: t("locationLabel"),
                content: t("locationValue"),
                href: "https://maps.google.com",
                color: "amber",
              },
              {
                icon: Phone,
                label: t("phoneLabel"),
                content: "+995 000 00 00 00",
                href: "tel:+995000000000",
                color: "teal",
              },
              {
                icon: Mail,
                label: t("emailLabel"),
                content: "digitalport@gmail.com",
                href: "mailto:digitalport@gmail.com",
                color: "amber",
              },
            ].map(({ icon: Icon, label, content, href, color }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-teal-100 hover:border-amber-300 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                    color === "amber"
                      ? "bg-amber-50 group-hover:bg-amber-100"
                      : "bg-teal-50 group-hover:bg-teal-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${color === "amber" ? "text-amber-600" : "text-teal-600"}`}
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-1">
                    {label}
                  </p>
                  <p className="text-sm text-teal-900 font-medium group-hover:text-amber-700 transition-colors break-all">
                    {content}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-300 group-hover:text-amber-400 ml-auto mt-1 shrink-0 transition-all group-hover:translate-x-0.5" />
              </a>
            ))}

            {/* Social */}
            <div className="p-5 bg-white rounded-2xl border border-teal-100">
              <p className="text-xs font-bold text-teal-500 uppercase tracking-widest mb-4">
                {t("connectLabel")}
              </p>
              <div className="flex gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-teal-50 hover:bg-amber-50 border border-teal-100 hover:border-amber-300 rounded-xl flex items-center justify-center text-teal-700 hover:text-amber-600 transition-all duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Decorative accent */}
            <div className="hidden lg:block pt-4">
              <div className="h-1 w-20 bg-gradient-to-r from-teal-400 to-amber-400 rounded-full" />
              <div className="h-1 w-10 bg-gradient-to-r from-teal-400 to-amber-400 rounded-full mt-2 opacity-40" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
