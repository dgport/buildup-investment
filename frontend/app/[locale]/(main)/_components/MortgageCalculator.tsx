"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Calendar, Wallet, Percent, ChevronRight, CircleDollarSign } from "lucide-react";
import { useTranslations } from "next-intl";
import { Slider } from "@/components/ui/slider";
import { ROUTES } from "@/lib/constants/routes";

const EXCHANGE_RATE = 2.7;

/** Standard annuity payment: P * r / (1 - (1 + r)^-n). Falls back to P / n at 0%. */
function annuity(principal: number, annualRatePct: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

const MortgageCalculator = ({ initialPrice = null }: { initialPrice?: number | null }) => {
  const t = useTranslations("main");
  const [currency, setCurrency] = useState<"GEL" | "USD">("GEL");

  const [price, setPrice] = useState<number>(initialPrice || 100000);
  const [downPct, setDownPct] = useState<number>(20);
  const [months, setMonths] = useState<number>(180);
  const [rate, setRate] = useState<number>(10);

  const downPayment = Math.round((price * downPct) / 100);
  const loanAmount = price - downPayment;
  const monthlyPayment = annuity(loanAmount, rate, months);
  const totalPayment = monthlyPayment * months;
  const totalInterest = Math.max(0, totalPayment - loanAmount);

  const formatValue = (v: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(v);

  const display = (v: number) =>
    currency === "GEL" ? `${formatValue(v)} ₾` : `$${formatValue(v / EXCHANGE_RATE)}`;

  return (
    <section className="relative w-full py-16 lg:py-24 overflow-hidden bg-[#f3f5f4]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 0% 100%, rgba(19,78,74,0.07) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 0%, rgba(245,158,11,0.08) 0%, transparent 55%)",
        }}
      />

      <div className="relative z-10 w-full mx-auto px-6 lg:px-24 max-w-[1440px]">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="block w-8 h-0.5 bg-amber-400 rounded-full" />
            <span className="text-teal-800 text-xs font-bold uppercase tracking-[0.3em]">
              {t("mortgageBadge")}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-teal-950 leading-tight">
            {t("mortgage.title")}
          </h2>
          <p className="mt-2 text-slate-500 text-sm sm:text-base max-w-lg">{t("mortgage.subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-stretch">
          {/* Inputs */}
          <div className="lg:col-span-3 card p-7 sm:p-8 flex flex-col justify-between">
            <div className="space-y-7">
              <SliderRow
                label={t("propertyPrice")}
                value={display(price)}
                icon={<Home className="w-4 h-4" />}
                min={30000}
                max={2000000}
                step={5000}
                sliderValue={price}
                onChange={setPrice}
                minLabel={display(30000)}
                maxLabel={display(2000000)}
              />
              <div className="h-px bg-slate-100" />
              <SliderRow
                label={t("downPayment")}
                value={`${display(downPayment)} · ${downPct}%`}
                icon={<Wallet className="w-4 h-4" />}
                min={10}
                max={90}
                step={1}
                sliderValue={downPct}
                onChange={setDownPct}
                minLabel="10%"
                maxLabel="90%"
              />
              <div className="h-px bg-slate-100" />
              <div className="grid sm:grid-cols-2 gap-7">
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
                <SliderRow
                  label={t("mortgage.interestRate")}
                  value={`${rate.toFixed(1)}%`}
                  icon={<Percent className="w-4 h-4" />}
                  min={0}
                  max={25}
                  step={0.5}
                  sliderValue={rate}
                  onChange={setRate}
                  minLabel="0%"
                  maxLabel="25%"
                />
              </div>
            </div>
            <p className="mt-8 text-xs text-slate-400 leading-relaxed">{t("mortgage.disclaimer")}</p>
          </div>

          {/* Result */}
          <div className="lg:col-span-2 relative overflow-hidden rounded-2xl p-7 sm:p-8 flex flex-col bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 text-white shadow-2xl shadow-teal-950/30 ring-1 ring-amber-400/15">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(ellipse 80% 60% at 80% 10%, rgba(245,158,11,0.16) 0%, transparent 60%)",
              }}
            />
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

            <div className="relative z-10 flex flex-col h-full gap-6">
              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <CircleDollarSign className="text-amber-400 w-5 h-5 shrink-0" />
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-widest truncate">
                    {t("monthlyPayment")}
                  </span>
                </div>
                <div className="flex p-0.5 rounded-full gap-0.5 bg-black/30 border border-white/10 shrink-0">
                  {(["GEL", "USD"] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      aria-pressed={currency === curr}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest transition-all duration-200 ${
                        currency === curr
                          ? "bg-amber-400 text-teal-950 shadow-md"
                          : "text-white/50 hover:text-white/80"
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-amber-300/80 text-xs uppercase tracking-[0.2em] mb-1">
                  {t("mortgage.perMonth")}
                </p>
                <p className="text-4xl sm:text-5xl font-semibold text-white tracking-tight tabular-nums">
                  {display(monthlyPayment)}
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-1.5 text-xs text-white/50">
                  <span>
                    {t("downPayment")} · {downPct}%
                  </span>
                  <span>
                    {t("loan")} · {100 - downPct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-400 to-amber-300"
                    style={{ width: `${downPct}%` }}
                  />
                </div>
              </div>

              <dl className="space-y-3 border-t border-white/10 pt-4 flex-1 text-xs">
                <Row label={t("loanAmount")} value={display(loanAmount)} />
                <Row label={t("equityShare")} value={`${downPct}%`} />
                <Row label={t("loanTerm")} value={`${months / 12} ${t("years")}`} />
                <Row label={t("mortgage.totalInterest")} value={display(totalInterest)} />
                <Row label={t("mortgage.totalPayment")} value={display(totalPayment)} strong />
              </dl>

              <Link
                href={ROUTES.CONTACT}
                className="group w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 bg-amber-400 text-teal-950 shadow-lg shadow-amber-400/30 hover:bg-amber-300 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                {t("mortgageCta")}
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <dt className="flex items-center gap-2 text-white/55">
        <span className={`w-1.5 h-1.5 rounded-full ${strong ? "bg-amber-400" : "bg-white/25"}`} />
        {label}
      </dt>
      <dd className={`tabular-nums ${strong ? "text-amber-300 font-semibold text-sm" : "text-white font-medium"}`}>
        {value}
      </dd>
    </div>
  );
}

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

function SliderRow({ label, value, icon, min, max, step, sliderValue, onChange, minLabel, maxLabel }: SliderRowProps) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-3 gap-3">
        <div className="min-w-0">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-lg sm:text-xl font-semibold text-teal-950 tracking-tight tabular-nums truncate">{value}</p>
        </div>
        <div className="shrink-0 p-2 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 transition-transform duration-200 group-hover:scale-105">
          {icon}
        </div>
      </div>
      <Slider
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[sliderValue]}
        onValueChange={(v) => onChange(v[0])}
        className="[&_[data-slot=slider-track]]:bg-slate-200 [&_[data-slot=slider-range]]:bg-teal-800 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-teal-800 [&_[data-slot=slider-thumb]]:size-5"
      />
      <div className="flex justify-between mt-2 text-[11px] text-slate-400">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default MortgageCalculator;
