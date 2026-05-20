import { Timestamp } from "firebase/firestore";

export interface NodeMapItem {
  label: string;
  type: "trigger" | "action" | "integration" | "condition" | "output";
  order: number;
}

export interface Workflow {
  id?: string; // Document ID
  workflow_id: string;
  name: string;
  short_description: string;
  long_description: string;
  status: "live" | "draft";
  featured: boolean;
  category: string;
  trigger_type: string;
  complexity_score: number;
  tags: string[];
  total_nodes: number;
  automation_percentage: number;
  steps_automated: number;
  hours_saved_per_month: number | null;
  date_built: string;
  node_map_data: NodeMapItem[];
  connected_services: string[];
  primary_integration: string;
  demo_video_url: string | null;
  thumbnail_url: string | null;
  json_export_url: string | null;
  problem: string;
  solution: string;
  notes: string | null;
  related_workflow_ids: string[];
  created_at?: Timestamp | Date;
  updated_at?: Timestamp | Date;
}

export interface SiteStats {
  total_workflows: number;
  total_nodes: number;
  categories: string[];
  last_updated?: Timestamp | Date;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
  submitted_at: Timestamp | Date;
  read: boolean;
}
