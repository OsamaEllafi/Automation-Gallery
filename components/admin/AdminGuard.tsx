"use client";

import { useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signInWithGoogle, signOut } from "@/lib/auth";
import { motion } from "framer-motion";
import { FaGoogle, FaLock, FaExclamationTriangle } from "react-icons/fa";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Validate admin email
        const allowedEmails = [
          "osama@autonomix.ly",
          process.env.NEXT_PUBLIC_ADMIN_EMAIL
        ].filter(Boolean);

        const email = currentUser.email || "";
        const isAllowed = 
          allowedEmails.includes(email) || 
          email.endsWith("@autonomix.ly") ||
          email.toLowerCase().includes("osama"); // flexible check for Osama's personal emails

        if (isAllowed) {
          setUser(currentUser);
          setErrorMsg(null);
        } else {
          setUser(null);
          setErrorMsg(`Access restricted. ${email} is not authorized as a curator.`);
          signOut(); // Sign out the unauthorized user
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to sign in. Please try again.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f6f8] px-6">
        <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
        <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
          Authenticating curator...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f6f8] px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-premium border border-glass max-w-md w-full p-8 text-center shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
            <FaLock className="text-primary text-xl" />
          </div>

          <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-2 block">
            THE CURATOR'S STUDIO
          </span>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-primary mb-4">
            RESTRICTED ACCESS
          </h1>
          <p className="font-[family-name:var(--font-inter)] text-sm text-dim mb-8">
            This area is reserved for the gallery curator. Sign in with an authorized Google account to manage exhibits.
          </p>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl p-4 mb-6 flex items-start gap-3 text-left font-[family-name:var(--font-inter)]">
              <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleSignIn}
            className="btn-primary w-full flex items-center justify-center gap-3 py-4"
          >
            <FaGoogle size={14} /> SIGN IN WITH GOOGLE
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
