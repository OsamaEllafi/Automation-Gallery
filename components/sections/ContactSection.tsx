"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaEnvelope, FaPaperPlane } from "react-icons/fa";
import Link from "next/link";
import { submitContactMessage } from "@/lib/firestore";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Collaboration");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !messageText.trim()) {
      setStatusMsg({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      await submitContactMessage({
        name: name.trim(),
        email: email.trim(),
        subject,
        message: messageText.trim()
      });
      setStatusMsg({ type: "success", text: "Message sent! Osama will be in touch shortly." });
      setName("");
      setEmail("");
      setMessageText("");
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-6 max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-4 block">
          GET IN TOUCH
        </span>
        <h2 className="font-[family-name:var(--font-orbitron)] text-[2.5rem] font-bold text-primary mb-4">
          START A CONVERSATION
        </h2>
        <p className="font-[family-name:var(--font-inter)] text-dim mb-10">
          For collaboration, consulting, or just to talk automation.
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Link href="https://github.com/osama" target="_blank" className="glass px-6 py-3 rounded-full flex items-center gap-2 hover:border-primary/20 transition-colors">
            <FaGithub size={16} className="text-primary" />
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-wider text-primary">GitHub</span>
          </Link>
          <Link href="https://linkedin.com/in/osama" target="_blank" className="glass px-6 py-3 rounded-full flex items-center gap-2 hover:border-primary/20 transition-colors">
            <FaLinkedin size={16} className="text-primary" />
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-wider text-primary">LinkedIn</span>
          </Link>
          <Link href="mailto:contact@autonomix.ly" className="glass px-6 py-3 rounded-full flex items-center gap-2 hover:border-primary/20 transition-colors">
            <FaEnvelope size={16} className="text-primary" />
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-wider text-primary">Email</span>
          </Link>
        </div>

        {statusMsg && (
          <div className={`p-4 rounded-xl border text-left font-[family-name:var(--font-inter)] text-sm mb-6 ${
            statusMsg.type === "success" 
              ? "bg-[#10b981]/10 border-[#10b981]/20 text-[#059669]" 
              : "bg-red-500/10 border-red-500/20 text-red-600"
          }`}>
            {statusMsg.text}
          </div>
        )}

        <form className="glass-premium rounded-[32px] p-8 text-left flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim">Name</label>
              <input 
                type="text" 
                className="bg-white/50 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30" 
                placeholder="Jane Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim">Email</label>
              <input 
                type="email" 
                className="bg-white/50 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30" 
                placeholder="jane@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim">Subject</label>
            <select 
              className="bg-white/50 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30 text-primary"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="Collaboration">Collaboration</option>
              <option value="Consulting">Consulting</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim">Message</label>
            <textarea 
              className="bg-white/50 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30 min-h-[120px]" 
              placeholder="How can we work together?" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-2 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaPaperPlane size={12} /> SEND MESSAGE
              </>
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
}
