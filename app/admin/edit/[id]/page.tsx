import EditExhibitClient from "@/components/admin/EditExhibitClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <EditExhibitClient id={id} />;
}

export async function generateStaticParams() {
  try {
    const res = await fetch("https://firestore.googleapis.com/v1/projects/taskmaster-todo-8e733/databases/(default)/documents/workflows");
    const paramsList: Array<{ id: string }> = [];
    
    if (res.ok) {
      const data = await res.json();
      if (data.documents) {
        // Sort documents by created_at or createTime ascending
        const docs = [...data.documents].sort((a: any, b: any) => {
          const timeA = a.fields?.created_at?.timestampValue || a.createTime || "";
          const timeB = b.fields?.created_at?.timestampValue || b.createTime || "";
          return timeA.localeCompare(timeB);
        });
        
        docs.forEach((doc: any, index: number) => {
          paramsList.push({ id: `WF-${String(index + 1).padStart(3, '0')}` });
        });
      }
    } else {
      console.warn("Firestore REST API response is not OK:", res.status);
    }
    
    // Add "fallback" parameter to build the client-side fallback route
    paramsList.push({ id: "fallback" });
    return paramsList;
  } catch (err) {
    console.error("Failed to generate static params for edit page:", err);
    return [{ id: "fallback" }];
  }
}
