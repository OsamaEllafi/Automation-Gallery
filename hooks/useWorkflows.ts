"use client";

import { useState, useEffect } from "react";
import { getLiveWorkflows, getWorkflow, getAllWorkflows } from "@/lib/firestore";
import { Workflow } from "@/types/workflow";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

export function useLiveWorkflows(pageSize: number = 9) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkflows = async (isInitial = false) => {
    try {
      setLoading(true);
      const currentLastDoc = isInitial ? undefined : (lastDoc || undefined);
      const res = await getLiveWorkflows(pageSize, currentLastDoc);
      
      if (isInitial) {
        setWorkflows(res.workflows);
      } else {
        setWorkflows(prev => [...prev, ...res.workflows]);
      }
      
      setLastDoc(res.lastDoc);
      setHasMore(res.workflows.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch workflows"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { workflows, loading, error, hasMore, loadMore: () => fetchWorkflows(false) };
}

export function useAllWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await getAllWorkflows();
      setWorkflows(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err : new Error("Failed to fetch all workflows"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return { workflows, loading, error, refresh: fetch };
}

export function useWorkflow(id: string) {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getWorkflow(id);
      setWorkflow(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err : new Error("Failed to fetch workflow"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [id]);

  return { workflow, loading, error, refresh: fetch };
}
