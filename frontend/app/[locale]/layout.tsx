import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header/Header";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Footer from "@/components/footer/Footer";
import { getPageMetadata } from "@/lib/getMetadata";
import { CurrencyProvider } from "@/lib/currency";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/components/shared/ConfirmDialog";
import { NavigationProgress } from "@/components/shared/NavigationProgress";

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
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icons/favicon-64.png", type: "image/png", sizes: "64x64" },
        { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
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

  if (!hasLocale(routing.locales, locale)) {
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
            <ConfirmProvider>
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <Header />
              <CurrencyProvider>
                <main id="main-content">{children}</main>
              </CurrencyProvider>
              <Footer />
              <Toaster position="top-center" richColors closeButton />
            </ConfirmProvider>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
