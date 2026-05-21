"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Terminal", href: "/" },
    { name: "Gallery", href: "/gallery" },
    { name: "Archive", href: "/archive" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <div className="fixed top-5 left-0 w-full z-[100] flex justify-center px-4">
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        className={`
          flex items-center justify-between px-6 py-3 rounded-full w-full max-w-[720px] transition-all duration-300 relative
          ${scrolled || mobileMenuOpen ? "bg-white/90 backdrop-blur-xl shadow-lg border border-glass" : "bg-white/50 backdrop-blur-md border border-transparent"}
        `}
      >
        <Link href="/" className="flex flex-col">
          <span className="font-[family-name:var(--font-orbitron)] font-bold text-primary text-lg tracking-widest leading-none">
            OSAMA
          </span>
          <span className="font-[family-name:var(--font-inter)] text-dim text-[10px] tracking-widest uppercase mt-1">
            Automation Engineer
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (pathname.startsWith("/gallery") && link.href === "/gallery");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative font-[family-name:var(--font-orbitron)] text-[11px] uppercase tracking-widest transition-colors ${
                  isActive ? "text-primary font-bold" : "text-dim hover:text-primary"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-primary hover:text-secondary focus:outline-none p-1 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-[60px] left-0 w-full glass rounded-[24px] p-6 flex flex-col gap-4 shadow-xl z-50 md:hidden"
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (pathname.startsWith("/gallery") && link.href === "/gallery");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`font-[family-name:var(--font-orbitron)] text-[13px] uppercase tracking-widest py-2 border-b border-glass/40 transition-colors ${
                      isActive ? "text-primary font-bold" : "text-dim hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
