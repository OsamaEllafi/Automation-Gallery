"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaPlay, FaClock, FaLink, FaSlack, FaEnvelope, FaCode, 
  FaDatabase, FaCheckCircle, FaTrello, FaGithub, FaRobot, 
  FaWhatsapp, FaFilter, FaListUl, FaQuestion, FaArrowRight,
  FaExchangeAlt, FaGlobe, FaKey
} from "react-icons/fa";
import { NodeMapItem } from "@/types/workflow";

interface NodeMapSVGProps {
  nodes: NodeMapItem[];
  primaryIntegration?: string;
}

interface NodeWithCoords extends NodeMapItem {
  x: number;
  y: number;
  index: number;
}

export default function NodeMapSVG({ nodes, primaryIntegration }: NodeMapSVGProps) {
  const [selectedNode, setSelectedNode] = useState<NodeWithCoords | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeWithCoords | null>(null);
  const [doubleClickedNode, setDoubleClickedNode] = useState<NodeWithCoords | null>(null);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-dim text-sm font-[family-name:var(--font-inter)]">
        No node map data available.
      </div>
    );
  }

  // Calculate layout coordinates
  const maxNodesPerRow = 5;
  const isSingleRow = nodes.length <= maxNodesPerRow;
  const canvasWidth = 800;
  const canvasHeight = isSingleRow ? 180 : 400;

  const getCoordinates = (index: number, total: number) => {
    if (isSingleRow) {
      // Single row layout
      const spacing = canvasWidth / (total + 1);
      return {
        x: spacing * (index + 1),
        y: canvasHeight / 2,
      };
    } else {
      // Zig-zag two-row layout
      const row1Count = Math.min(total, maxNodesPerRow);
      const row2Count = total - row1Count;

      if (index < row1Count) {
        const spacing = canvasWidth / (row1Count + 1);
        return {
          x: spacing * (index + 1),
          y: 120,
        };
      } else {
        const spacing = canvasWidth / (row2Count + 1);
        const colIndex = index - row1Count;
        // Zig-zag: Row 2 goes right-to-left
        return {
          x: canvasWidth - (spacing * (colIndex + 1)),
          y: 280,
        };
      }
    }
  };

  // Generate node coordinates
  const nodesWithCoords = nodes.map((node, index) => {
    const coords = getCoordinates(index, nodes.length);
    return {
      ...node,
      ...coords,
      index,
    };
  });

  // Helper to generate path d attribute
  const generatePath = () => {
    if (nodesWithCoords.length < 2) return "";
    let d = `M ${nodesWithCoords[0].x} ${nodesWithCoords[0].y}`;
    
    for (let i = 1; i < nodesWithCoords.length; i++) {
      const p1 = nodesWithCoords[i - 1];
      const p2 = nodesWithCoords[i];
      
      // If same row, draw straight line
      if (Math.abs(p1.y - p2.y) < 50) {
        d += ` L ${p2.x} ${p2.y}`;
      } else {
        // Curve between rows
        const midX = p1.x;
        const midY = (p1.y + p2.y) / 2;
        d += ` C ${midX} ${p1.y}, ${midX} ${midY}, ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
      }
    }
    return d;
  };

  const getNodeIcon = (label: string, type: string) => {
    const lowerLabel = label.toLowerCase();
    if (type === "trigger") {
      if (lowerLabel.includes("schedule") || lowerLabel.includes("cron") || lowerLabel.includes("time") || lowerLabel.includes("clock")) {
        return <FaClock className="text-[11px] text-[#ff6d5a]" />;
      }
      if (lowerLabel.includes("webhook") || lowerLabel.includes("api") || lowerLabel.includes("receive")) {
        return <FaLink className="text-[11px] text-[#ff6d5a]" />;
      }
      return <FaPlay className="text-[11px] text-[#ff6d5a]" />;
    }
    
    if (type === "condition" || lowerLabel.includes("if") || lowerLabel.includes("switch") || lowerLabel.includes("filter")) {
      return <FaFilter className="text-[11px] text-amber-500" />;
    }
    
    if (lowerLabel.includes("slack")) return <FaSlack className="text-[11px] text-purple-400" />;
    if (lowerLabel.includes("gmail") || lowerLabel.includes("mail") || lowerLabel.includes("email")) return <FaEnvelope className="text-[11px] text-red-400" />;
    if (lowerLabel.includes("sheet") || lowerLabel.includes("excel")) return <FaListUl className="text-[11px] text-emerald-400" />;
    if (lowerLabel.includes("airtable")) return <FaExchangeAlt className="text-[11px] text-cyan-400" />;
    if (lowerLabel.includes("trello")) return <FaTrello className="text-[11px] text-blue-400" />;
    if (lowerLabel.includes("github")) return <FaGithub className="text-[11px] text-neutral-300" />;
    if (lowerLabel.includes("openai") || lowerLabel.includes("gpt") || lowerLabel.includes("ai") || lowerLabel.includes("llm")) return <FaRobot className="text-[11px] text-purple-300" />;
    if (lowerLabel.includes("whatsapp")) return <FaWhatsapp className="text-[11px] text-green-400" />;
    if (lowerLabel.includes("database") || lowerLabel.includes("postgres") || lowerLabel.includes("sql") || lowerLabel.includes("mysql")) return <FaDatabase className="text-[11px] text-blue-400" />;
    if (lowerLabel.includes("code") || lowerLabel.includes("js") || lowerLabel.includes("javascript") || lowerLabel.includes("python")) return <FaCode className="text-[11px] text-indigo-400" />;
    
    if (type === "output" || lowerLabel.includes("complete") || lowerLabel.includes("end") || lowerLabel.includes("finish")) {
      return <FaCheckCircle className="text-[11px] text-[#10b981]" />;
    }
    
    return <FaCode className="text-[11px] text-neutral-400" />;
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "trigger":
        return "#ff6d5a"; // n8n orange
      case "condition":
        return "#ffb300"; // amber
      case "integration":
        return "#6366f1"; // indigo
      case "action":
        return "#06b6d4"; // cyan
      case "output":
        return "#10b981"; // green
      default:
        return "#9ca3af"; // gray
    }
  };

  const getMockData = (node: NodeMapItem) => {
    return {
      node_name: node.label,
      type: node.type,
      sequence: `Step ${node.order} of ${nodes.length}`,
      timestamp: new Date().toISOString(),
      payload: {
        status: "success",
        data_processed: Math.floor(Math.random() * 100) + 1,
        execution_time_ms: Math.floor(Math.random() * 500) + 50
      },
      auth_scopes: node.type === "integration" ? ["read:profile", "write:records"] : ["internal:local"]
    };
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* SVG Canvas Container */}
      <div className={`relative w-full ${isSingleRow ? "aspect-[4/1] min-h-[140px]" : "aspect-[2/1]"} bg-black/40 border border-glass rounded-[24px] overflow-hidden p-4`}>
        <svg
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Dot Grid Background */}
          <defs>
            <pattern id="dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.07)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />

          {/* Glowing/Shadow Connecting Path */}
          <path
            d={generatePath()}
            fill="none"
            stroke="rgba(255, 255, 255, 0.04)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d={generatePath()}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={generatePath()}
            fill="none"
            stroke="var(--color-primary, #ffffff)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-dash"
            style={{
              strokeDasharray: "10, 8",
              animation: "dash 1.2s linear infinite"
            }}
          />

          {/* Style override for SVG path animation */}
          <style>{`
            @keyframes dash {
              to {
                stroke-dashoffset: -36;
              }
            }
          `}</style>

          {/* Nodes */}
          {nodesWithCoords.map((node) => {
            const isSelected = selectedNode?.order === node.order;
            const isHovered = hoveredNode?.order === node.order;
            const accentColor = getNodeColor(node.type);

            return (
              <g
                key={node.order}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onDoubleClick={() => setDoubleClickedNode(node)}
              >
                {/* Glow Ring Behind Card on Selection/Hover */}
                {(isSelected || isHovered) && (
                  <rect
                    x={-73}
                    y={-25}
                    width={146}
                    height={50}
                    rx={10}
                    fill="none"
                    stroke={accentColor}
                    strokeWidth="2"
                    className="opacity-40 blur-[4px] transition-all duration-300"
                  />
                )}

                {/* Card Main Plate */}
                <rect
                  x={-70}
                  y={-22}
                  width={140}
                  height={44}
                  rx={8}
                  fill="rgba(15, 17, 23, 0.95)"
                  stroke={isSelected ? accentColor : "rgba(255, 255, 255, 0.12)"}
                  strokeWidth={isSelected ? 1.5 : 1}
                  className="transition-all duration-300 shadow-xl"
                />

                {/* Colored Left Edge Border Strip */}
                <rect
                  x={-70}
                  y={-14}
                  width={3.5}
                  height={28}
                  rx={1.5}
                  fill={accentColor}
                />

                {/* Circular Badge for Icon */}
                <circle
                  cx={-46}
                  cy={0}
                  r={12}
                  fill="rgba(255, 255, 255, 0.04)"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="1"
                />

                {/* Node Icon */}
                <foreignObject x={-56} y={-10} width={20} height={20}>
                  <div className="flex items-center justify-center h-full w-full">
                    {getNodeIcon(node.label, node.type)}
                  </div>
                </foreignObject>

                {/* Node Label Title */}
                <text
                  x={-24}
                  y={-1}
                  fill="rgba(255, 255, 255, 0.95)"
                  fontSize="9.5"
                  fontWeight="600"
                  fontFamily="var(--font-orbitron)"
                  textAnchor="start"
                >
                  {node.label.length > 17 ? node.label.slice(0, 15) + "..." : node.label}
                </text>

                {/* Node Type Subtitle */}
                <text
                  x={-24}
                  y={10}
                  fill="rgba(255, 255, 255, 0.35)"
                  fontSize="7"
                  fontWeight="bold"
                  fontFamily="var(--font-inter)"
                  textAnchor="start"
                  className="uppercase tracking-wider"
                >
                  {node.type}
                </text>

                {/* Input/Output Ports (n8n design) */}
                <circle
                  cx={-70}
                  cy={0}
                  r={3.5}
                  fill="#0c0e12"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="1"
                />
                <circle
                  cx={70}
                  cy={0}
                  r={3.5}
                  fill="#0c0e12"
                  stroke="rgba(255, 255, 255, 0.25)"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none bg-black/95 border border-glass px-3 py-1.5 rounded-lg text-[10px] font-[family-name:var(--font-orbitron)] text-primary uppercase tracking-wider"
              style={{
                left: `${(hoveredNode.x / canvasWidth) * 100}%`,
                top: `${(hoveredNode.y / canvasHeight) * 100 - 15}%`,
                transform: "translate(-50%, -100%)"
              }}
            >
              Step {hoveredNode.order} of {nodes.length}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Node Detail/Instruction Panel */}
      <div className="glass-premium rounded-[24px] p-6 border border-glass">
        {selectedNode ? (
          <div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-widest block mb-1">
                  Selected Node (Step {selectedNode.order} of {nodes.length})
                </span>
                <h4 className="font-[family-name:var(--font-orbitron)] text-md font-bold text-primary">
                  {selectedNode.label}
                </h4>
              </div>
              <span className="text-[9px] font-[family-name:var(--font-orbitron)] uppercase glass px-3 py-1 rounded-full text-dim">
                {selectedNode.type}
              </span>
            </div>
            <p className="font-[family-name:var(--font-inter)] text-dim text-xs leading-relaxed">
              Double-click this node to inspect mock payload data, authorization scopes, and API configuration parameters.
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="font-[family-name:var(--font-inter)] text-dim text-xs">
              Select any node in the SVG diagram above to view details, parameters, and step sequences.
            </p>
          </div>
        )}
      </div>

      {/* Double Click Metadata Modal */}
      <AnimatePresence>
        {doubleClickedNode && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-premium border border-glass max-w-lg w-full rounded-[24px] p-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest block mb-1">
                    Node Technical Specifications
                  </span>
                  <h3 className="font-[family-name:var(--font-orbitron)] text-lg font-bold text-primary">
                    {doubleClickedNode.label}
                  </h3>
                </div>
                <button
                  onClick={() => setDoubleClickedNode(null)}
                  className="font-[family-name:var(--font-orbitron)] text-xs text-dim hover:text-primary transition-colors"
                >
                  [ CLOSE ]
                </button>
              </div>

              <div className="space-y-4">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase">
                  <div>
                    <span className="block text-[8px] text-neutral-500">Node Type</span>
                    <span className="text-primary font-semibold">{doubleClickedNode.type}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-neutral-500">Sequence Order</span>
                    <span className="text-primary font-semibold">Step {doubleClickedNode.order}</span>
                  </div>
                </div>

                {/* API Auth scopes */}
                <div>
                  <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-neutral-500 uppercase block mb-1">
                    Required Credentials / Scopes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {getMockData(doubleClickedNode).auth_scopes.map((scope) => (
                      <span key={scope} className="glass px-2.5 py-1 rounded text-[10px] font-mono text-dim">
                        <FaKey className="inline mr-1 text-[8px]" /> {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* JSON Payload Spec */}
                <div>
                  <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-neutral-500 uppercase block mb-1">
                    Mock Execution Payload (JSON)
                  </span>
                  <div className="bg-black/90 p-4 rounded-xl border border-glass font-mono text-[10.5px] text-neutral-300 overflow-x-auto max-h-[180px]">
                    <pre>{JSON.stringify(getMockData(doubleClickedNode), null, 2)}</pre>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
