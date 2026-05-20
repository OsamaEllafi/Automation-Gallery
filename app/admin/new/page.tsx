"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { saveWorkflow } from "@/lib/firestore";
import WorkflowForm from "@/components/admin/WorkflowForm";
import AdminGuard from "@/components/admin/AdminGuard";

export default function NewExhibitPage() {
  const router = useRouter();

  const handleSave = async (data: any) => {
    await saveWorkflow(data);
    setTimeout(() => {
      router.push("/admin");
    }, 1500); // Small timeout to allow the user to see the success toast
  };

  return (
    <AdminGuard>
      <div className="pt-32 pb-24 px-6 max-w-4xl mx-auto min-h-screen">
        <Link href="/admin" className="flex items-center gap-2 text-dim hover:text-primary transition-colors font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-wider mb-8">
          <FaArrowLeft size={10} /> BACK TO DASHBOARD
        </Link>
        
        <div className="mb-12">
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] tracking-widest text-dim uppercase mb-2 block">
            CURATOR'S STUDIO
          </span>
          <h1 className="font-[family-name:var(--font-orbitron)] text-4xl font-bold text-primary">
            ADD NEW EXHIBIT
          </h1>
        </div>

        <WorkflowForm onSave={handleSave} />
      </div>
    </AdminGuard>
  );
}
