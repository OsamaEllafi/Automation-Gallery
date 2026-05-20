"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLiveWorkflows } from "@/hooks/useWorkflows";
import { 
  FaPlay, FaClock, FaLink, FaSlack, FaEnvelope, FaCode, 
  FaDatabase, FaCheckCircle, FaTrello, FaGithub, FaRobot, 
  FaWhatsapp, FaFilter, FaListUl, FaQuestion, FaArrowRight,
  FaExchangeAlt
} from "react-icons/fa";

interface GallerySectionProps {
  featuredOnly?: boolean;
}

const getMiniNodeIcon = (label: string, type: string) => {
  const lowerLabel = label.toLowerCase();
  if (type === "trigger") {
    if (lowerLabel.includes("schedule") || lowerLabel.includes("cron") || lowerLabel.includes("time") || lowerLabel.includes("clock")) {
      return <FaClock className="text-[10px] text-[#ff6d5a]" />;
    }
    if (lowerLabel.includes("webhook") || lowerLabel.includes("api") || lowerLabel.includes("receive")) {
      return <FaLink className="text-[10px] text-[#ff6d5a]" />;
    }
    return <FaPlay className="text-[10px] text-[#ff6d5a]" />;
  }
  
  if (type === "condition" || lowerLabel.includes("if") || lowerLabel.includes("switch") || lowerLabel.includes("filter")) {
    return <FaFilter className="text-[10px] text-amber-500" />;
  }
  
  if (lowerLabel.includes("slack")) return <FaSlack className="text-[10px] text-purple-400" />;
  if (lowerLabel.includes("gmail") || lowerLabel.includes("mail") || lowerLabel.includes("email")) return <FaEnvelope className="text-[10px] text-red-400" />;
  if (lowerLabel.includes("sheet") || lowerLabel.includes("excel")) return <FaListUl className="text-[10px] text-emerald-400" />;
  if (lowerLabel.includes("airtable")) return <FaExchangeAlt className="text-[10px] text-cyan-400" />;
  if (lowerLabel.includes("trello")) return <FaTrello className="text-[10px] text-blue-400" />;
  if (lowerLabel.includes("github")) return <FaGithub className="text-[10px] text-neutral-300" />;
  if (lowerLabel.includes("openai") || lowerLabel.includes("gpt") || lowerLabel.includes("ai") || lowerLabel.includes("llm")) return <FaRobot className="text-[10px] text-purple-300" />;
  if (lowerLabel.includes("whatsapp")) return <FaWhatsapp className="text-[10px] text-green-400" />;
  if (lowerLabel.includes("database") || lowerLabel.includes("postgres") || lowerLabel.includes("sql") || lowerLabel.includes("mysql")) return <FaDatabase className="text-[10px] text-blue-400" />;
  if (lowerLabel.includes("code") || lowerLabel.includes("js") || lowerLabel.includes("javascript") || lowerLabel.includes("python")) return <FaCode className="text-[10px] text-indigo-400" />;
  
  if (type === "output" || lowerLabel.includes("complete") || lowerLabel.includes("end") || lowerLabel.includes("finish")) {
    return <FaCheckCircle className="text-[10px] text-[#10b981]" />;
  }
  
  return <FaCode className="text-[10px] text-neutral-400" />;
};

const getMiniNodeColor = (type: string) => {
  switch (type) {
    case "trigger":
      return "#ff6d5a";
    case "condition":
      return "#ffb300";
    case "integration":
      return "#6366f1";
    case "action":
      return "#06b6d4";
    case "output":
      return "#10b981";
    default:
      return "#9ca3af";
  }
};

export default function GallerySection({ featuredOnly = false }: GallerySectionProps) {
  const { workflows, loading, error } = useLiveWorkflows(20); // Get recent workflows

  // Filter if featuredOnly is active
  const displayedWorkflows = featuredOnly 
    ? workflows.filter(w => w.featured).slice(0, 3) 
    : workflows;

  if (loading) {
    return (
      <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin" />
        <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest mt-4">
          Loading Exhibit Room...
        </span>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <p className="font-[family-name:var(--font-inter)] text-red-500">
          Failed to load exhibition data. Please check your connection.
        </p>
      </section>
    );
  }

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-center text-center mb-16">
        <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-4">
          {featuredOnly ? "THE SELECTION" : "THE COLLECTION"}
        </span>
        <h2 className="font-[family-name:var(--font-orbitron)] text-[2.5rem] font-bold text-primary mb-6">
          {featuredOnly ? "FEATURED EXHIBITS" : "ALL EXHIBITED WORKS"}
        </h2>
        <div className="w-12 h-[3px] bg-primary/30 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {displayedWorkflows.map((workflow, index) => (
          <Link href={`/gallery/${workflow.workflow_id}`} key={workflow.workflow_id || index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-premium rounded-[24px] p-7 cursor-pointer group hover:border-primary/20 transition-all flex flex-col h-full"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="font-[family-name:var(--font-orbitron)] text-[9px] uppercase glass px-3 py-1 rounded-full text-primary font-bold">
                  {workflow.workflow_id}
                </span>
                <span className="font-[family-name:var(--font-orbitron)] text-[9px] uppercase text-dim tracking-wider">
                  {workflow.trigger_type}
                </span>
              </div>

              {/* Mini visual representation of nodes */}
              {(() => {
                const nodes = workflow.node_map_data || [];
                const displayNodes = nodes.length > 0 ? nodes.slice(0, 4) : [{ label: "Trigger", type: "trigger" }];
                
                const canvasWidth = 240;
                const canvasHeight = 120;
                const spacing = canvasWidth / (displayNodes.length + 1);
                
                const coords = displayNodes.map((n, idx) => ({
                  ...n,
                  x: spacing * (idx + 1),
                  y: canvasHeight / 2 - 5
                }));
                
                let pathD = "";
                if (coords.length > 1) {
                  pathD = `M ${coords[0].x} ${coords[0].y}`;
                  for (let i = 1; i < coords.length; i++) {
                    pathD += ` L ${coords[i].x} ${coords[i].y}`;
                  }
                }

                return (
                  <div className="w-full h-[180px] bg-black/40 border border-glass rounded-xl mb-6 flex items-center justify-center p-2 overflow-hidden relative">
                    <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-full">
                      {/* Grid pattern background */}
                      <defs>
                        <pattern id={`mini-grid-${workflow.workflow_id}-${index}`} width="16" height="16" patternUnits="userSpaceOnUse">
                          <circle cx="2" cy="2" r="0.8" fill="rgba(255, 255, 255, 0.05)" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#mini-grid-${workflow.workflow_id}-${index})`} />

                      {/* Connection Line */}
                      {pathD && (
                        <>
                          <path
                            d={pathD}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="3"
                          />
                          <path
                            d={pathD}
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.25)"
                            strokeWidth="1.5"
                            strokeDasharray="4, 4"
                          />
                        </>
                      )}

                      {/* Node Badges */}
                      {coords.map((n, idx) => {
                        const color = getMiniNodeColor(n.type);
                        return (
                          <g key={idx}>
                            {/* Inner Circle background */}
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={13}
                              fill="rgba(15, 17, 23, 0.95)"
                              stroke={color}
                              strokeWidth="1"
                            />
                            {/* Brand Icon */}
                            <foreignObject x={n.x - 7} y={n.y - 7} width={14} height={14}>
                              <div className="flex items-center justify-center h-full w-full opacity-90">
                                {getMiniNodeIcon(n.label, n.type)}
                              </div>
                            </foreignObject>
                            
                            {/* Short label */}
                            <text
                              x={n.x}
                              y={n.y + 24}
                              fill="rgba(255, 255, 255, 0.4)"
                              fontSize="6"
                              fontWeight="bold"
                              fontFamily="var(--font-orbitron)"
                              textAnchor="middle"
                              className="uppercase tracking-wider"
                            >
                              {n.label.length > 10 ? n.label.slice(0, 8) + ".." : n.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                );
              })()}

              <h3 className="font-[family-name:var(--font-orbitron)] font-semibold text-main mb-2 text-md leading-tight group-hover:text-primary transition-colors">
                {workflow.name}
              </h3>
              <p className="font-[family-name:var(--font-inter)] text-[0.85rem] text-dim line-clamp-2 mb-4 leading-relaxed">
                {workflow.short_description}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-[family-name:var(--font-orbitron)] text-[8px] text-dim tracking-wider uppercase mt-auto pt-4 border-t border-glass/40">
                <span>{workflow.total_nodes} NODES</span>
                <span>•</span>
                <span>{workflow.automation_percentage}% AUTOMATED</span>
                <span>•</span>
                <span>{workflow.category}</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {featuredOnly && (
        <div className="mt-16 flex justify-center">
          <Link href="/gallery" className="btn-outline">
            VIEW FULL COLLECTION
          </Link>
        </div>
      )}
    </section>
  );
}
