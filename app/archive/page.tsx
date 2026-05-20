"use client";

import Link from "next/link";
import { useAllWorkflows } from "@/hooks/useWorkflows";

export default function ArchivePage() {
  const { workflows, loading } = useAllWorkflows();

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-primary mb-2">
          THE ARCHIVE
        </h1>
        <p className="font-[family-name:var(--font-inter)] text-dim">
          Complete index of all automation exhibits.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
            Loading Archive Index...
          </span>
        </div>
      ) : (
        <div className="glass rounded-[24px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass bg-white/5">
                  {["ID", "Workflow Name", "Category", "Trigger", "Nodes", "Automation %", "Date", "Status", "→"].map((header) => (
                    <th key={header} className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workflows.map((workflow, index) => (
                  <tr key={workflow.workflow_id} className={`border-b border-glass hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'}`}>
                    <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] font-bold text-primary">{workflow.workflow_id}</td>
                    <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-main font-medium">{workflow.name}</td>
                    <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.category}</td>
                    <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.trigger_type}</td>
                    <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.total_nodes}</td>
                    <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.automation_percentage}%</td>
                    <td className="p-4 font-[family-name:var(--font-inter)] text-[13px] text-dim">{workflow.date_built}</td>
                    <td className="p-4">
                      {workflow.status === "live" ? (
                        <span className="flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[11px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> LIVE
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-[family-name:var(--font-inter)] text-[11px] font-bold text-neutral-400 bg-neutral-400/10 px-2 py-0.5 rounded-full w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> DRAFT
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link href={`/gallery/${workflow.workflow_id}`} className="font-[family-name:var(--font-orbitron)] text-[10px] text-primary hover:underline">
                        VIEW
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
