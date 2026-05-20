"use client";

import Link from "next/link";
import { FaGithub, FaLinkedin, FaArrowUp } from "react-icons/fa";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0f1117] border-t border-white/5 py-10 lg:py-12 mt-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-8 text-center md:text-left">
          
          <div className="flex flex-col gap-2 items-center md:items-start">
            <span className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-white">
              OSAMA
            </span>
            <span className="font-[family-name:var(--font-inter)] text-xs text-white/30">
              © {new Date().getFullYear()} Osama K. Ellafi. All rights reserved.
            </span>
          </div>

          <div className="flex justify-center gap-6">
            {["Gallery", "Archive", "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="font-[family-name:var(--font-orbitron)] tracking-[0.2em] uppercase text-white/30 hover:text-white transition-colors text-xs"
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="flex justify-center md:justify-end gap-6 items-center">
            <Link href="https://github.com/osama" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors">
              <FaGithub size={18} />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://linkedin.com/in/osama" target="_blank" rel="noreferrer" className="text-white/30 hover:text-white transition-colors">
              <FaLinkedin size={18} />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <button
              onClick={scrollToTop}
              className="text-white/30 hover:text-white transition-colors ml-2"
              aria-label="Back to top"
            >
              <FaArrowUp size={18} />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
}
