"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaChevronUp } from "react-icons/fa";
import { useWorkflow, useAllWorkflows } from "@/hooks/useWorkflows";
import NodeMapSVG from "@/components/sections/NodeMapSVG";
import { getWorkflowsByIds } from "@/lib/firestore";
import { Workflow } from "@/types/workflow";

interface ExhibitRoomClientProps {
  id: string;
}

export default function ExhibitRoomClient({ id }: ExhibitRoomClientProps) {
  const { workflow, loading } = useWorkflow(id);
  const { workflows } = useAllWorkflows();

  const [relatedWorkflows, setRelatedWorkflows] = useState<Workflow[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Find next and previous exhibits
  const currentIndex = workflows.findIndex(w => w.workflow_id === id);
  const prevWorkflow = currentIndex > 0 ? workflows[currentIndex - 1] : null;
  const nextWorkflow = currentIndex >= 0 && currentIndex < workflows.length - 1 ? workflows[currentIndex + 1] : null;

  // Load related workflows
  useEffect(() => {
    if (workflow?.related_workflow_ids && workflow.related_workflow_ids.length > 0) {
      setLoadingRelated(true);
      getWorkflowsByIds(workflow.related_workflow_ids)
        .then(res => setRelatedWorkflows(res))
        .catch(err => console.error("Error loading related workflows:", err))
        .finally(() => setLoadingRelated(false));
    } else {
      setRelatedWorkflows([]);
    }
  }, [workflow?.related_workflow_ids]);

  // Scroll to top state listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

        <div className="flex flex-wrap gap-3 font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-wider">
          <span className="glass px-3 py-1 rounded-full">{workflow.trigger_type} Trigger</span>
          <span className="glass px-3 py-1 rounded-full">Built: {workflow.date_built}</span>
          <span className="glass px-3 py-1 rounded-full">{workflow.total_nodes} Nodes</span>
          <span className="glass px-3 py-1 rounded-full">{workflow.automation_percentage}% Automated</span>
          <span className="glass px-3 py-1 rounded-full bg-primary/5 text-primary border border-glass font-bold">
            COMPLEXITY: {["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"][(workflow.complexity_score || 3) - 1]}
          </span>
        </div>

        {/* Display Tags */}
        {workflow.tags && workflow.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {workflow.tags.map(tag => (
              <span key={tag} className="text-[9px] font-[family-name:var(--font-orbitron)] bg-black/5 text-dim border border-glass/40 px-2.5 py-1 rounded-md tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
        )}
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

      {/* Block D: Video Demo & Download JSON */}
      {(workflow.demo_video_url || workflow.json_export_url) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          <div className="glass p-6 rounded-2xl flex flex-col gap-4">
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase">
              SYSTEM IN ACTION
            </span>
            {workflow.demo_video_url ? (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/10 border border-glass">
                {workflow.demo_video_url.includes("youtube.com") || workflow.demo_video_url.includes("youtu.be") ? (
                  <iframe
                    src={workflow.demo_video_url.includes("watch?v=") 
                      ? workflow.demo_video_url.replace("watch?v=", "embed/") 
                      : workflow.demo_video_url.replace("youtu.be/", "youtube.com/embed/")}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    title="Demo Video"
                  />
                ) : (
                  <video
                    src={workflow.demo_video_url}
                    controls
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center py-8 opacity-60">
                <p className="font-[family-name:var(--font-inter)] text-xs text-dim">No video demonstration available for this exhibit.</p>
              </div>
            )}
          </div>

          <div className="glass p-6 rounded-2xl flex flex-col justify-between gap-6">
            <div>
              <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase block mb-3">
                INTELLIGENT SYSTEM EXPORT
              </span>
              <p className="font-[family-name:var(--font-inter)] text-xs text-dim leading-relaxed">
                Download the blueprint JSON of this n8n automation pipeline. You can import this directly into your n8n workspace to instantiate the workflow structure.
              </p>
            </div>
            {workflow.json_export_url ? (
              <a
                href={workflow.json_export_url}
                download
                target="_blank"
                rel="noreferrer"
                className="btn-primary w-full text-center flex items-center justify-center gap-2 py-3.5"
              >
                DOWNLOAD WORKFLOW JSON
              </a>
            ) : (
              <button
                disabled
                className="btn-outline w-full cursor-not-allowed opacity-50 text-center flex items-center justify-center gap-2 py-3.5"
              >
                BLUEPRINT NOT PUBLICLY AVAILABLE
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Block E: Related Workflows */}
      {relatedWorkflows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 border-t border-glass pt-12"
        >
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-6 block">
            RELATED WORKFLOWS
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedWorkflows.map((rw) => (
              <Link href={`/gallery/${rw.workflow_id}`} key={rw.workflow_id}>
                <div className="glass p-6 rounded-2xl hover:border-primary/20 transition-all flex flex-col h-full justify-between cursor-pointer group">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-[family-name:var(--font-orbitron)] text-[9px] uppercase glass px-2.5 py-0.5 rounded-full text-primary font-bold">
                        {rw.workflow_id}
                      </span>
                      <span className="font-[family-name:var(--font-orbitron)] text-[9px] uppercase text-dim tracking-wider">
                        {rw.category}
                      </span>
                    </div>
                    <h4 className="font-[family-name:var(--font-orbitron)] font-bold text-sm text-primary mb-2 group-hover:text-primary transition-colors">
                      {rw.name}
                    </h4>
                    <p className="font-[family-name:var(--font-inter)] text-xs text-dim line-clamp-2">
                      {rw.short_description}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-glass/40 flex justify-between items-center text-[9px] font-[family-name:var(--font-orbitron)] text-dim uppercase">
                    <span>{rw.total_nodes} nodes</span>
                    <span className="text-primary font-bold group-hover:underline">View Exhibit →</span>
                  </div>
                </div>
              </Link>
            ))}
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

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-[100] glass p-3.5 rounded-full shadow-lg text-primary hover:border-primary/30 transition-all cursor-pointer"
            aria-label="Scroll to top"
          >
            <FaChevronUp size={14} />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
