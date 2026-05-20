"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AboutSection() {
  return (
    <section className="py-24 px-6 bg-white/30 border-y border-glass">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        >
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-4 block">
            THE CURATOR
          </span>
          <h2 className="font-[family-name:var(--font-orbitron)] text-[2rem] font-[800] text-primary leading-none mb-2">
            OSAMA K. ELLAFI
          </h2>
          <h3 className="font-[family-name:var(--font-orbitron)] text-[1rem] text-dim mb-8">
            AUTOMATION ENGINEER
          </h3>
          
          <div className="w-12 h-[3px] bg-primary/30 rounded-full mb-8" />

          <p className="font-[family-name:var(--font-inter)] text-dim mb-8 leading-relaxed">
            I build autonomous systems that eliminate manual work. My philosophy is simple: if a computer can do it, a human shouldn't. This gallery serves as a public archive of the architectures, workflows, and integrations I've engineered to solve real business problems.
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {["n8n", "Make.com", "Google Apps Script", "Firebase", "REST APIs", "Node.js"].map((skill) => (
              <span key={skill} className="glass px-3 py-1 rounded-full font-[family-name:var(--font-orbitron)] text-[9px] uppercase text-dim">
                {skill}
              </span>
            ))}
          </div>

          <div className="glass-premium border-l-[3px] border-l-primary p-6 rounded-xl">
            <span className="block font-[family-name:var(--font-inter)] text-dim text-sm mb-1">Building toward:</span>
            <span className="block font-[family-name:var(--font-orbitron)] text-primary font-bold tracking-wider mb-2">AUTONOMIX</span>
            <Link href="https://www.autonomix.ly" target="_blank" className="font-[family-name:var(--font-inter)] text-xs text-dim underline hover:text-primary transition-colors">
              Visit Company →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
          className="glass-premium rounded-[32px] p-8 aspect-square relative overflow-hidden flex flex-col justify-center items-center text-center"
        >
          {/* Abstract visual representation instead of image */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]" />
          <h3 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-primary mb-2 relative z-10">2M+</h3>
          <p className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase relative z-10 mb-8">Tasks Automated</p>
          
          <h3 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-primary mb-2 relative z-10">10,000+</h3>
          <p className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase relative z-10 mb-8">Hours Saved</p>
          
          <h3 className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-primary mb-2 relative z-10">99.9%</h3>
          <p className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase relative z-10">System Reliability</p>
        </motion.div>
      </div>
    </section>
  );
}
