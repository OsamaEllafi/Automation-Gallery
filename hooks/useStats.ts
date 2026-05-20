"use client";

import { useState, useEffect } from "react";
import { getSiteStats } from "@/lib/firestore";
import { SiteStats } from "@/types/workflow";

export function useStats() {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getSiteStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return { stats, loading };
}
