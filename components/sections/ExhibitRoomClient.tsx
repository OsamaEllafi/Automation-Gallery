"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaChevronUp, FaFilePdf } from "react-icons/fa";
import { useWorkflow, useAllWorkflows } from "@/hooks/useWorkflows";
import NodeMapSVG from "@/components/sections/NodeMapSVG";
import { getWorkflowsByIds } from "@/lib/firestore";
import { Workflow } from "@/types/workflow";

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
const colorCache = new Map<string, string>();

function convertColorToRgb(colorStr: string): string {
  if (colorCache.has(colorStr)) {
    return colorCache.get(colorStr)!;
  }
  if (typeof window === "undefined" || typeof document === "undefined") return colorStr;
  
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
  }
  if (!ctx) {
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  }
  if (!ctx) return colorStr;
  
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = colorStr;
  ctx.fillRect(0, 0, 1, 1);
  
  const imgData = ctx.getImageData(0, 0, 1, 1);
  const [r, g, b, a] = imgData.data;
  const resolved = a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
  colorCache.set(colorStr, resolved);
  return resolved;
}

function resolveOklchOklab(value: string): string {
  if (!value) return value;
  if (!value.includes("oklch") && !value.includes("oklab")) return value;
  
  return value.replace(/(oklch|oklab)\([^)]+\)/g, (match) => {
    try {
      return convertColorToRgb(match);
    } catch (e) {
      console.warn("Failed to convert color:", match, e);
      return match;
    }
  });
}

function createStyleProxy(style: CSSStyleDeclaration): CSSStyleDeclaration {
  return new Proxy(style, {
    get(target, prop) {
      if (prop === "getPropertyValue") {
        return function (propertyName: string) {
          const val = target.getPropertyValue(propertyName);
          return resolveOklchOklab(val);
        };
      }
      const val = Reflect.get(target, prop);
      if (typeof val === "string") {
        return resolveOklchOklab(val);
      }
      if (typeof val === "function") {
        return val.bind(target);
      }
      return val;
    }
  }) as CSSStyleDeclaration;
}

interface ExhibitRoomClientProps {
  id: string;
}

export default function ExhibitRoomClient({ id }: ExhibitRoomClientProps) {
  const { workflow, loading } = useWorkflow(id);
  const { workflows } = useAllWorkflows();

  const [relatedWorkflows, setRelatedWorkflows] = useState<Workflow[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportToPDF = async () => {
    if (!workflow) return;
    setIsExporting(true);
    const originalMainGetComputedStyle = window.getComputedStyle;
    try {
      // 1. Prepare computedStyle proxy to avoid oklch conversion issues in html2canvas
      window.getComputedStyle = function (el, pseudoElt) {
        const style = originalMainGetComputedStyle.call(window, el, pseudoElt);
        return style ? createStyleProxy(style) : style;
      };

      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");

      // Grab the node map element
      const nodeMapEl = document.getElementById("pdf-node-map");
      if (!nodeMapEl) {
        console.error("Node map element not found");
        return;
      }

      // Render Node Map to Canvas
      const mapCanvas = await html2canvas(nodeMapEl, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#000000", // Dark canvas background
        logging: false,
        onclone: (clonedDoc) => {
          const win = clonedDoc.defaultView;
          if (win) {
            const originalIframeGetComputedStyle = win.getComputedStyle;
            (win as any).getComputedStyle = function (el: Element, pseudoElt?: string | null) {
              const style = originalIframeGetComputedStyle.call(win, el, pseudoElt);
              return style ? createStyleProxy(style) : style;
            };
          }
        }
      });

      const mapImgData = mapCanvas.toDataURL("image/png");

      // Initialize PDF (A4 Page: 210mm x 297mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 15;
      const contentWidth = 180; // 210 - 2 * 15

      // Helper function to draw header
      const drawHeader = (pageNum: number) => {
        // Draw background
        pdf.setFillColor(245, 246, 248);
        pdf.rect(0, 0, 210, 297, "F");

        // Top line
        pdf.setDrawColor(15, 17, 23);
        pdf.setLineWidth(0.3);
        pdf.line(margin, 20, 210 - margin, 20);

        // Header Metadata
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(107, 112, 133); // text-dim
        pdf.text("AUTOMATION BLUEPRINT · GALLERY REPOSITORY", margin, 16);

        const idText = `SPECIFICATION ARCHIVE | ${workflow.workflow_id}`;
        pdf.text(idText, 210 - margin - pdf.getTextWidth(idText), 16);
      };

      // Helper function to draw footer
      const drawFooter = (pageNum: number, totalPages: number) => {
        const footerY = 280;
        pdf.setDrawColor(15, 17, 23);
        pdf.setLineWidth(0.3);
        pdf.line(margin, footerY, 210 - margin, footerY);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7);
        pdf.setTextColor(107, 112, 133);
        pdf.text("OSAMA K. ELLAFI · ARCHITECTURAL SYSTEM DETAILED FLOW", margin, footerY + 5);

        const pageNumText = `PAGE ${pageNum} OF ${totalPages}`;
        pdf.text(pageNumText, 210 - margin - pdf.getTextWidth(pageNumText), footerY + 5);
      };

      // ==========================================
      // PAGE 1: COVER & TOPOLOGY
      // ==========================================
      drawHeader(1);

      // Workflow Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.setTextColor(15, 17, 23);
      const titleLines = pdf.splitTextToSize(workflow.name.toUpperCase(), contentWidth);
      pdf.text(titleLines, margin, 32);
      
      let currentY = 32 + (titleLines.length * 7);

      // Short Description
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(107, 112, 133);
      const descLines = pdf.splitTextToSize(workflow.short_description, contentWidth);
      for (let i = 0; i < descLines.length; i++) {
        pdf.text(descLines[i], margin, currentY + (i * 4.5));
      }
      currentY += (descLines.length * 4.5) + 6;

      // Metadata Table / Grid
      pdf.setDrawColor(15, 17, 23);
      pdf.setLineWidth(0.3);
      pdf.line(margin, currentY, 210 - margin, currentY);
      
      currentY += 5;
      
      const colWidth = contentWidth / 5;
      const metaItems = [
        { label: "TRIGGER TYPE", value: workflow.trigger_type.toUpperCase() },
        { label: "SYSTEM NODES", value: String(workflow.total_nodes) },
        { label: "COMPLEXITY", value: ["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"][(workflow.complexity_score || 3) - 1] },
        { label: "AUTOMATION %", value: `${workflow.automation_percentage}%` },
        { label: "DATE BUILT", value: workflow.date_built.toUpperCase() }
      ];

      metaItems.forEach((item, index) => {
        const colX = margin + (index * colWidth);
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6.5);
        pdf.setTextColor(107, 112, 133);
        pdf.text(item.label, colX, currentY);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8.5);
        pdf.setTextColor(15, 17, 23);
        pdf.text(item.value, colX, currentY + 5.5);

        if (index < 4) {
          pdf.setDrawColor(220, 222, 228);
          pdf.line(colX + colWidth - 2, currentY - 2, colX + colWidth - 2, currentY + 7);
        }
      });

      currentY += 10;
      pdf.setDrawColor(15, 17, 23);
      pdf.line(margin, currentY, 210 - margin, currentY);
      
      currentY += 12;

      // Section I: Node Map
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(15, 17, 23);
      pdf.text("I. SYSTEM TOPOLOGY DIAGRAM", margin, currentY);
      pdf.line(margin, currentY + 2, 210 - margin, currentY + 2);
      
      currentY += 8;

      // Draw Node Map Image
      const imgHeight = (mapCanvas.height * contentWidth) / mapCanvas.width;
      pdf.addImage(mapImgData, "PNG", margin, currentY, contentWidth, imgHeight, undefined, "FAST");
      
      currentY += imgHeight + 6;

      // Caption
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(7);
      pdf.setTextColor(107, 112, 133);
      const captionText = "Figure 1.0: End-to-end topological sequence mapping of the automation system. Interactive properties, node logs and mock payloads accessible via the digital gallery room.";
      const captionLines = pdf.splitTextToSize(captionText, contentWidth);
      for (let i = 0; i < captionLines.length; i++) {
        pdf.text(captionLines[i], margin, currentY + (i * 3.5));
      }

      drawFooter(1, 2);

      // ==========================================
      // PAGE 2: NARRATIVE & INTEGRATIONS
      // ==========================================
      pdf.addPage();
      drawHeader(2);

      // Section II: Requirements
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(15, 17, 23);
      pdf.text("II. SYSTEM REQUIREMENTS & FUNCTIONAL PROBLEM", margin, 32);
      pdf.line(margin, 34, 210 - margin, 34);

      // Side-by-side Problem and Solution Cards
      const cardWidth = 87;
      const cardPadding = 5;
      const textWrapWidth = cardWidth - (cardPadding * 2);

      const probTextLines = pdf.splitTextToSize(workflow.problem, textWrapWidth);
      const solTextLines = pdf.splitTextToSize(workflow.solution, textWrapWidth);

      const maxLines = Math.max(probTextLines.length, solTextLines.length);
      const cardHeight = Math.max(35, 12 + (maxLines * 4.2) + 6);

      // Problem Card Background & Border
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(225, 227, 232);
      pdf.roundedRect(margin, 40, cardWidth, cardHeight, 2, 2, "FD");

      // Problem Card Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(107, 112, 133);
      pdf.text("THE CHALLENGE / BUSINESS PROBLEM", margin + cardPadding, 46);

      // Problem Card Body
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 17, 23);
      for (let i = 0; i < probTextLines.length; i++) {
        pdf.text(probTextLines[i], margin + cardPadding, 51 + (i * 4.2));
      }

      // Solution Card Background & Border
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(225, 227, 232);
      pdf.roundedRect(margin + cardWidth + 6, 40, cardWidth, cardHeight, 2, 2, "FD");

      // Solution Card Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(107, 112, 133);
      pdf.text("THE PROPOSED SYSTEM SOLUTION", margin + cardWidth + 6 + cardPadding, 46);

      // Solution Card Body
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(15, 17, 23);
      for (let i = 0; i < solTextLines.length; i++) {
        pdf.text(solTextLines[i], margin + cardWidth + 6 + cardPadding, 51 + (i * 4.2));
      }

      let y2 = 40 + cardHeight + 12;

      // Section III: Architectural Narrative
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(15, 17, 23);
      pdf.text("III. DETAILED ARCHITECTURAL NARRATIVE", margin, y2);
      pdf.line(margin, y2 + 2, 210 - margin, y2 + 2);

      y2 += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(15, 17, 23);
      const narrativeTextLines = pdf.splitTextToSize(workflow.long_description, contentWidth);
      for (let i = 0; i < narrativeTextLines.length; i++) {
        pdf.text(narrativeTextLines[i], margin, y2 + (i * 4.5));
      }

      y2 += (narrativeTextLines.length * 4.5) + 12;

      // Section IV: Integrations
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(15, 17, 23);
      pdf.text("IV. PIPELINE INTEGRATIONS", margin, y2);
      pdf.line(margin, y2 + 2, 210 - margin, y2 + 2);

      y2 += 8;

      let xPos = margin;
      let yPos = y2;
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);

      workflow.connected_services.forEach((service) => {
        const textWidth = pdf.getTextWidth(service);
        const pillWidth = textWidth + 8;
        
        if (xPos + pillWidth > 210 - margin) {
          xPos = margin;
          yPos += 10;
        }

        // Draw pill background & border
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(220, 222, 228);
        pdf.roundedRect(xPos, yPos, pillWidth, 6, 1.5, 1.5, "FD");

        // Draw text
        pdf.setTextColor(15, 17, 23);
        pdf.text(service, xPos + 4, yPos + 4.2);

        xPos += pillWidth + 4;
      });

      // Document Control Section at the bottom
      const dcY = 245;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(225, 227, 232);
      pdf.rect(margin, dcY, contentWidth, 22, "FD");

      const dcColWidth = contentWidth / 4;
      const dcItems = [
        { label: "AUTHOR / ENGINEER", value: "OSAMA K. ELLAFI" },
        { label: "REPOSITORY ARCHIVE", value: "AUTOMATION GALLERY" },
        { label: "BLUEPRINT STATUS", value: "APPROVED / PRODUCTION" },
        { label: "SYSTEM ID", value: workflow.workflow_id }
      ];

      dcItems.forEach((item, index) => {
        const colX = margin + (index * dcColWidth) + 4;
        
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(6);
        pdf.setTextColor(107, 112, 133);
        pdf.text(item.label, colX, dcY + 6);

        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(15, 17, 23);
        pdf.text(item.value, colX, dcY + 14);

        if (index < 3) {
          pdf.setDrawColor(225, 227, 232);
          pdf.line(margin + ((index + 1) * dcColWidth), dcY + 2, margin + ((index + 1) * dcColWidth), dcY + 20);
        }
      });

      drawFooter(2, 2);

      // Save PDF
      pdf.save(`${workflow.workflow_id}_spec_sheet.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      window.getComputedStyle = originalMainGetComputedStyle;
      setIsExporting(false);
    }
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
      
      {/* Breadcrumbs and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-widest">
          <Link href="/gallery" className="hover:text-primary transition-colors">Gallery</Link>
          <span>→</span>
          <span>{workflow.category}</span>
          <span>→</span>
          <span className="text-primary">{workflow.name}</span>
        </div>
        
        <button
          onClick={exportToPDF}
          disabled={isExporting}
          className="btn-outline text-[9px] py-1.5 px-4 font-[family-name:var(--font-orbitron)] tracking-wider flex items-center gap-2 hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FaFilePdf className="text-[10px]" />
          {isExporting ? "EXPORTING..." : "EXPORT TO PDF"}
        </button>
      </div>

      {/* PDF Page 1: Header & Diagram */}
      <div id="pdf-page-1" className="mb-16">
        {/* Header Block */}
        <div className="relative mb-16">
          <span className="absolute -top-10 -left-4 font-[family-name:var(--font-orbitron)] font-bold text-[8rem] text-primary opacity-[0.02] -z-10 leading-none pointer-events-none select-none">
            {workflow.workflow_id}
          </span>

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
          id="pdf-node-map"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 w-full"
        >
          <NodeMapSVG nodes={workflow.node_map_data} primaryIntegration={workflow.primary_integration} />
        </motion.div>
      </div>

      {/* PDF Page 2: Narrative & Problem/Solution */}
      <div id="pdf-page-2" className="mb-16">
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
            className="glass-premium p-8 rounded-[24px] border border-glass"
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
      </div>

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
