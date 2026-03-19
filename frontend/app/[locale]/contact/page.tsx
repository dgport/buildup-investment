import { getPageMetadata } from "@/lib/getMetadata";
import ContactSection from "./_components/ContactSection";

export async function generateMetadata() {
  return getPageMetadata("contact");
}

export default function Page() {
  return <ContactSection />;
}
