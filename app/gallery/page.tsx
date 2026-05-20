import GallerySection from "@/components/sections/GallerySection";

export const metadata = {
  title: "Gallery — The Automation Gallery",
  description: "Browse the complete collection of automated systems and workflows.",
};

export default function GalleryPage() {
  return (
    <div className="pt-20">
      <div className="flex flex-col items-center text-center mt-12 mb-8 px-6">
        <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-primary mb-4">
          THE FULL COLLECTION
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-dim max-w-2xl">
          Browse through all exhibits. Use filters to find specific automation use cases or integrations.
        </p>
      </div>
      
      {/* Search & Filter Bar could go here */}

      <GallerySection />
    </div>
  );
}
