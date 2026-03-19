"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { locales } from "./routing";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Locale = "en" | "ka";

const LanguageFlags: Record<Locale, { src: string; alt: string }> = {
  en: { src: "/svg/English.svg", alt: "English" },
  ka: { src: "/svg/Georgian.svg", alt: "Georgian" },
};

const languageNames: Record<Locale, string> = {
  en: "English",
  ka: "ქართული",
};

export default function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    // Set cookie so middleware knows which locale to use
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    startTransition(() => {
      router.refresh();
    });
  };

  const currentFlag = LanguageFlags[currentLocale];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl h-10 px-3 transition-all duration-300 border border-[rgba(255,255,255,0.2)] bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] text-white group">
          <Image
            src={currentFlag.src}
            alt={currentFlag.alt}
            width={20}
            height={20}
            className="h-5 w-5 rounded-sm object-cover"
          />
          <span
            className={cn(
              "text-sm font-semibold uppercase tracking-wider hidden sm:inline-block",
              isPending && "opacity-50",
            )}
          >
            {currentLocale}
          </span>
          <ChevronDownIcon className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-40 p-1.5 border-[rgba(255,255,255,0.1)] bg-[#0a1a3f]/90 backdrop-blur-xl text-white shadow-2xl rounded-2xl"
      >
        <div className="grid gap-1">
          {(locales as unknown as Locale[]).map((locale) => {
            const flag = LanguageFlags[locale];
            const isActive = locale === currentLocale;
            return (
              <Button
                key={locale}
                variant="ghost"
                className={cn(
                  "justify-start gap-3 w-full rounded-xl hover:bg-white/10 hover:text-white transition-all",
                  isActive && "bg-white/5 text-[#4A9FF5]",
                )}
                onClick={() => handleLocaleChange(locale)}
              >
                <Image
                  src={flag.src}
                  alt={flag.alt}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-sm"
                />
                <span className="text-sm font-medium">
                  {languageNames[locale]}
                </span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
