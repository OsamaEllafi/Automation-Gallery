import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, setDoc, updateDoc, deleteDoc, Timestamp, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Workflow, SiteStats } from "@/types/workflow";

// Workflows Collection
export const WORKFLOWS_COLLECTION = "workflows";

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const docRef = doc(db, WORKFLOWS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Workflow;
  }
  return null;
}

export async function getAllWorkflows(): Promise<Workflow[]> {
  const q = query(collection(db, WORKFLOWS_COLLECTION), orderBy("created_at", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
}

export async function getLiveWorkflows(pageSize: number = 9, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ workflows: Workflow[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  let q;
  if (lastDoc) {
    q = query(
      collection(db, WORKFLOWS_COLLECTION),
      where("status", "==", "live"),
      orderBy("created_at", "desc"),
      startAfter(lastDoc),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, WORKFLOWS_COLLECTION),
      where("status", "==", "live"),
      orderBy("created_at", "desc"),
      limit(pageSize)
    );
  }

  const querySnapshot = await getDocs(q);
  const workflows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
  const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null;
  
  return { workflows, lastDoc: newLastDoc };
}

export async function saveWorkflow(workflow: Partial<Workflow>): Promise<void> {
  if (!workflow.workflow_id) throw new Error("Workflow ID is required");
  
  const docRef = doc(db, WORKFLOWS_COLLECTION, workflow.workflow_id);
  const dataToSave = {
    ...workflow,
    updated_at: Timestamp.now(),
  };
  
  // If it's new
  if (!workflow.created_at) {
    dataToSave.created_at = Timestamp.now();
  }
  
  await setDoc(docRef, dataToSave, { merge: true });
}

export async function deleteWorkflow(id: string): Promise<void> {
  await deleteDoc(doc(db, WORKFLOWS_COLLECTION, id));
}

// Stats Collection
export const STATS_COLLECTION = "site_stats";
export const GLOBAL_STATS_DOC = "global";

export async function getSiteStats(): Promise<SiteStats | null> {
  try {
    const q = query(collection(db, WORKFLOWS_COLLECTION), where("status", "==", "live"));
    const querySnapshot = await getDocs(q);
    const workflows = querySnapshot.docs.map(doc => doc.data() as Workflow);
    
    const total_workflows = workflows.length;
    let total_nodes = 0;
    const categoriesSet = new Set<string>();
    let total_automation = 0;
    
    workflows.forEach(w => {
      total_nodes += w.total_nodes || 0;
      if (w.category) {
        categoriesSet.add(w.category);
      }
      total_automation += w.automation_percentage || 0;
    });
    
    const categories = Array.from(categoriesSet);
    const avg_automation = total_workflows > 0 ? Math.round(total_automation / total_workflows) : 0;
    
    return {
      total_workflows,
      total_nodes,
      categories,
      avg_automation
    };
  } catch (err) {
    console.error("Error calculating dynamic site stats:", err);
    return null;
  }
}

// Contact Messages Collection
import { addDoc } from "firebase/firestore";

export async function submitContactMessage(message: { name: string; email: string; subject: string; message: string }): Promise<void> {
  const collectionRef = collection(db, "contact_messages");
  await addDoc(collectionRef, {
    ...message,
    submitted_at: Timestamp.now(),
    read: false
  });
}
