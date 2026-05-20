"use client";

import Link from "next/link";
import { useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaSignOutAlt, FaEye } from "react-icons/fa";
import { useAllWorkflows } from "@/hooks/useWorkflows";
import { deleteWorkflow } from "@/lib/firestore";
import { signOut } from "@/lib/auth";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminDashboard() {
  const { workflows, loading, error, refresh } = useAllWorkflows();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete exhibit ${id}? This action is permanent.`)) {
      return;
    }
    setDeleteLoading(id);
    try {
      await deleteWorkflow(id);
      refresh(); // Reload workflows list
    } catch (err) {
      console.error("Failed to delete workflow:", err);
      alert("Failed to delete exhibit. Check console for details.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const total = workflows.length;
  const liveCount = workflows.filter(w => w.status === "live").length;
  const draftCount = workflows.filter(w => w.status === "draft").length;

  return (
    <AdminGuard>
      <div className="pt-32 px-6 max-w-5xl mx-auto min-h-screen">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-12">
          <div>
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-2 block">
              THE CURATOR'S STUDIO
            </span>
            <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-primary">
              DASHBOARD
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                signOut().then(() => window.location.reload());
              }}
              className="btn-outline flex items-center gap-2 text-xs py-3"
            >
              <FaSignOutAlt size={12} /> SIGN OUT
            </button>
            <Link href="/admin/new" className="btn-primary flex items-center gap-2">
              <FaPlus size={12} /> ADD NEW EXHIBIT
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
              Loading Collection Records...
            </span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="glass p-6 rounded-2xl">
                <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-wider block mb-2">Total Exhibits</span>
                <span className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-primary">{total}</span>
              </div>
              <div className="glass p-6 rounded-2xl">
                <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-wider block mb-2">Live</span>
                <span className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[#10b981]">{liveCount}</span>
              </div>
              <div className="glass p-6 rounded-2xl">
                <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-wider block mb-2">Drafts</span>
                <span className="font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[#f59e0b]">{draftCount}</span>
              </div>
              <div className="glass p-6 rounded-2xl flex flex-col justify-center items-end gap-2 bg-primary/5">
                <Link href="/gallery" className="font-[family-name:var(--font-orbitron)] text-[10px] text-primary font-bold uppercase tracking-wider hover:underline transition-all">
                  VIEW PUBLIC GALLERY →
                </Link>
              </div>
            </div>

            <div className="glass rounded-[24px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-glass bg-white/5">
                      <th className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">ID</th>
                      <th className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">Name</th>
                      <th className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">Status</th>
                      <th className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">Category</th>
                      <th className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workflows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-dim font-[family-name:var(--font-inter)] text-sm">
                          No exhibits found. Click Add New Exhibit to seed your gallery.
                        </td>
                      </tr>
                    ) : (
                      workflows.map((workflow, index) => (
                        <tr key={workflow.workflow_id} className={`border-b border-glass hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
                          <td className="p-4 font-[family-name:var(--font-inter)] text-sm font-bold text-primary">{workflow.workflow_id}</td>
                          <td className="p-4 font-[family-name:var(--font-inter)] text-sm font-medium text-main">{workflow.name}</td>
                          <td className="p-4">
                            {workflow.status === "live" ? (
                              <span className="text-[9px] font-[family-name:var(--font-orbitron)] uppercase bg-[#10b981]/10 text-[#10b981] px-2 py-0.5 rounded font-bold">LIVE</span>
                            ) : (
                              <span className="text-[9px] font-[family-name:var(--font-orbitron)] uppercase bg-neutral-400/10 text-neutral-400 px-2 py-0.5 rounded font-bold">DRAFT</span>
                            )}
                          </td>
                          <td className="p-4 font-[family-name:var(--font-inter)] text-sm text-dim">{workflow.category}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <Link href={`/gallery/${workflow.workflow_id}`} className="text-dim hover:text-primary transition-colors" title="View Exhibit">
                                <FaEye size={14} />
                              </Link>
                              <Link href={`/admin/edit/${workflow.workflow_id}`} className="text-dim hover:text-primary transition-colors" title="Edit Exhibit">
                                <FaEdit size={14} />
                              </Link>
                              <button
                                onClick={() => handleDelete(workflow.workflow_id)}
                                className="text-dim hover:text-red-600 transition-colors"
                                title="Delete Exhibit"
                                disabled={deleteLoading === workflow.workflow_id}
                              >
                                {deleteLoading === workflow.workflow_id ? (
                                  <div className="w-3.5 h-3.5 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FaTrash size={13} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminGuard>
  );
}
