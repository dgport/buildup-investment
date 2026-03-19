"use client";

import { useState } from "react";
import {
  Home,
  Calendar,
  Wallet,
  Percent,
  ChevronRight,
  CircleDollarSign,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useTranslations } from "next-intl";

const MortgageCalculator = ({
  initialPrice = null,
}: {
  initialPrice?: number | null;
}) => {
  const t = useTranslations("mortgage");
  const [currency, setCurrency] = useState<"GEL" | "USD">("GEL");
  const exchangeRate = 2.7;

  const [price, setPrice] = useState<number>(initialPrice || 100000);
  const [downPayment, setDownPayment] = useState<number>(price * 0.15);
  const [months, setMonths] = useState<number>(180);

  const loanAmount = price - downPayment;
  const monthlyPayment = loanAmount / months;
  const downPct = Math.round((downPayment / price) * 100);

  const formatValue = (v: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);

  const display = (v: number) =>
    currency === "GEL"
      ? `${formatValue(v)} ₾`
      : `$${formatValue(v / exchangeRate)}`;

  return (
    <section className="relative w-full py-20 px-6 overflow-hidden font-sans">
      {/* Background image — modern apartment building facade / urban real estate */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("/green.webp")`,
        }}
      />

      {/* Dark + blur overlay */}
      <div
        className="absolute inset-0 bg-black/55"
        style={{
          backdropFilter: "blur(1px)",
          WebkitBackdropFilter: "blur(3px)",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-12 bg-[#A8C44A]" />
            <span className="text-[#A8C44A] text-xs font-bold uppercase tracking-[0.3em]">
              {t("badge")}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Sliders — tightened vertical spacing */}
          <div className="lg:col-span-7 space-y-6">
            <div className="group">
              <div className="flex justify-between items-end mb-4">
                <div className="space-y-1">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {t("propertyPrice")}
                  </p>
                  <p className="text-3xl font-medium text-white tracking-tight">
                    {display(price)}
                  </p>
                </div>
                <Home className="text-[#A8C44A]/40 group-hover:text-[#A8C44A] transition-colors w-6 h-6" />
              </div>
              <Slider
                min={50000}
                max={2000000}
                step={5000}
                value={[price]}
                onValueChange={(v) => setPrice(v[0])}
                className="[&_.bg-primary]:bg-[#A8C44A] [&_.bg-secondary]:bg-white/10 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#A8C44A]"
              />
              <div className="flex justify-between mt-2 text-xs text-white/20">
                <span>50,000</span>
                <span>2,000,000</span>
              </div>
            </div>

            <div className="h-px bg-white/8" />

            <div className="group">
              <div className="flex justify-between items-end mb-4">
                <div className="space-y-1">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {t("downPayment")}
                  </p>
                  <p className="text-3xl font-medium text-white tracking-tight">
                    {display(downPayment)}{" "}
                    <span className="text-sm text-[#A8C44A] ml-2">
                      ({downPct}%)
                    </span>
                  </p>
                </div>
                <Wallet className="text-[#A8C44A]/40 group-hover:text-[#A8C44A] transition-colors w-6 h-6" />
              </div>
              <Slider
                min={price * 0.1}
                max={price * 0.9}
                step={1000}
                value={[downPayment]}
                onValueChange={(v) => setDownPayment(v[0])}
                className="[&_.bg-primary]:bg-[#A8C44A] [&_.bg-secondary]:bg-white/10 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#A8C44A]"
              />
              <div className="flex justify-between mt-2 text-xs text-white/20">
                <span>10%</span>
                <span>90%</span>
              </div>
            </div>

            <div className="h-px bg-white/8" />

            <div className="group">
              <div className="flex justify-between items-end mb-4">
                <div className="space-y-1">
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">
                    {t("loanTerm")}
                  </p>
                  <p className="text-3xl font-medium text-white tracking-tight">
                    {months / 12}{" "}
                    <span className="text-lg font-light text-white/60">
                      {t("years")}
                    </span>
                  </p>
                </div>
                <Calendar className="text-[#A8C44A]/40 group-hover:text-[#A8C44A] transition-colors w-6 h-6" />
              </div>
              <Slider
                min={12}
                max={360}
                step={12}
                value={[months]}
                onValueChange={(v) => setMonths(v[0])}
                className="[&_.bg-primary]:bg-[#A8C44A] [&_.bg-secondary]:bg-white/10 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-[#A8C44A]"
              />
              <div className="flex justify-between mt-2 text-xs text-white/20">
                <span>1 {t("year")}</span>
                <span>30 {t("years")}</span>
              </div>
            </div>
          </div>

          {/* Results card */}
          <div className="lg:col-span-5">
            <div
              className="rounded-[2rem] p-8 relative overflow-hidden"
              style={{
                background: "rgba(15,26,19,0.55)",
                backdropFilter: "blur(20px) saturate(1.4)",
                WebkitBackdropFilter: "blur(20px) saturate(1.4)",
                border: "1px solid rgba(168,196,74,0.18)",
                boxShadow:
                  "0 32px 64px -16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Subtle top highlight line */}
              <div
                className="absolute top-0 left-8 right-8 h-[1px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(168,196,74,0.5), transparent)",
                }}
              />

              <div className="flex justify-between items-center mb-10">
                <CircleDollarSign className="text-[#A8C44A] w-7 h-7" />
                <div
                  className="flex p-1 rounded-full"
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {["USD", "GEL"].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr as "GEL" | "USD")}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest transition-all ${
                        currency === curr
                          ? "bg-[#A8C44A] text-[#0F1A13] shadow-lg"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 mb-10">
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                  {t("monthlyPayment")}
                </p>
                <h3 className="text-5xl font-light text-white tracking-tighter">
                  {display(monthlyPayment)}
                </h3>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="h-1.5 rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${downPct}%`,
                      background: "linear-gradient(90deg, #C9A84C, #A8C44A)",
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-white/30">
                    {t("downPayment")} {downPct}%
                  </span>
                  <span className="text-xs text-white/30">
                    {t("loan")} {100 - downPct}%
                  </span>
                </div>
              </div>

              <div className="space-y-5 border-t border-white/8 pt-8 mb-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Percent className="w-3.5 h-3.5 text-[#A8C44A]" />
                    <span className="text-white/50 text-sm">
                      {t("loanAmount")}
                    </span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {display(loanAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#A8C44A]" />
                    <span className="text-white/50 text-sm">
                      {t("equityShare")}
                    </span>
                  </div>
                  <span className="text-white font-medium text-sm">
                    {downPct}%
                  </span>
                </div>
              </div>

              <button
                className="w-full group py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-[#0F1A13] hover:brightness-110"
                style={{
                  background:
                    "linear-gradient(135deg, #A8C44A 0%, #C9A84C 100%)",
                }}
              >
                {t("cta")}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MortgageCalculator;
