"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import { useStats } from "@/hooks/useStats";

export default function HeroSection() {
  const { stats: dbStats, loading } = useStats();
  const [stats, setStats] = useState({ workflows: 0, nodes: 0, categories: 0, automation: 0 });

  useEffect(() => {
    // If database stats are still loading, start a default animation
    // Once loaded, it will animate to the correct DB values.
    const targetWorkflows = dbStats ? dbStats.total_workflows : 3;
    const targetNodes = dbStats ? dbStats.total_nodes : 54;
    const targetCategories = dbStats ? dbStats.categories.length : 3;
    const targetAutomation = dbStats ? dbStats.avg_automation : 91; // Dynamically computed average

    const controlsWorkflows = animate(0, targetWorkflows, {
      duration: 1.5,
      onUpdate: (value) => setStats(prev => ({ ...prev, workflows: Math.floor(value) }))
    });

    const controlsNodes = animate(0, targetNodes, {
      duration: 1.5,
      onUpdate: (value) => setStats(prev => ({ ...prev, nodes: Math.floor(value) }))
    });

    const controlsCategories = animate(0, targetCategories, {
      duration: 1.5,
      onUpdate: (value) => setStats(prev => ({ ...prev, categories: Math.floor(value) }))
    });

    const controlsAutomation = animate(0, targetAutomation, {
      duration: 1.5,
      onUpdate: (value) => setStats(prev => ({ ...prev, automation: Math.floor(value) }))
    });

    return () => {
      controlsWorkflows.stop();
      controlsNodes.stop();
      controlsCategories.stop();
      controlsAutomation.stop();
    };
  }, [dbStats, loading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden">
      
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
          className="font-[family-name:var(--font-orbitron)] font-bold uppercase text-[clamp(80px,15vw,180px)] text-[#0f1117] select-none text-center leading-none tracking-tight blur-[1px]"
        >
          AUTOMATION
        </motion.span>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-4xl mx-auto"
      >
        <motion.span variants={itemVariants} className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-[0.3em] text-dim uppercase mb-6">
          OSAMA AUTOMATION ENGINEER · EST. 2020
        </motion.span>

        <motion.h1 variants={itemVariants} className="font-[family-name:var(--font-orbitron)] text-[clamp(2.5rem,5vw,4.5rem)] font-[800] leading-tight text-primary mb-8">
          THE AUTOMATION<br/>GALLERY
        </motion.h1>

        <motion.div variants={itemVariants} className="w-12 h-[3px] bg-primary/30 mb-8 rounded-full" />

        <motion.p variants={itemVariants} className="font-[family-name:var(--font-inter)] text-lg text-dim max-w-[500px] mb-12">
          A curated archive of real-world automation systems, n8n workflows, and intelligent process engineering.
        </motion.p>

        {/* Live Stats Bar */}
        <motion.div variants={itemVariants} className="glass px-8 py-4 rounded-full flex flex-wrap items-center justify-center gap-4 md:gap-8 mb-12">
          <div className="flex items-center gap-2 font-[family-name:var(--font-orbitron)] text-sm">
            <span className="font-bold text-primary">{stats.workflows}</span>
            <span className="text-dim text-[10px] tracking-widest uppercase">Workflows</span>
          </div>
          <span className="text-dim/30 hidden md:block">•</span>
          <div className="flex items-center gap-2 font-[family-name:var(--font-orbitron)] text-sm">
            <span className="font-bold text-primary">{stats.nodes}</span>
            <span className="text-dim text-[10px] tracking-widest uppercase">Nodes Deployed</span>
          </div>
          <span className="text-dim/30 hidden md:block">•</span>
          <div className="flex items-center gap-2 font-[family-name:var(--font-orbitron)] text-sm">
            <span className="font-bold text-primary">{stats.categories}</span>
            <span className="text-dim text-[10px] tracking-widest uppercase">Categories</span>
          </div>
          <span className="text-dim/30 hidden md:block">•</span>
          <div className="flex items-center gap-2 font-[family-name:var(--font-orbitron)] text-sm">
            <span className="font-bold text-primary">{stats.automation}%</span>
            <span className="text-dim text-[10px] tracking-widest uppercase">Avg. Automation</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <Link href="/gallery" className="btn-primary">
            Enter the Gallery
          </Link>
          <Link href="/about" className="btn-outline">
            View About
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-dim animate-bounce"
      >
        <FaChevronDown size={24} className="opacity-50" />
      </motion.div>
    </section>
  );
}
