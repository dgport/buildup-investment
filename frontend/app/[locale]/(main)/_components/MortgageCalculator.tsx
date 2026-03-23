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
  const t = useTranslations("main");
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
    <section className="relative w-full py-14 overflow-hidden bg-[#f3f5f4]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 60% at 0% 100%, rgba(27,94,60,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 100% 0%, rgba(168,196,74,0.07) 0%, transparent 55%)
          `,
        }}
      />

      <div className="relative z-10 w-full mx-auto px-6 lg:px-24 max-w-[1440px]">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-6 h-px bg-teal-700" />
            <span className="text-teal-700 text-xs font-bold uppercase tracking-[0.3em]">
              {t("mortgageBadge")}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-[#0f2d1f] leading-tight">
            Plan Your <span className="italic text-teal-700">Investment</span>
          </h2>
          <p className="mt-1.5 text-[#4a6858] text-sm max-w-md">
            Estimate your monthly payments instantly with our real-time
            calculator.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 items-stretch">
          <div className="bg-white rounded-2xl p-7 shadow-sm border border-[#e8ede9] flex flex-col justify-between">
            <div className="space-y-7">
              <SliderRow
                label={t("propertyPrice")}
                value={display(price)}
                icon={<Home className="w-4 h-4" />}
                min={50000}
                max={2000000}
                step={5000}
                sliderValue={price}
                onChange={setPrice}
                minLabel="50,000"
                maxLabel="2,000,000"
              />

              <div className="h-px bg-[#eef1ee]" />

              <SliderRow
                label={t("downPayment")}
                value={`${display(downPayment)} (${downPct}%)`}
                icon={<Wallet className="w-4 h-4" />}
                min={price * 0.1}
                max={price * 0.9}
                step={1000}
                sliderValue={downPayment}
                onChange={setDownPayment}
                minLabel="10%"
                maxLabel="90%"
              />

              <div className="h-px bg-[#eef1ee]" />

              <SliderRow
                label={t("loanTerm")}
                value={`${months / 12} ${t("years")}`}
                icon={<Calendar className="w-4 h-4" />}
                min={12}
                max={360}
                step={12}
                sliderValue={months}
                onChange={setMonths}
                minLabel={`1 ${t("year")}`}
                maxLabel={`30 ${t("years")}`}
              />
            </div>
          </div>

          <div
            className="rounded-2xl p-7 relative overflow-hidden flex flex-col justify-between"
            style={{
              background:
                "linear-gradient(145deg, #0d2b1e 0%, #1a4d33 50%, #0f3525 100%)",
              boxShadow:
                "0 24px 64px -12px rgba(13,43,30,0.35), 0 0 0 1px rgba(168,196,74,0.15)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(ellipse 80% 60% at 80% 20%, rgba(168,196,74,0.12) 0%, transparent 60%)`,
              }}
            />
            <div
              className="absolute top-0 left-8 right-8 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(168,196,74,0.5), transparent)",
              }}
            />

            <div className="relative z-10 flex flex-col h-full gap-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CircleDollarSign className="text-[#A8C44A] w-5 h-5" />
                  <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                    {t("monthlyPayment")}
                  </span>
                </div>
                <div
                  className="flex p-0.5 rounded-full gap-0.5"
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {["GEL", "USD"].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr as "GEL" | "USD")}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all duration-200 ${
                        currency === curr
                          ? "bg-[#A8C44A] text-[#0a1f13] shadow-md"
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[#A8C44A]/70 text-xs uppercase tracking-[0.2em] mb-1">
                  Per Month
                </p>
                <h3 className="text-4xl font-light text-white tracking-tighter tabular-nums">
                  {display(monthlyPayment)}
                </h3>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-white/40 text-xs">
                    {t("downPayment")} · {downPct}%
                  </span>
                  <span className="text-white/40 text-xs">
                    {t("loan")} · {100 - downPct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${downPct}%`,
                      background: "linear-gradient(90deg, #A8C44A, #c9d96a)",
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-white/8 pt-4 flex-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Percent className="w-3 h-3 text-[#A8C44A]/70" />
                    <span className="text-white/50 text-xs">
                      {t("loanAmount")}
                    </span>
                  </div>
                  <span className="text-white font-medium text-xs tabular-nums">
                    {display(loanAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#A8C44A]" />
                    <span className="text-white/50 text-xs">
                      {t("equityShare")}
                    </span>
                  </div>
                  <span className="text-white font-medium text-xs">
                    {downPct}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="text-white/50 text-xs">
                      {t("loanTerm")}
                    </span>
                  </div>
                  <span className="text-white font-medium text-xs">
                    {months / 12} {t("years")}
                  </span>
                </div>
              </div>

              <button
                className="w-full group py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 text-[#0a1f13] hover:brightness-110 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #A8C44A 0%, #c4d84a 100%)",
                  boxShadow: "0 8px 24px -4px rgba(168,196,74,0.35)",
                }}
              >
                {t("mortgageCta")}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

type SliderRowProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  sliderValue: number;
  onChange: (v: number) => void;
  minLabel: string;
  maxLabel: string;
};

function SliderRow({
  label,
  value,
  icon,
  min,
  max,
  step,
  sliderValue,
  onChange,
  minLabel,
  maxLabel,
}: SliderRowProps) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-3">
        <div>
          <p className="text-[#7a9a88] text-xs font-semibold uppercase tracking-widest mb-0.5">
            {label}
          </p>
          <p className="text-xl font-semibold text-[#0f2d1f] tracking-tight tabular-nums">
            {value}
          </p>
        </div>
        <div
          className="p-2 rounded-lg transition-all duration-200 group-hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #e8f5ee, #f0f8f2)",
            border: "1px solid rgba(168,196,74,0.25)",
          }}
        >
          <span className="text-teal-700">{icon}</span>
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[sliderValue]}
        onValueChange={(v) => onChange(v[0])}
        className="[&_.bg-primary]:bg-teal-700 [&_.bg-secondary]:bg-[#e8ede9] [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-teal-700 [&_[role=slider]]:shadow-md"
      />
      <div className="flex justify-between mt-2 text-xs text-[#9ab5a3]">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default MortgageCalculator;
