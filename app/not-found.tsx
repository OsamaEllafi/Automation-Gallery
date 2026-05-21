"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaHome, FaCompass } from "react-icons/fa";

export default function NotFound() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden">
      {/* Animated radial background glow */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,17,23,0.06)_0%,transparent_60%)] blur-[50px]"
        />
      </div>

      {/* Decorative watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.span 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="font-[family-name:var(--font-orbitron)] font-bold uppercase text-[clamp(120px,25vw,260px)] text-[#0f1117] select-none text-center leading-none tracking-tight blur-[1px]"
        >
          404
        </motion.span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-xl mx-auto"
      >
        <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-[0.3em] text-dim uppercase mb-6">
          SYSTEM ERROR · ROUTE NOT FOUND
        </span>

        <h1 className="font-[family-name:var(--font-orbitron)] text-3xl sm:text-4xl font-[800] leading-tight text-primary mb-6">
          OUT OF BOUNDS
        </h1>

        <div className="w-12 h-[3px] bg-primary/30 mb-8 rounded-full" />

        <p className="font-[family-name:var(--font-inter)] text-base text-dim mb-12 max-w-md">
          The requested system node or automation flow does not exist, or has been relocated within the gallery network.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
          <Link href="/" className="btn-primary w-full sm:w-auto gap-2">
            <FaHome className="inline" /> Return Home
          </Link>
          <Link href="/gallery" className="btn-outline w-full sm:w-auto gap-2">
            <FaCompass className="inline" /> Explore Exhibits
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
