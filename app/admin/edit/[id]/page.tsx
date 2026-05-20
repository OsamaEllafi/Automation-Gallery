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
    if (!res.ok) {
      console.warn("Firestore REST API response is not OK:", res.status);
      return [];
    }
    const data = await res.json();
    if (!data.documents) return [];
    return data.documents.map((doc: any) => {
      const nameParts = doc.name.split('/');
      const id = nameParts[nameParts.length - 1];
      return { id };
    });
  } catch (err) {
    console.error("Failed to generate static params for edit page:", err);
    return [];
  }
}
