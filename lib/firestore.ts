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
  const docRef = doc(db, STATS_COLLECTION, GLOBAL_STATS_DOC);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as SiteStats;
  }
  return null;
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
