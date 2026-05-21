"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAllWorkflows, useLiveWorkflows } from "@/hooks/useWorkflows";
import { FaArrowRight, FaSearch, FaSort } from "react-icons/fa";
import { Workflow } from "@/types/workflow";
import NodeMapSVG from "@/components/sections/NodeMapSVG";

interface GallerySectionProps {
  featuredOnly?: boolean;
}

export default function GallerySection({ featuredOnly = false }: GallerySectionProps) {
  // Load data differently based on view requirements
  const { workflows: allWorkflows, loading: loadingAll, error: errorAll } = useAllWorkflows();
  const { workflows: liveRecentWorkflows, loading: loadingRecent, error: errorRecent } = useLiveWorkflows(12);

  // States for search and filtering (only used if featuredOnly = false)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedTrigger, setSelectedTrigger] = useState("ALL");
  const [maxComplexity, setMaxComplexity] = useState(5);
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(9);

  const loading = featuredOnly ? loadingRecent : loadingAll;
  const error = featuredOnly ? errorRecent : errorAll;

  // Filter and sort logic
  const filteredWorkflows = useMemo(() => {
    if (featuredOnly) {
      return [...liveRecentWorkflows]
        .filter(w => w.status === "live")
        .sort((a, b) => b.workflow_id.localeCompare(a.workflow_id))
        .slice(0, 3);
    }

    // Filter by live status for public directory
    let result = allWorkflows.filter(w => w.status === "live");

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        w => 
          w.name.toLowerCase().includes(query) ||
          w.workflow_id.toLowerCase().includes(query) ||
          w.short_description.toLowerCase().includes(query) ||
          (w.tags && w.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    // Category filter
    if (selectedCategory !== "ALL") {
      result = result.filter(w => w.category === selectedCategory);
    }

    // Trigger type filter
    if (selectedTrigger !== "ALL") {
      result = result.filter(w => w.trigger_type === selectedTrigger);
    }

    // Complexity score filter
    result = result.filter(w => (w.complexity_score || 3) <= maxComplexity);

    // Sorting logic
    if (sortBy === "newest") {
      result = [...result].sort((a, b) => b.workflow_id.localeCompare(a.workflow_id));
    } else if (sortBy === "nodes") {
      result = [...result].sort((a, b) => (b.total_nodes || 0) - (a.total_nodes || 0));
    } else if (sortBy === "automation") {
      result = [...result].sort((a, b) => (b.automation_percentage || 0) - (a.automation_percentage || 0));
    } else if (sortBy === "hours") {
      result = [...result].sort((a, b) => (b.hours_saved_per_month || 0) - (a.hours_saved_per_month || 0));
    }

    return result;
  }, [allWorkflows, liveRecentWorkflows, featuredOnly, searchQuery, selectedCategory, selectedTrigger, maxComplexity, sortBy]);

  // Available categories derived dynamically
  const categories = useMemo(() => {
    const list = new Set<string>();
    allWorkflows.forEach(w => {
      if (w.status === "live" && w.category) list.add(w.category);
    });
    return ["ALL", ...Array.from(list)];
  }, [allWorkflows]);

  // Available trigger types derived dynamically
  const triggerTypes = useMemo(() => {
    const list = new Set<string>();
    allWorkflows.forEach(w => {
      if (w.status === "live" && w.trigger_type) list.add(w.trigger_type);
    });
    return ["ALL", ...Array.from(list)];
  }, [allWorkflows]);

  const displayedWorkflows = featuredOnly 
    ? filteredWorkflows 
    : filteredWorkflows.slice(0, visibleCount);

  const hasMore = filteredWorkflows.length > visibleCount;

  const loadMore = () => {
    setVisibleCount(prev => prev + 9);
  };

  if (loading) {
    return (
      <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        {/* Shimmer loading skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 w-full mt-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-premium rounded-[24px] p-7 h-[420px] animate-pulse flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="h-4 bg-primary/10 rounded w-16" />
                  <div className="h-4 bg-primary/10 rounded w-20" />
                </div>
                <div className="w-full h-[180px] bg-primary/5 rounded-xl mb-6" />
                <div className="h-6 bg-primary/10 rounded w-3/4 mb-3" />
                <div className="h-4 bg-primary/10 rounded w-full mb-2" />
                <div className="h-4 bg-primary/10 rounded w-5/6" />
              </div>
              <div className="h-4 bg-primary/10 rounded w-full pt-4 border-t border-glass" />
            </div>
          ))}
        </div>
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
      {/* Title block */}
      <div className="flex flex-col items-center text-center mb-12">
        <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-4">
          {featuredOnly ? "THE SELECTION" : "THE COLLECTION"}
        </span>
        <h2 className="font-[family-name:var(--font-orbitron)] text-[2.5rem] font-bold text-primary mb-6">
          {featuredOnly ? "LATEST EXHIBITS" : "ALL EXHIBITED WORKS"}
        </h2>
        <div className="w-12 h-[3px] bg-primary/30 rounded-full" />
      </div>

      {/* Advanced Search & Filtering Controls */}
      {!featuredOnly && (
        <div className="glass-premium rounded-[24px] p-6 mb-12 flex flex-col gap-6">
          {/* Search Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dim text-sm" />
              <input
                type="text"
                placeholder="Search by name, tag, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/50 border border-glass rounded-xl pl-11 pr-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 bg-white/50 border border-glass rounded-xl px-3 py-1">
                <FaSort className="text-dim text-xs" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-wider text-primary border-none focus:outline-none cursor-pointer py-2"
                >
                  <option value="newest">Newest First</option>
                  <option value="nodes">Most Nodes</option>
                  <option value="automation">Highest Automation</option>
                  <option value="hours">Most Hours Saved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-glass/40">
            {/* Category Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-widest">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white/50 border border-glass rounded-xl px-3 py-2.5 font-[family-name:var(--font-inter)] text-xs text-primary focus:outline-none focus:border-primary/30"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === "ALL" ? "All Categories" : cat}</option>
                ))}
              </select>
            </div>

            {/* Trigger Filter */}
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-widest">Trigger Type</label>
              <select
                value={selectedTrigger}
                onChange={(e) => setSelectedTrigger(e.target.value)}
                className="w-full bg-white/50 border border-glass rounded-xl px-3 py-2.5 font-[family-name:var(--font-inter)] text-xs text-primary focus:outline-none focus:border-primary/30"
              >
                {triggerTypes.map(trig => (
                  <option key={trig} value={trig}>{trig === "ALL" ? "All Triggers" : `${trig} Trigger`}</option>
                ))}
              </select>
            </div>

            {/* Complexity Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-[family-name:var(--font-orbitron)] text-[9px] text-dim uppercase tracking-widest">Max Complexity</label>
                <span className="font-[family-name:var(--font-orbitron)] text-[9px] text-primary font-bold">
                  {["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"][maxComplexity - 1]}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={maxComplexity}
                onChange={(e) => setMaxComplexity(Number(e.target.value))}
                className="bg-black/5 h-2 rounded-lg appearance-none cursor-pointer my-2 accent-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* No results notice */}
      {displayedWorkflows.length === 0 && (
        <div className="text-center py-16 glass rounded-[24px]">
          <p className="font-[family-name:var(--font-inter)] text-dim">No matching automation systems found.</p>
          <button 
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedTrigger("ALL");
              setMaxComplexity(5);
            }}
            className="btn-outline mt-4 text-[9px]"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Exhibits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        <AnimatePresence mode="popLayout">
          {displayedWorkflows.map((workflow, index) => (
            <motion.div
              layout
              key={workflow.workflow_id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/gallery/${workflow.workflow_id}`}>
                <div
                  className="glass-premium rounded-[24px] p-7 cursor-pointer group hover:border-primary/20 transition-all flex flex-col h-full relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-[family-name:var(--font-orbitron)] text-[9px] uppercase glass px-3 py-1 rounded-full text-primary font-bold">
                      {workflow.workflow_id}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {workflow.featured && (
                        <span className="font-[family-name:var(--font-orbitron)] text-[8px] bg-[#d97706]/10 text-[#d97706] border border-[#d97706]/20 px-2 py-0.5 rounded-full font-bold">
                          ★ FEATURED
                        </span>
                      )}
                      <span className="font-[family-name:var(--font-orbitron)] text-[8px] bg-primary/5 text-primary border border-glass px-2 py-0.5 rounded-full font-bold">
                        {["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"][(workflow.complexity_score || 3) - 1]}
                      </span>
                    </div>
                  </div>

                  {/* Mini visual representation of nodes */}
                  <NodeMapSVG nodes={workflow.node_map_data} mode="thumbnail" />

                  <h3 className="font-[family-name:var(--font-orbitron)] font-semibold text-main mb-2 text-md leading-tight group-hover:text-primary transition-colors">
                    {workflow.name}
                  </h3>
                  
                  <p className="font-[family-name:var(--font-inter)] text-[0.85rem] text-dim line-clamp-2 mb-4 leading-relaxed">
                    {workflow.short_description}
                  </p>

                  {/* Render Tags */}
                  {workflow.tags && workflow.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-6">
                      {workflow.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[9px] font-[family-name:var(--font-orbitron)] bg-black/5 text-dim px-2 py-0.5 rounded tracking-wide">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-[family-name:var(--font-orbitron)] text-[8px] text-dim tracking-wider uppercase mt-auto pt-4 border-t border-glass/40">
                    <span>{workflow.total_nodes} NODES</span>
                    <span>•</span>
                    <span>{workflow.automation_percentage}% AUTOMATED</span>
                    <span>•</span>
                    <span>{workflow.category}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Pagination "Load More" controls */}
      {!featuredOnly && hasMore && (
        <div className="mt-16 flex justify-center">
          <button onClick={loadMore} className="btn-outline flex items-center gap-2">
            LOAD MORE EXHIBITS <FaArrowRight size={10} />
          </button>
        </div>
      )}

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
