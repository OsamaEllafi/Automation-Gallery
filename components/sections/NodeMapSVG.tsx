"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaKey, FaChevronRight, FaTimes } from "react-icons/fa";
import { NodeMapItem } from "@/types/workflow";
import { getNodeColor, getNodeIcon } from "@/lib/nodeMapUtils";

interface NodeMapSVGProps {
  nodes: NodeMapItem[];
  primaryIntegration?: string;
  mode?: "thumbnail" | "full";
}

interface NodeWithCoords extends NodeMapItem {
  x: number;
  y: number;
  index: number;
}

export default function NodeMapSVG({ nodes, primaryIntegration, mode = "full" }: NodeMapSVGProps) {
  const [selectedNode, setSelectedNode] = useState<NodeWithCoords | null>(null);
  const [hoveredNode, setHoveredNode] = useState<NodeWithCoords | null>(null);
  const [doubleClickedNode, setDoubleClickedNode] = useState<NodeWithCoords | null>(null);

  // ResizeObserver state to detect container size for adaptive layout
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchMoved = useRef(false);

  useEffect(() => {
    if (mode === "thumbnail" || !containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const width = entries[0].contentRect.width;
      if (width > 0) {
        setContainerWidth(width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [mode]);

  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-dim text-sm font-[family-name:var(--font-inter)] py-4 text-center">
        No node map data available.
      </div>
    );
  }

  // Determine if vertical stacked layout is active (mobile view)
  const isMobileLayout = mode === "full" && containerWidth < 500;

  // Thumbnail configuration
  if (mode === "thumbnail") {
    const displayNodes = nodes.slice(0, 4);
    const canvasWidth = 240;
    const canvasHeight = 120;
    const spacing = canvasWidth / (displayNodes.length + 1);

    const coords = displayNodes.map((n, idx) => ({
      ...n,
      x: spacing * (idx + 1),
      y: canvasHeight / 2 - 5,
    }));

    let pathD = "";
    if (coords.length > 1) {
      pathD = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 1; i < coords.length; i++) {
        pathD += ` L ${coords[i].x} ${coords[i].y}`;
      }
    }

    return (
      <div className="w-full h-[180px] bg-black/90 border border-glass rounded-xl mb-6 flex items-center justify-center p-2 overflow-hidden relative">
        <svg viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} className="w-full h-full">
          {/* Grid pattern background */}
          <defs>
            <pattern id="mini-grid" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.8" fill="rgba(255, 255, 255, 0.05)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mini-grid)" />

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
            const color = getNodeColor(n.type);
            return (
              <g key={idx}>
                {/* Inner Circle background */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={13}
                  fill="rgba(15, 17, 23, 0.95)"
                  stroke={color}
                  strokeWidth="1.25"
                />
                {/* Brand Icon */}
                <foreignObject x={n.x - 7} y={n.y - 7} width={14} height={14}>
                  <div className="flex items-center justify-center h-full w-full opacity-90">
                    {getNodeIcon(n.label, n.type, 10)}
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
  }

  // ----------------------------------------------------
  // FULL INTERACTIVE MODE (Exhibits & Previews)
  // ----------------------------------------------------

  // Calculate layout coordinates
  const maxNodesPerRow = 5;
  const isSingleRow = nodes.length <= maxNodesPerRow;

  // Layout parameters based on viewport/container width
  const canvasWidth = isMobileLayout ? 360 : 800;
  const canvasHeight = isMobileLayout
    ? nodes.length * 85 + 20
    : isSingleRow ? 180 : 400;

  const getCoordinates = (index: number, total: number) => {
    if (isMobileLayout) {
      // Mobile: Vertical linear flow
      return {
        x: 180,
        y: 50 + index * 85,
      };
    } else if (isSingleRow) {
      // Desktop: Single row layout
      const spacing = canvasWidth / (total + 1);
      return {
        x: spacing * (index + 1),
        y: canvasHeight / 2,
      };
    } else {
      // Desktop: Zig-zag two-row layout
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
      
      if (isMobileLayout) {
        // Vertical straight line
        d += ` L ${p2.x} ${p2.y}`;
      } else if (Math.abs(p1.y - p2.y) < 50) {
        // Horizontal straight line
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

  const getNodeDescription = (node: NodeMapItem) => {
    if (node.description) return node.description;
    const lowerLabel = node.label.toLowerCase();
    if (node.type === "trigger") {
      if (lowerLabel.includes("webhook")) return "Receives incoming HTTP webhook requests from external systems to trigger the workflow execution.";
      if (lowerLabel.includes("schedule") || lowerLabel.includes("cron")) return "Triggers the workflow automatically on a scheduled cron interval.";
      return "Listens for events to initiate the automation workflow.";
    }
    if (node.type === "condition") {
      return "Evaluates rules and routes the workflow execution path dynamically.";
    }
    if (node.type === "integration") {
      return `Integrates with ${node.label} to perform external API synchronization.`;
    }
    if (node.type === "action") {
      return "Executes internal tasks, data formatting, or processing logic.";
    }
    if (node.type === "output") {
      return "Outputs final results or completes the workflow execution.";
    }
    return "Executes operations within the automated pipeline.";
  };

  // Touch optimized long press handlers for mobilespec modal
  const handleTouchStart = (node: NodeWithCoords) => {
    touchMoved.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!touchMoved.current) {
        setDoubleClickedNode(node);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTouchMove = () => {
    touchMoved.current = true;
  };

  return (
    <div className="w-full flex flex-col gap-6" ref={containerRef}>
      
      {/* Scroll instruction for desktop overflow */}
      {!isMobileLayout && nodes.length > 8 && (
        <span className="text-[9px] font-[family-name:var(--font-orbitron)] text-dim uppercase tracking-wider text-right self-end -mb-3 opacity-60">
          Scroll diagram horizontally to explore &rarr;
        </span>
      )}

      {/* SVG Canvas Container */}
      <div 
        className={`relative w-full bg-black/40 border border-glass rounded-[24px] overflow-x-auto overflow-y-hidden p-4 touch-pan-x`}
        style={{
          WebkitOverflowScrolling: "touch",
          height: isMobileLayout ? `${canvasHeight + 32}px` : "auto",
          aspectRatio: isMobileLayout ? "auto" : isSingleRow ? "4/1" : "2/1",
          minHeight: isMobileLayout ? "auto" : isSingleRow ? "140px" : "auto",
        }}
      >
        {/* Horizontal scroll fade helpers */}
        {!isMobileLayout && nodes.length > 8 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent pointer-events-none z-10 rounded-l-[24px]" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none z-10 rounded-r-[24px]" />
          </>
        )}

        <div style={{ minWidth: isMobileLayout ? "100%" : `${Math.max(800, nodes.length * 160)}px`, height: "100%" }}>
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

              // Responsive label length
              const maxLabelLength = isMobileLayout ? 14 : 17;
              const displayLabel = node.label.length > maxLabelLength 
                ? node.label.slice(0, maxLabelLength - 2) + ".." 
                : node.label;

              return (
                <g
                  key={node.order}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group select-none"
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => !isMobileLayout && setHoveredNode(node)}
                  onMouseLeave={() => !isMobileLayout && setHoveredNode(null)}
                  onDoubleClick={() => setDoubleClickedNode(node)}
                  onTouchStart={() => handleTouchStart(node)}
                  onTouchEnd={handleTouchEnd}
                  onTouchMove={handleTouchMove}
                >
                  {/* Invisible Larger Hit Target (44x44px min compliant) */}
                  <rect
                    x={-75}
                    y={-25}
                    width={150}
                    height={50}
                    fill="transparent"
                  />

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
                    {displayLabel}
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
                  {isMobileLayout ? (
                    <>
                      {/* Top Input Port */}
                      <circle
                        cx={0}
                        cy={-22}
                        r={3.5}
                        fill="#0c0e12"
                        stroke="rgba(255, 255, 255, 0.25)"
                        strokeWidth="1"
                      />
                      {/* Bottom Output Port */}
                      <circle
                        cx={0}
                        cy={22}
                        r={3.5}
                        fill="#0c0e12"
                        stroke="rgba(255, 255, 255, 0.25)"
                        strokeWidth="1"
                      />
                    </>
                  ) : (
                    <>
                      {/* Left Input Port */}
                      <circle
                        cx={-70}
                        cy={0}
                        r={3.5}
                        fill="#0c0e12"
                        stroke="rgba(255, 255, 255, 0.25)"
                        strokeWidth="1"
                      />
                      {/* Right Output Port */}
                      <circle
                        cx={70}
                        cy={0}
                        r={3.5}
                        fill="#0c0e12"
                        stroke="rgba(255, 255, 255, 0.25)"
                        strokeWidth="1"
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Tooltip (Desktop only) */}
        <AnimatePresence>
          {!isMobileLayout && hoveredNode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none bg-black/95 border border-glass px-3 py-1.5 rounded-lg text-[10px] font-[family-name:var(--font-orbitron)] text-white uppercase tracking-wider"
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

      {/* MOBILE DRILL PANEL (Bottom Sheet / Drawer) */}
      <AnimatePresence>
        {isMobileLayout && selectedNode && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Bottom Drawer */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 250 }}
              dragElastic={{ top: 0.05, bottom: 0.8 }}
              onDragEnd={(e, info) => {
                if (info.offset.y > 120) {
                  setSelectedNode(null);
                }
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 glass-premium border-t border-glass rounded-t-[24px] p-6 shadow-2xl pb-8"
            >
              {/* Drag Handle pill */}
              <div className="w-12 h-1 bg-neutral-600 rounded-full mx-auto mb-4 cursor-grab active:cursor-grabbing" />
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-widest block mb-1">
                    Selected Node (Step {selectedNode.order} of {nodes.length})
                  </span>
                  <h4 className="font-[family-name:var(--font-orbitron)] text-md font-bold text-primary">
                    {selectedNode.label}
                  </h4>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-[family-name:var(--font-orbitron)] uppercase glass px-3 py-1 rounded-full text-dim">
                    {selectedNode.type}
                  </span>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-1 text-dim hover:text-primary transition-colors"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
              </div>

              <p className="font-[family-name:var(--font-inter)] text-dim text-xs leading-relaxed mb-5">
                {getNodeDescription(selectedNode)}
              </p>

              <button
                onClick={() => {
                  setDoubleClickedNode(selectedNode);
                  setSelectedNode(null);
                }}
                className="w-full btn-outline text-xs uppercase py-3 rounded-xl flex items-center justify-center gap-1.5"
              >
                Inspect Payload Credentials <FaChevronRight size={10} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP Node Detail/Instruction Panel */}
      {!isMobileLayout && (
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
              <p className="font-[family-name:var(--font-inter)] text-dim text-xs leading-relaxed mb-2">
                {getNodeDescription(selectedNode)}
              </p>
              <p className="font-[family-name:var(--font-inter)] text-[10px] text-neutral-500 italic">
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
      )}

      {/* Double Click Metadata Modal */}
      <AnimatePresence>
        {doubleClickedNode && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => setDoubleClickedNode(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-premium border border-glass max-w-lg w-full rounded-[24px] p-6 shadow-2xl relative z-10"
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

                {/* Description */}
                <div>
                  <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-neutral-500 uppercase block mb-1">
                    Function Description
                  </span>
                  <p className="font-[family-name:var(--font-inter)] text-[11px] text-dim leading-relaxed">
                    {getNodeDescription(doubleClickedNode)}
                  </p>
                </div>

                {/* API Auth scopes */}
                <div>
                  <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-neutral-500 uppercase block mb-1">
                    Required Credentials / Scopes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {getMockData(doubleClickedNode).auth_scopes.map((scope) => (
                      <span key={scope} className="glass px-2.5 py-1 rounded text-[10px] font-mono text-dim flex items-center">
                        <FaKey className="mr-1.5 text-[8px] text-primary" /> {scope}
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
