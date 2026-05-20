"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useWorkflow } from "@/hooks/useWorkflows";
import { saveWorkflow } from "@/lib/firestore";
import WorkflowForm from "@/components/admin/WorkflowForm";
import AdminGuard from "@/components/admin/AdminGuard";

interface EditExhibitClientProps {
  id: string;
}

export default function EditExhibitClient({ id }: EditExhibitClientProps) {
  const router = useRouter();
  const { workflow, loading, error } = useWorkflow(id);

  const handleSave = async (data: any) => {
    await saveWorkflow(data);
    setTimeout(() => {
      router.push("/admin");
    }, 1500);
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
            EDIT EXHIBIT: {id}
          </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-glass border-t-primary rounded-full animate-spin mb-4" />
            <span className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-widest">
              Loading Exhibit Details...
            </span>
          </div>
        ) : error || !workflow ? (
          <div className="text-center py-12">
            <h3 className="font-[family-name:var(--font-orbitron)] text-lg text-red-600 uppercase mb-4">Error</h3>
            <p className="font-[family-name:var(--font-inter)] text-sm text-dim mb-8">
              Failed to retrieve exhibit record. It may have been deleted or the ID is incorrect.
            </p>
            <Link href="/admin" className="btn-outline">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <WorkflowForm initialData={workflow} onSave={handleSave} isEditing={true} />
        )}
      </div>
    </AdminGuard>
  );
}
