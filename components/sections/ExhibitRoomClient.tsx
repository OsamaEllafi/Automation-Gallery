"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useWorkflow, useAllWorkflows } from "@/hooks/useWorkflows";
import NodeMapSVG from "@/components/sections/NodeMapSVG";

interface ExhibitRoomClientProps {
  id: string;
}

export default function ExhibitRoomClient({ id }: ExhibitRoomClientProps) {
  const { workflow, loading } = useWorkflow(id);
  const { workflows } = useAllWorkflows();

  // Find next and previous exhibits
  const currentIndex = workflows.findIndex(w => w.workflow_id === id);
  const prevWorkflow = currentIndex > 0 ? workflows[currentIndex - 1] : null;
  const nextWorkflow = currentIndex >= 0 && currentIndex < workflows.length - 1 ? workflows[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-[900px] mx-auto min-h-screen flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
        <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
          Loading Exhibit Room...
        </span>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-[900px] mx-auto min-h-screen flex flex-col items-center justify-center text-center">
        <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-primary mb-4">
          EXHIBIT NOT FOUND
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-dim mb-8">
          The requested automation exhibit does not exist in the collection or has been archived.
        </p>
        <Link href="/gallery" className="btn-outline">
          Return to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 max-w-[900px] mx-auto min-h-screen">
      
      {/* Header Block */}
      <div className="relative mb-16">
        <span className="absolute -top-10 -left-4 font-[family-name:var(--font-orbitron)] font-bold text-[8rem] text-primary opacity-[0.02] -z-10 leading-none pointer-events-none select-none">
          {workflow.workflow_id}
        </span>
        
        <div className="flex items-center gap-2 font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-widest mb-6">
          <Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
          <span>→</span>
          <span>{workflow.category}</span>
          <span>→</span>
          <span className="text-primary">{workflow.name}</span>
        </div>

        <h1 className="font-[family-name:var(--font-orbitron)] text-[clamp(2rem,4vw,3.5rem)] font-[800] text-primary leading-tight mb-4 uppercase">
          {workflow.name}
        </h1>

        <p className="font-[family-name:var(--font-inter)] text-[1.1rem] text-dim max-w-[640px] mb-6">
          {workflow.short_description}
        </p>

        <div className="flex flex-wrap gap-4 font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-wider">
          <span className="glass px-3 py-1 rounded-full">{workflow.trigger_type} Trigger</span>
          <span className="glass px-3 py-1 rounded-full">Built: {workflow.date_built}</span>
          <span className="glass px-3 py-1 rounded-full">{workflow.total_nodes} Nodes</span>
          <span className="glass px-3 py-1 rounded-full">{workflow.automation_percentage}% Automated</span>
        </div>
      </div>

      {/* Block A: Node Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 w-full"
      >
        <NodeMapSVG nodes={workflow.node_map_data} primaryIntegration={workflow.primary_integration} />
      </motion.div>

      {/* Block B: The Story */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
      >
        <div className="glass p-8 rounded-2xl">
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-4 block">
            THE PROBLEM
          </span>
          <p className="font-[family-name:var(--font-inter)] text-main text-sm leading-relaxed whitespace-pre-line">
            {workflow.problem}
          </p>
        </div>
        <div className="glass p-8 rounded-2xl">
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-4 block">
            THE SOLUTION
          </span>
          <p className="font-[family-name:var(--font-inter)] text-main text-sm leading-relaxed whitespace-pre-line">
            {workflow.solution}
          </p>
        </div>
      </motion.div>

      {/* Block C: Detailed Narrative & Connected Tools */}
      {workflow.long_description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-premium p-8 rounded-[24px] border border-glass mb-16"
        >
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-4 block">
            ARCHITECTURAL OVERVIEW
          </span>
          <p className="font-[family-name:var(--font-inter)] text-main text-sm leading-relaxed mb-6">
            {workflow.long_description}
          </p>
          
          <div className="border-t border-glass/40 pt-6 mt-6">
            <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-wider block mb-3">
              Connected Integrations
            </span>
            <div className="flex flex-wrap gap-2">
              {workflow.connected_services.map((service) => (
                <span key={service} className="glass px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-inter)] text-primary">
                  {service}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center border-t border-glass pt-8 mt-16">
        {prevWorkflow ? (
          <Link href={`/gallery/${prevWorkflow.workflow_id}`} className="glass px-6 py-3 rounded-full flex items-center gap-2 hover:border-primary/20 transition-colors font-[family-name:var(--font-orbitron)] text-[10px] uppercase text-dim hover:text-primary">
            <FaChevronLeft size={10} /> PREVIOUS EXHIBIT
          </Link>
        ) : (
          <div className="opacity-0 pointer-events-none" />
        )}
        {nextWorkflow ? (
          <Link href={`/gallery/${nextWorkflow.workflow_id}`} className="glass px-6 py-3 rounded-full flex items-center gap-2 hover:border-primary/20 transition-colors font-[family-name:var(--font-orbitron)] text-[10px] uppercase text-dim hover:text-primary">
            NEXT EXHIBIT <FaChevronRight size={10} />
          </Link>
        ) : (
          <div className="opacity-0 pointer-events-none" />
        )}
      </div>

    </div>
  );
}
