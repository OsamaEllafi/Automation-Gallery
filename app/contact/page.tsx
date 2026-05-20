import ContactSection from "@/components/sections/ContactSection";

export const metadata = {
  title: "Contact — The Automation Gallery",
  description: "Get in touch for collaboration, consulting, or just to talk automation.",
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      <ContactSection />
    </div>
  );
}
