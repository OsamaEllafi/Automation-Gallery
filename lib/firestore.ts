import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, setDoc, updateDoc, deleteDoc, Timestamp, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { Workflow, SiteStats, ContactMessage } from "@/types/workflow";

// Workflows Collection
export const WORKFLOWS_COLLECTION = "workflows";

export async function getAllWorkflowsWithDynamicIds(): Promise<Workflow[]> {
  const q = query(collection(db, WORKFLOWS_COLLECTION));
  const querySnapshot = await getDocs(q);
  const workflows = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      created_at: data.created_at || Timestamp.now()
    } as Workflow;
  });
  
  // Sort ascending by creation time to assign sequential IDs chronologically
  workflows.sort((a, b) => {
    const timeA = a.created_at instanceof Timestamp ? a.created_at.toMillis() : new Date(a.created_at || 0).getTime();
    const timeB = b.created_at instanceof Timestamp ? b.created_at.toMillis() : new Date(b.created_at || 0).getTime();
    return timeA - timeB;
  });
  
  // Map dynamic workflow_id
  return workflows.map((w, index) => ({
    ...w,
    workflow_id: `WF-${String(index + 1).padStart(3, '0')}`
  }));
}

export async function getWorkflow(id: string): Promise<Workflow | null> {
  const workflows = await getAllWorkflowsWithDynamicIds();
  const found = workflows.find(w => w.workflow_id === id || w.id === id);
  return found || null;
}

export async function getAllWorkflows(): Promise<Workflow[]> {
  const workflows = await getAllWorkflowsWithDynamicIds();
  // Return in descending order (newest first)
  return [...workflows].sort((a, b) => {
    const timeA = a.created_at instanceof Timestamp ? a.created_at.toMillis() : new Date(a.created_at || 0).getTime();
    const timeB = b.created_at instanceof Timestamp ? b.created_at.toMillis() : new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });
}

export async function getLiveWorkflows(pageSize: number = 9, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ workflows: Workflow[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  // Fetch all documents to assign dynamic IDs chronologically
  const q = query(collection(db, WORKFLOWS_COLLECTION));
  const querySnapshot = await getDocs(q);
  
  const snapMap = new Map<string, QueryDocumentSnapshot<DocumentData>>();
  querySnapshot.docs.forEach(doc => {
    snapMap.set(doc.id, doc);
  });
  
  const workflows = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      created_at: data.created_at || Timestamp.now()
    } as Workflow;
  });
  
  // Sort ascending by creation time to assign sequential IDs chronologically
  workflows.sort((a, b) => {
    const timeA = a.created_at instanceof Timestamp ? a.created_at.toMillis() : new Date(a.created_at || 0).getTime();
    const timeB = b.created_at instanceof Timestamp ? b.created_at.toMillis() : new Date(b.created_at || 0).getTime();
    return timeA - timeB;
  });
  
  // Assign dynamic workflow_id
  const workflowsWithIds = workflows.map((w, index) => ({
    ...w,
    workflow_id: `WF-${String(index + 1).padStart(3, '0')}`
  }));
  
  // Filter by status == live
  const liveWorkflows = workflowsWithIds.filter(w => w.status === "live");
  
  // Sort live workflows by created_at descending (newest first)
  liveWorkflows.sort((a, b) => {
    const timeA = a.created_at instanceof Timestamp ? a.created_at.toMillis() : new Date(a.created_at || 0).getTime();
    const timeB = b.created_at instanceof Timestamp ? b.created_at.toMillis() : new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });
  
  // Find start index based on lastDoc
  let startIndex = 0;
  if (lastDoc) {
    const lastDocId = lastDoc.id;
    const index = liveWorkflows.findIndex(w => w.id === lastDocId);
    if (index !== -1) {
      startIndex = index + 1;
    }
  }
  
  // Slice page
  const pageWorkflows = liveWorkflows.slice(startIndex, startIndex + pageSize);
  
  // Get last doc snapshot for pagination
  let newLastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
  if (pageWorkflows.length > 0) {
    const lastPageItem = pageWorkflows[pageWorkflows.length - 1];
    newLastDoc = snapMap.get(lastPageItem.id!) || null;
  }
  
  return { workflows: pageWorkflows, lastDoc: newLastDoc };
}

export async function saveWorkflow(workflow: Partial<Workflow>): Promise<void> {
  const docRef = workflow.id 
    ? doc(db, WORKFLOWS_COLLECTION, workflow.id) 
    : doc(collection(db, WORKFLOWS_COLLECTION));
  
  const dataToSave = {
    ...workflow,
    id: docRef.id,
    updated_at: Timestamp.now(),
  };
  
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

export async function getContactMessages(): Promise<(ContactMessage & { id: string })[]> {
  const q = query(collection(db, "contact_messages"), orderBy("submitted_at", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessage & { id: string }));
}

export async function markContactMessageAsRead(id: string): Promise<void> {
  const docRef = doc(db, "contact_messages", id);
  await updateDoc(docRef, { read: true });
}

export async function deleteContactMessage(id: string): Promise<void> {
  const docRef = doc(db, "contact_messages", id);
  await deleteDoc(docRef);
}

export async function getWorkflowsByIds(ids: string[]): Promise<Workflow[]> {
  if (!ids || ids.length === 0) return [];
  const promises = ids.map(id => getWorkflow(id));
  const results = await Promise.all(promises);
  return results.filter((w): w is Workflow => w !== null);
}
