import HeroSection from "@/components/sections/HeroSection";
import GallerySection from "@/components/sections/GallerySection";
import AboutSection from "@/components/sections/AboutSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <GallerySection featuredOnly />
      <AboutSection />
      <ContactSection />
    </>
  );
}
