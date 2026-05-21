"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit, FaSignOutAlt, FaEye, FaInbox, FaFolderOpen, FaStar, FaRegStar, FaEnvelopeOpen, FaCheck, FaFolder } from "react-icons/fa";
import { useAllWorkflows } from "@/hooks/useWorkflows";
import { deleteWorkflow, getContactMessages, markContactMessageAsRead, deleteContactMessage, saveWorkflow } from "@/lib/firestore";
import { signOut } from "@/lib/auth";
import AdminGuard from "@/components/admin/AdminGuard";
import { ContactMessage, Workflow } from "@/types/workflow";

export default function AdminDashboard() {
  const { workflows, loading, error, refresh } = useAllWorkflows();
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"exhibits" | "messages">("exhibits");

  // Contact messages state
  const [messages, setMessages] = useState<(ContactMessage & { id: string })[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const msgs = await getContactMessages();
      setMessages(msgs);
    } catch (err) {
      console.error("Failed to fetch contact messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    }
  }, [activeTab]);

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

  const handleToggleFeatured = async (workflow: Workflow) => {
    if (!workflow.workflow_id) return;
    try {
      await saveWorkflow({
        ...workflow,
        featured: !workflow.featured
      });
      refresh();
    } catch (err) {
      console.error("Failed to toggle featured status:", err);
      alert("Failed to update featured status.");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markContactMessageAsRead(id);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    } catch (err) {
      console.error("Failed to mark message as read:", err);
      alert("Failed to update message status.");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    try {
      await deleteContactMessage(id);
      setMessages(prev => prev.filter(m => m.id !== id));
      if (expandedMessageId === id) setExpandedMessageId(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message.");
    }
  };

  const total = workflows.length;
  const liveCount = workflows.filter(w => w.status === "live").length;
  const draftCount = workflows.filter(w => w.status === "draft").length;
  const unreadMessagesCount = messages.filter(m => !m.read).length;

  return (
    <AdminGuard>
      <div className="pt-32 px-6 max-w-5xl mx-auto min-h-screen">
        {/* Title and Top Controls */}
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

        {/* Tab Selection */}
        <div className="flex border-b border-glass mb-8 gap-4">
          <button
            onClick={() => setActiveTab("exhibits")}
            className={`font-[family-name:var(--font-orbitron)] text-xs tracking-wider uppercase pb-3 px-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "exhibits"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-dim hover:text-primary"
            }`}
          >
            <FaFolder size={12} /> Exhibits Manager ({total})
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`font-[family-name:var(--font-orbitron)] text-xs tracking-wider uppercase pb-3 px-2 flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === "messages"
                ? "border-primary text-primary font-bold"
                : "border-transparent text-dim hover:text-primary"
            }`}
          >
            <FaInbox size={12} /> Contact Messages
            {unreadMessagesCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "exhibits" ? (
          loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
              <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
                Loading Collection Records...
              </span>
            </div>
          ) : (
            <>
              {/* Stats overview */}
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

              {/* Exhibits Table */}
              <div className="glass rounded-[24px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-glass bg-white/5">
                        <th className="p-4 font-[family-name:var(--font-orbitron)] text-[9px] uppercase tracking-wider text-dim">Featured</th>
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
                          <td colSpan={6} className="p-8 text-center text-dim font-[family-name:var(--font-inter)] text-sm">
                            No exhibits found. Click Add New Exhibit to seed your gallery.
                          </td>
                        </tr>
                      ) : (
                        workflows.map((workflow, index) => (
                          <tr key={workflow.workflow_id} className={`border-b border-glass hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'}`}>
                            <td className="p-4">
                              <button
                                onClick={() => handleToggleFeatured(workflow)}
                                className="text-dim hover:text-[#f59e0b] transition-colors"
                                title={workflow.featured ? "Unfeature Workflow" : "Feature Workflow"}
                              >
                                {workflow.featured ? (
                                  <FaStar className="text-[#f59e0b]" size={14} />
                                ) : (
                                  <FaRegStar size={14} />
                                )}
                              </button>
                            </td>
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
          )
        ) : (
          /* Contact Inbox tab view */
          loadingMessages ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
              <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
                Retrieving Contact Submissions...
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="glass p-12 text-center rounded-[24px]">
                  <p className="font-[family-name:var(--font-inter)] text-dim">Inbox is currently empty.</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isExpanded = expandedMessageId === message.id;
                  const date = message.submitted_at ? new Date(message.submitted_at instanceof Date ? message.submitted_at : (message.submitted_at as any).seconds * 1000) : new Date();
                  return (
                    <div
                      key={message.id}
                      className={`glass p-6 rounded-[20px] border transition-all ${
                        !message.read ? "border-l-[3px] border-l-primary" : "border-glass"
                      }`}
                    >
                      <div
                        onClick={() => {
                          setExpandedMessageId(isExpanded ? null : message.id);
                          if (!message.read) handleMarkRead(message.id);
                        }}
                        className="flex flex-wrap justify-between items-center gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${!message.read ? "bg-primary animate-pulse" : "bg-transparent"}`} />
                          <div>
                            <span className="font-[family-name:var(--font-orbitron)] text-xs text-primary font-bold block">
                              {message.name}
                            </span>
                            <span className="font-[family-name:var(--font-inter)] text-[11px] text-dim block">
                              {message.email} · {message.subject}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-[family-name:var(--font-inter)] text-[10px] text-dim">
                            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteMessage(message.id);
                            }}
                            className="text-dim hover:text-red-600 p-1.5 rounded transition-colors"
                            title="Delete Message"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable message details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-glass/40">
                          <div className="bg-black/5 p-4 rounded-xl font-[family-name:var(--font-inter)] text-sm text-main leading-relaxed whitespace-pre-line">
                            {message.message}
                          </div>
                          <div className="mt-4 flex gap-3 justify-end">
                            <a
                              href={`mailto:${message.email}?subject=Re: [Automation Gallery] ${message.subject}`}
                              className="btn-primary text-[10px] py-2 px-4 rounded-full flex items-center gap-1.5"
                            >
                              <FaEnvelopeOpen size={10} /> Reply Email
                            </a>
                            {!message.read && (
                              <button
                                onClick={() => handleMarkRead(message.id)}
                                className="btn-outline text-[10px] py-2 px-4 rounded-full flex items-center gap-1.5"
                              >
                                <FaCheck size={10} /> Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )
        )}
      </div>
    </AdminGuard>
  );
}
