import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Footer from "@/components/footer/Footer";
import { getPageMetadata } from "@/lib/getMetadata";
import { CurrencyProvider } from "@/lib/currency";
import { QueryProvider } from "@/lib/providers/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export async function generateMetadata() {
  const meta = await getPageMetadata("home");
  return {
    ...meta,
    icons: {
      icon: "/favicon.png",
      apple: "/favicon.png",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const plainMessages = JSON.parse(JSON.stringify(messages));

  return (
    <html lang={locale} data-locale={locale}>
      <body
        className={`${inter.variable} antialiased`}
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontWeight: 300,
        }}
        suppressHydrationWarning
      >
        <QueryProvider>
          <NextIntlClientProvider messages={plainMessages}>
            <Header />
            <CurrencyProvider>
              <main>{children}</main>
            </CurrencyProvider>
            <Footer />
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
