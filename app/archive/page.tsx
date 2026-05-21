"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useAllWorkflows } from "@/hooks/useWorkflows";
import { FaSearch } from "react-icons/fa";

export default function ArchivePage() {
  const { workflows, loading } = useAllWorkflows();
  const [searchQuery, setSearchQuery] = useState("");

  // Only show public (live) exhibits in the public archive, and apply search
  const filteredWorkflows = useMemo(() => {
    const live = workflows.filter(w => w.status === "live");
    if (!searchQuery.trim()) return live;
    
    const query = searchQuery.toLowerCase();
    return live.filter(
      w => 
        w.name.toLowerCase().includes(query) ||
        w.workflow_id.toLowerCase().includes(query) ||
        w.category.toLowerCase().includes(query) ||
        w.trigger_type.toLowerCase().includes(query)
    );
  }, [workflows, searchQuery]);

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-primary mb-2">
            THE ARCHIVE
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-dim">
            Complete index of all public automation exhibits.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dim text-xs" />
          <input
            type="text"
            placeholder="Search index..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 border border-glass rounded-xl pl-11 pr-4 py-2.5 font-[family-name:var(--font-inter)] text-xs focus:outline-none focus:border-primary/30"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
            Loading Archive Index...
          </span>
        </div>
      ) : (
        <div className="glass rounded-[24px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass bg-white/5">
                  {["ID", "Workflow Name", "Category", "Trigger", "Nodes", "Automation %", "Date", "Complexity", "→"].map((header) => (
                    <th key={header} className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-dim font-[family-name:var(--font-inter)] text-sm">
                      No matching archive records found.
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((workflow, index) => (
                    <tr key={workflow.workflow_id} className={`border-b border-glass hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}`}>
                      <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] font-bold text-primary">{workflow.workflow_id}</td>
                      <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-main font-medium">{workflow.name}</td>
                      <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.category}</td>
                      <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.trigger_type}</td>
                      <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.total_nodes}</td>
                      <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.automation_percentage}%</td>
                      <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.date_built}</td>
                      <td className="p-4">
                        <span className="text-[9px] font-[family-name:var(--font-orbitron)] uppercase bg-primary/5 text-primary border border-glass px-2 py-0.5 rounded font-bold">
                          {["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"][(workflow.complexity_score || 3) - 1]}
                        </span>
                      </td>
                      <td className="p-4">
                        <Link href={`/gallery/${workflow.workflow_id}`} className="font-[family-name:var(--font-orbitron)] text-[10px] text-primary hover:underline">
                          VIEW
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
