import { useState, useEffect, useRef } from "react";
import { Workflow, NodeMapItem } from "@/types/workflow";
import { FaTrash, FaPlus, FaSave, FaEye, FaArrowLeft, FaCheck, FaCopy, FaUpload, FaWrench, FaArrowRight, FaTimes } from "react-icons/fa";
import Link from "next/link";
import NodeMapSVG from "@/components/sections/NodeMapSVG";
import { motion, AnimatePresence } from "framer-motion";

// Drag and drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface WorkflowFormProps {
  initialData?: Workflow | null;
  onSave: (data: Partial<Workflow>) => Promise<void>;
  isEditing?: boolean;
}

const availableServices = [
  "Google Sheets", "Gmail", "Slack", "Google Workspace", "SignWell",
  "Datadog", "Jira", "PagerDuty", "OpenAI", "Salesforce",
  "Google Docs", "DocuSign", "Notion", "Airtable", "Trello",
  "WhatsApp", "Discord", "PostgreSQL", "MySQL", "Twilio",
  "GitHub", "Make", "Zapier"
];

const nodeTypes = [
  { value: "trigger", label: "Trigger (Starts the flow)" },
  { value: "action", label: "Action (Local operation)" },
  { value: "integration", label: "Integration (External app)" },
  { value: "condition", label: "Condition (IF/ELSE decision)" },
  { value: "output", label: "Output / Completion" }
];

const n8nFamousNodes = [
  // Triggers
  { label: "Webhook Trigger", type: "trigger" },
  { label: "Schedule Trigger (Cron)", type: "trigger" },
  { label: "Gmail (On Email Received)", type: "trigger" },
  { label: "Google Sheets (On Row Added)", type: "trigger" },
  { label: "Slack (On Message Received)", type: "trigger" },
  { label: "GitHub (On PR/Commit)", type: "trigger" },
  { label: "Stripe (On Payment Success)", type: "trigger" },
  { label: "Shopify (On Order Placed)", type: "trigger" },
  
  // Logic
  { label: "IF Condition", type: "condition" },
  { label: "Switch Node", type: "condition" },
  { label: "Filter Data", type: "condition" },
  { label: "Merge Streams", type: "action" },
  { label: "Wait Delay", type: "action" },
  { label: "Error Trigger", type: "trigger" },
  
  // Actions
  { label: "Set Fields", type: "action" },
  { label: "Code Execution", type: "action" },
  { label: "HTTP Request", type: "action" },
  { label: "Edit Fields (Set)", type: "action" },
  { label: "HTML Extract", type: "action" },
  { label: "XML Parser", type: "action" },
  { label: "Crypto Node", type: "action" },
  
  // Integrations
  { label: "Slack (Send Message)", type: "integration" },
  { label: "Gmail (Send Email)", type: "integration" },
  { label: "Google Sheets (Add Row)", type: "integration" },
  { label: "Airtable (Update Record)", type: "integration" },
  { label: "OpenAI (GPT Completion)", type: "integration" },
  { label: "WhatsApp (Send Msg)", type: "integration" },
  { label: "Notion (Create Page)", type: "integration" },
  { label: "Trello (Create Card)", type: "integration" },
  { label: "PostgreSQL Query", type: "integration" },
  { label: "Discord (Post Message)", type: "integration" },
  { label: "Twilio (Send SMS)", type: "integration" },
  { label: "HubSpot (Update Contact)", type: "integration" },
  { label: "Salesforce (Upsert Record)", type: "integration" },
  { label: "Mailchimp (Add Subscriber)", type: "integration" },
  { label: "Google Docs (Create Doc)", type: "integration" },
  { label: "Google Drive (Upload File)", type: "integration" },
  { label: "AWS S3 (Upload Object)", type: "integration" },
  { label: "Jira (Create Issue)", type: "integration" },
  
  // Outputs
  { label: "Success Complete", type: "output" },
  { label: "Error Capture", type: "output" },
  { label: "Respond to Webhook", type: "output" }
];

export default function WorkflowForm({ initialData, onSave, isEditing = false }: WorkflowFormProps) {
  // Identification
  const [workflowId, setWorkflowId] = useState(initialData?.workflow_id || "");
  const [name, setName] = useState(initialData?.name || "");
  const [shortDesc, setShortDesc] = useState(initialData?.short_description || "");
  const [longDesc, setLongDesc] = useState(initialData?.long_description || "");
  const [status, setStatus] = useState<"draft" | "live">(initialData?.status || "draft");
  const [featured, setFeatured] = useState(initialData?.featured || false);

  // Classification
  const [category, setCategory] = useState(initialData?.category || "Productivity & Operations");
  const [customCategory, setCustomCategory] = useState("");
  const [triggerType, setTriggerType] = useState(initialData?.trigger_type || "Webhook");
  const [complexityScore, setComplexityScore] = useState<number>(initialData?.complexity_score || 3);
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(", ") || "");

  // Metrics
  const [totalNodes, setTotalNodes] = useState<number>(initialData?.total_nodes || 5);
  const [automationPercent, setAutomationPercent] = useState<number>(initialData?.automation_percentage || 85);
  const [stepsAutomated, setStepsAutomated] = useState<number>(initialData?.steps_automated || 3);
  const [hoursSaved, setHoursSaved] = useState<number>(initialData?.hours_saved_per_month || 10);
  const [dateBuilt, setDateBuilt] = useState(initialData?.date_built || new Date().toISOString().split("T")[0]);

  // Connected Services & Primary Integration
  const [selectedServices, setSelectedServices] = useState<string[]>(initialData?.connected_services || []);
  const [primaryIntegration, setPrimaryIntegration] = useState(initialData?.primary_integration || "");

  // Node Map Builder with IDs
  const [nodes, setNodes] = useState<NodeMapItem[]>(() => {
    const rawNodes = initialData?.node_map_data || [
      { label: "Webhook Received", type: "trigger", order: 1 }
    ];
    return rawNodes.map((node, i) => ({
      ...node,
      id: node.id || `node-${Date.now()}-${i}-${Math.random()}`
    }));
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Story
  const [problem, setProblem] = useState(initialData?.problem || "");
  const [solution, setSolution] = useState(initialData?.solution || "");
  const [notes, setNotes] = useState(initialData?.notes || "");

  // Media, Downloads & Relationships
  const [demoVideoUrl, setDemoVideoUrl] = useState(initialData?.demo_video_url || "");
  const [jsonExportUrl, setJsonExportUrl] = useState(initialData?.json_export_url || "");
  const [relatedWorkflowIdsInput, setRelatedWorkflowIdsInput] = useState(initialData?.related_workflow_ids?.join(", ") || "");

  // UI state
  const [showPreview, setShowPreview] = useState(true); // Defaults to true
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // n8n Import states
  const [n8nJsonInput, setN8nJsonInput] = useState("");
  const [showN8nImportModal, setShowN8nImportModal] = useState(false);

  // Workflow ID is now dynamically assigned chronologically on retrieval.


  // Automatically sync totalNodes count with the number of nodes in the builder
  useEffect(() => {
    setTotalNodes(nodes.length);
  }, [nodes.length]);

  // Automatically detect services from node labels
  useEffect(() => {
    const detected = new Set<string>();
    nodes.forEach(node => {
      const lower = node.label.toLowerCase();
      if (lower.includes("slack")) detected.add("Slack");
      if (lower.includes("gmail") || lower.includes("email") || lower.includes("mail")) detected.add("Gmail");
      if (lower.includes("sheet") || lower.includes("excel")) detected.add("Google Sheets");
      if (lower.includes("docs")) detected.add("Google Docs");
      if (lower.includes("notion")) detected.add("Notion");
      if (lower.includes("airtable")) detected.add("Airtable");
      if (lower.includes("trello")) detected.add("Trello");
      if (lower.includes("github")) detected.add("GitHub");
      if (lower.includes("openai") || lower.includes("gpt") || lower.includes("ai")) detected.add("OpenAI");
      if (lower.includes("postgres")) detected.add("PostgreSQL");
      if (lower.includes("mysql")) detected.add("MySQL");
      if (lower.includes("whatsapp")) detected.add("WhatsApp");
      if (lower.includes("discord")) detected.add("Discord");
    });
    
    if (detected.size > 0) {
      setSelectedServices(prev => {
        const next = new Set([...prev]);
        let changed = false;
        detected.forEach(s => {
          if (!next.has(s)) {
            next.add(s);
            changed = true;
          }
        });
        return changed ? Array.from(next) : prev;
      });
    }
  }, [nodes]);

  // Handle Tag Input Change
  const getTagsArray = () => {
    return tagsInput
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);
  };

  // Node builder functions
  const addNode = () => {
    setNodes([
      ...nodes,
      { 
        id: `node-${Date.now()}-${Math.random()}`,
        label: "", 
        type: "action", 
        order: nodes.length + 1 
      }
    ]);
  };

  const removeNode = (index: number) => {
    const updated = nodes.filter((_, i) => i !== index);
    const reordered = updated.map((node, i) => ({
      ...node,
      order: i + 1
    }));
    setNodes(reordered);
  };

  const duplicateNode = (index: number) => {
    const nodeToClone = nodes[index];
    const newNode = {
      ...nodeToClone,
      id: `node-${Date.now()}-${Math.random()}`,
      order: nodeToClone.order + 1,
      description: nodeToClone.description ? `${nodeToClone.description} (Copy)` : ""
    };
    
    const updated = [...nodes];
    updated.splice(index + 1, 0, newNode);
    
    const reordered = updated.map((node, i) => ({
      ...node,
      order: i + 1
    }));
    setNodes(reordered);
  };

  const updateNode = (index: number, field: keyof NodeMapItem, value: any) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], [field]: value };
    setNodes(updated);
  };

  const applyTemplate = (templateNodes: any[]) => {
    if (confirm("Are you sure you want to load this template? It will overwrite your current node map steps.")) {
      const mapped = templateNodes.map((n, i) => ({
        ...n,
        id: `node-${Date.now()}-${i}-${Math.random()}`,
        order: i + 1
      }));
      setNodes(mapped);
    }
  };

  const handleN8nImport = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      let n8nNodes = parsed.nodes;
      if (!n8nNodes && Array.isArray(parsed)) {
        n8nNodes = parsed;
      }
      if (!Array.isArray(n8nNodes)) {
        throw new Error("Could not find nodes array in JSON.");
      }

      const mappedNodes: NodeMapItem[] = n8nNodes.map((n: any, idx: number) => {
        const label = n.name || n.type || "n8n Node";
        const typeStr = n.type || "";
        let type: NodeMapItem["type"] = "action";
        
        const lowerType = typeStr.toLowerCase();
        if (lowerType.includes("trigger") || lowerType.includes("webhook") || lowerType.includes("cron") || lowerType.includes("interval")) {
          type = "trigger";
        } else if (lowerType.includes("if") || lowerType.includes("switch") || lowerType.includes("filter")) {
          type = "condition";
        } else if (lowerType.includes("complete") || lowerType.includes("end") || lowerType.includes("respond")) {
          type = "output";
        } else if (
          lowerType.includes("slack") || lowerType.includes("gmail") || lowerType.includes("sheet") || 
          lowerType.includes("notion") || lowerType.includes("trello") || lowerType.includes("github") || 
          lowerType.includes("openai") || lowerType.includes("database") || lowerType.includes("postgres") ||
          lowerType.includes("airtable") || lowerType.includes("whatsapp")
        ) {
          type = "integration";
        }
        
        return {
          id: `node-${Date.now()}-${idx}-${Math.random()}`,
          label,
          type,
          order: idx + 1,
          description: `Imported from n8n: ${n.type}`
        };
      });

      if (mappedNodes.length > 0) {
        setNodes(mappedNodes);
        setShowN8nImportModal(false);
        setN8nJsonInput("");
        setMessage({ type: "success", text: `Successfully imported ${mappedNodes.length} nodes from n8n JSON.` });
      }
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((item) => (item.id || item.order.toString()) === active.id);
        const newIndex = items.findIndex((item) => (item.id || item.order.toString()) === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((node, i) => ({
          ...node,
          order: i + 1
        }));
      });
    }
  };

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent, forceStatus?: "draft" | "live") => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const activeStatus = forceStatus || status;

    if (!name || !shortDesc) {
      setMessage({ type: "error", text: "Please fill in all required fields (Name, Short Description)." });
      setLoading(false);
      return;
    }

    try {
      const finalCategory = category === "Other" && customCategory ? customCategory : category;

      const payload: Partial<Workflow> = {
        id: initialData?.id || undefined,
        workflow_id: isEditing ? workflowId : "PENDING",
        name: name.trim(),
        short_description: shortDesc.trim(),
        long_description: longDesc.trim(),
        status: activeStatus,
        featured,
        category: finalCategory,
        trigger_type: triggerType as any,
        complexity_score: Number(complexityScore),
        tags: getTagsArray(),
        total_nodes: Number(totalNodes),
        automation_percentage: Number(automationPercent),
        steps_automated: Number(stepsAutomated),
        hours_saved_per_month: Number(hoursSaved),
        date_built: dateBuilt,
        node_map_data: nodes.filter(n => n.label.trim() !== ""),
        connected_services: selectedServices,
        primary_integration: primaryIntegration.trim() || selectedServices[0] || "n8n",
        problem: problem.trim(),
        solution: solution.trim(),
        notes: notes.trim() || null,
        demo_video_url: demoVideoUrl.trim() || null,
        json_export_url: jsonExportUrl.trim() || null,
        related_workflow_ids: relatedWorkflowIdsInput.split(",").map(id => id.trim().toUpperCase()).filter(Boolean),
        created_at: initialData?.created_at || undefined
      };

      await onSave(payload);
      setMessage({
        type: "success",
        text: `Exhibit "${name}" successfully ${isEditing ? "updated" : "published"}!`
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to save workflow. Please check Firestore permissions." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {message && (
        <div className={`p-4 rounded-xl border font-[family-name:var(--font-inter)] text-sm ${
          message.type === "success" 
            ? "bg-[#10b981]/10 border-[#10b981]/20 text-[#059669]" 
            : "bg-red-500/10 border-red-500/20 text-red-600"
        }`}>
          {message.text}
        </div>
      )}

      <form className="glass-premium rounded-[32px] p-8 flex flex-col gap-10" onSubmit={(e) => handleSubmit(e)}>
        {/* IDENTIFICATION */}
        <div>
          <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest border-b border-glass pb-2 mb-6">
            I. IDENTIFICATION
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Workflow ID</label>
              <div className="bg-black/10 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm text-dim select-none">
                {isEditing ? workflowId : "Auto-assigned on publish"}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Workflow Name*</label>
              <input 
                type="text" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                placeholder="e.g. Lead Router Pipeline"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Short Description*</label>
            <textarea 
              className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30 min-h-[80px]"
              placeholder="Brief summary shown on collection cards (max 160 characters)"
              maxLength={160}
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
            />
            <span className="text-[10px] text-dim font-mono text-right">{shortDesc.length}/160</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Long Description (Architectural Narrative)</label>
            <textarea 
              className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30 min-h-[140px]"
              placeholder="In-depth technical breakdown and design decisions for the exhibit detail room."
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value)}
            />
          </div>
        </div>

        {/* CLASSIFICATION */}
        <div>
          <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest border-b border-glass pb-2 mb-6">
            II. CLASSIFICATION & COMPLEXITY
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Category*</label>
              <select 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Marketing & Lead Gen">Marketing & Lead Gen</option>
                <option value="Sales & CRM">Sales & CRM</option>
                <option value="DevOps & IT Admin">DevOps & IT Admin</option>
                <option value="Data Pipelines & ETL">Data Pipelines & ETL</option>
                <option value="AI & Smart Assistants">AI & Smart Assistants</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Finance & Invoicing">Finance & Invoicing</option>
                <option value="HR & Employee Ops">HR & Employee Ops</option>
                <option value="Productivity & Operations">Productivity & Operations</option>
                <option value="Other">Other (Specify below)</option>
              </select>
            </div>

            {category === "Other" && (
              <div className="flex flex-col gap-2">
                <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Custom Category</label>
                <input 
                  type="text" 
                  className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                  placeholder="e.g. Legal Automation"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Trigger Type*</label>
              <select 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
              >
                <option value="Webhook">Webhook</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Event">Event</option>
                <option value="Manual">Manual</option>
                <option value="API">API</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Complexity (1-5)*</label>
              <input 
                type="range" 
                min={1} 
                max={5} 
                className="bg-black/5 h-2 rounded-lg appearance-none cursor-pointer my-4 accent-primary"
                value={complexityScore}
                onChange={(e) => setComplexityScore(Number(e.target.value))}
              />
              <span className="text-[10px] font-[family-name:var(--font-orbitron)] text-primary font-bold text-center">
                {["BASIC", "INTERMEDIATE", "ADVANCED", "EXPERT", "MASTER"][complexityScore - 1]}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Tags (comma-separated)</label>
            <input 
              type="text" 
              className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
              placeholder="e.g. n8n, Slack, API, Automation"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        {/* METRICS */}
        <div>
          <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest border-b border-glass pb-2 mb-6">
            III. METRICS & TELEMETRY
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Total Nodes*</label>
              <input 
                type="number" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                value={totalNodes}
                onChange={(e) => setTotalNodes(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Automation %*</label>
              <input 
                type="number" 
                min={0}
                max={100}
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                value={automationPercent}
                onChange={(e) => setAutomationPercent(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Steps Automated</label>
              <input 
                type="number" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                value={stepsAutomated}
                onChange={(e) => setStepsAutomated(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Hours Saved / Mo.</label>
              <input 
                type="number" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                value={hoursSaved}
                onChange={(e) => setHoursSaved(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-2 col-span-2 md:col-span-1">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Date Built*</label>
              <input 
                type="date" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                value={dateBuilt}
                onChange={(e) => setDateBuilt(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* NODE MAP BUILDER */}
        <div>
          <div className="flex justify-between items-center border-b border-glass pb-2 mb-6">
            <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest flex items-center gap-2">
              IV. NODE MAP BUILDER
              <span className="glass px-2.5 py-0.5 rounded-full text-[9px] text-primary">{nodes.length} nodes</span>
            </h3>
            <button 
              type="button" 
              onClick={() => setShowPreview(!showPreview)} 
              className="btn-outline text-[9px] uppercase px-4 py-2 flex items-center gap-1.5"
            >
              <FaEye /> {showPreview ? "Hide Preview" : "Live Preview Map"}
            </button>
          </div>

          {showPreview && (
            <div className="mb-8 p-4 border border-glass rounded-2xl bg-black/5">
              <NodeMapSVG nodes={nodes.filter(n => n.label.trim() !== "")} />
            </div>
          )}

          {/* Template presets selector */}
          <div className="mb-6 p-4 border border-glass rounded-2xl bg-black/5">
            <label className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-wider block mb-2">
              Start with Workflow Template:
            </label>
            <div className="flex flex-wrap gap-3">
              {workflowTemplates.map(tpl => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => applyTemplate(tpl.nodes)}
                  className="px-3.5 py-2 text-[10px] font-[family-name:var(--font-orbitron)] uppercase bg-neutral-900 border border-glass/40 hover:border-primary/40 rounded-xl text-dim hover:text-primary transition-all flex items-center gap-1.5"
                >
                  <FaWrench size={8} /> {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Import n8n JSON modal toggle */}
          <div className="flex gap-4 mb-6 justify-end">
            <button
              type="button"
              onClick={() => setShowN8nImportModal(true)}
              className="px-4 py-2 border border-glass bg-primary/5 text-primary text-[10px] font-[family-name:var(--font-orbitron)] uppercase rounded-xl hover:bg-primary/10 transition-colors flex items-center gap-1.5"
            >
              <FaUpload size={10} /> Import from n8n JSON
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={nodes.map(n => n.id || n.order.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4 mb-6">
                {nodes.map((node, index) => (
                  <SortableNodeRow
                    key={node.id || `node-${index}`}
                    node={node}
                    index={index}
                    onUpdate={updateNode}
                    onRemove={removeNode}
                    onDuplicate={duplicateNode}
                    nodeTypes={nodeTypes}
                    n8nFamousNodes={n8nFamousNodes}
                    isOnlyNode={nodes.length <= 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <button 
            type="button" 
            id="add-node-step-btn"
            onClick={addNode} 
            className="w-full border border-dashed border-glass hover:bg-black/5 transition-colors py-3 rounded-xl flex items-center justify-center gap-2 font-[family-name:var(--font-orbitron)] text-[10px] uppercase text-dim hover:text-primary"
          >
            <FaPlus size={10} /> Add Node Step
          </button>
        </div>

        {/* CONNECTED SERVICES */}
        <div>
          <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest border-b border-glass pb-2 mb-6">
            V. INTEGRATED SERVICES & TECH STACK
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {availableServices.map((service) => {
              const isChecked = selectedServices.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => handleServiceToggle(service)}
                  className={`border p-3.5 rounded-xl text-left flex justify-between items-center transition-all ${
                    isChecked 
                      ? "border-primary bg-primary text-white shadow-md" 
                      : "border-glass bg-black/5 text-main hover:bg-black/10"
                  }`}
                >
                  <span className="font-[family-name:var(--font-inter)] text-xs font-semibold">{service}</span>
                  {isChecked && <FaCheck size={10} />}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Primary Integration</label>
            <input 
              type="text" 
              className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
              placeholder="e.g. Google Sheets (drives primary visualization or branding)"
              value={primaryIntegration}
              onChange={(e) => setPrimaryIntegration(e.target.value)}
            />
          </div>
        </div>

        {/* STORY */}
        <div>
          <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest border-b border-glass pb-2 mb-6">
            VI. THE STORY (PROBLEM & SOLUTION)
          </h3>
          <div className="flex flex-col gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">The Problem*</label>
              <textarea 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30 min-h-[100px]"
                placeholder="What manual, slow, or error-prone process did the organization face before this workflow?"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">The Solution*</label>
              <textarea 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30 min-h-[100px]"
                placeholder="How did you map the automation and which logic endpoints resolved the issue?"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Curator Notes / Context</label>
            <textarea 
              className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30 min-h-[80px]"
              placeholder="Additional deployment parameters, security configurations, or n8n details."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* MEDIA, DOWNLOADS & RELATIONSHIPS */}
        <div>
          <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest border-b border-glass pb-2 mb-6">
            VII. MEDIA, DOWNLOADS & RELATIONSHIPS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Demo Video URL</label>
              <input 
                type="url" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                value={demoVideoUrl}
                onChange={(e) => setDemoVideoUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">JSON Export URL</label>
              <input 
                type="url" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                placeholder="e.g. https://firebasestorage.googleapis.com/.../workflow.json"
                value={jsonExportUrl}
                onChange={(e) => setJsonExportUrl(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Related Workflow IDs (comma-separated)</label>
            <input 
              type="text" 
              className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
              placeholder="e.g. WF-CRM-ROUTER, WF-LEAD-SCORE"
              value={relatedWorkflowIdsInput}
              onChange={(e) => setRelatedWorkflowIdsInput(e.target.value)}
            />
          </div>
        </div>

        {/* STATUS & ACTIONS */}
        <div className="border-t border-glass pt-8 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="featured"
                className="w-4 h-4 text-primary bg-black/5 border-glass rounded focus:ring-0 accent-primary"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <label htmlFor="featured" className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-wider cursor-pointer">
                Featured Exhibit (Show at top of gallery)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-[family-name:var(--font-orbitron)] text-[10px] text-dim uppercase tracking-wider">
                Exhibition Status:
              </label>
              <select
                className="bg-black/5 border border-glass rounded-lg px-2.5 py-1 text-[10px] font-[family-name:var(--font-orbitron)] uppercase tracking-wider"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="draft">Draft</option>
                <option value="live">Live</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="button" 
              className="btn-outline flex items-center gap-2"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={loading}
            >
              Save as Draft
            </button>
            <button 
              type="submit" 
              className="btn-primary flex items-center gap-2"
              onClick={(e) => handleSubmit(e, "live")}
              disabled={loading}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FaSave size={12} />
              )}
              Publish Exhibit
            </button>
          </div>
        </div>
      </form>

      {/* n8n JSON Import Modal */}
      <AnimatePresence>
        {showN8nImportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0" onClick={() => setShowN8nImportModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-premium border border-glass max-w-lg w-full rounded-[24px] p-6 shadow-2xl relative z-10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-[family-name:var(--font-orbitron)] text-sm font-bold text-primary uppercase tracking-wider">
                    Import from n8n JSON
                  </h3>
                  <p className="text-[10px] text-dim font-[family-name:var(--font-inter)] mt-1">
                    Paste your exported n8n workflow JSON structure. Nodes will be parsed and connected services will be auto-detected.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowN8nImportModal(false)}
                  className="text-dim hover:text-primary transition-colors p-1"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <textarea
                placeholder='{ "nodes": [ ... ], "connections": { ... } }'
                className="w-full h-[220px] bg-black/90 p-4 rounded-xl border border-glass font-mono text-xs text-neutral-300 focus:outline-none focus:border-primary/40 resize-none mb-4"
                value={n8nJsonInput}
                onChange={(e) => setN8nJsonInput(e.target.value)}
              />

              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowN8nImportModal(false)}
                  className="btn-outline text-[10px] uppercase py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleN8nImport(n8nJsonInput)}
                  className="btn-primary text-[10px] uppercase py-2 px-4 rounded-lg flex items-center gap-1.5"
                  disabled={!n8nJsonInput.trim()}
                >
                  <FaCheck size={10} /> Process JSON
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// WORKFLOW TEMPLATE PATTERNS
// ==========================================
const workflowTemplates = [
  {
    name: "Webhook → Process → Notify",
    nodes: [
      { label: "Webhook Trigger", type: "trigger", order: 1, description: "Receives incoming HTTP webhook requests from external systems." },
      { label: "Set Fields", type: "action", order: 2, description: "Extracts and sanitizes payload parameters." },
      { label: "Slack (Send Message)", type: "integration", order: 3, description: "Alerts team of successful execution." },
      { label: "Success Complete", type: "output", order: 4, description: "Signals successful termination." }
    ]
  },
  {
    name: "Cron → ETL → Store",
    nodes: [
      { label: "Schedule Trigger (Cron)", type: "trigger", order: 1, description: "Triggers on custom schedule interval." },
      { label: "HTTP Request", type: "action", order: 2, description: "Fetches payload data from API endpoint." },
      { label: "Code Execution", type: "action", order: 3, description: "Runs custom JavaScript parser to transform data schema." },
      { label: "Google Sheets (Add Row)", type: "integration", order: 4, description: "Appends clean records to centralized worksheet database." }
    ]
  },
  {
    name: "Form → Validate → Route",
    nodes: [
      { label: "Webhook Trigger", type: "trigger", order: 1, description: "Receives user submission payload." },
      { label: "IF Condition", type: "condition", order: 2, description: "Validates input rules and checks credentials." },
      { label: "Gmail (Send Email)", type: "integration", order: 3, description: "Sends rejection or verification email notification." },
      { label: "Success Complete", type: "output", order: 4, description: "Ends flow successfully." }
    ]
  },
  {
    name: "Email → AI → Respond",
    nodes: [
      { label: "Gmail (On Email Received)", type: "trigger", order: 1, description: "Triggers on inbound support requests." },
      { label: "OpenAI (GPT Completion)", type: "integration", order: 2, description: "Generates custom contextual draft reply based on prompt context." },
      { label: "Gmail (Send Email)", type: "integration", order: 3, description: "Emails draft response back to sender." }
    ]
  }
];

// ==========================================
// DRAG AND DROP SORTABLE ROW
// ==========================================
interface SortableNodeRowProps {
  node: NodeMapItem;
  index: number;
  onUpdate: (index: number, field: keyof NodeMapItem, value: any) => void;
  onRemove: (index: number) => void;
  onDuplicate: (index: number) => void;
  nodeTypes: { value: string; label: string; }[];
  n8nFamousNodes: { label: string; type: string; }[];
  isOnlyNode: boolean;
}

function SortableNodeRow({ 
  node, 
  index, 
  onUpdate, 
  onRemove, 
  onDuplicate, 
  nodeTypes, 
  n8nFamousNodes, 
  isOnlyNode 
}: SortableNodeRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: node.id || `node-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="flex flex-wrap items-center gap-4 bg-black/5 p-4 rounded-xl border border-glass/40 relative group/row w-full"
    >
      {/* Grip Handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-2 text-dim hover:text-primary transition-colors flex items-center justify-center rounded border border-glass/20 bg-neutral-900/40 w-8 h-8 self-end mb-1"
        title="Drag to reorder"
      >
        <span className="text-sm select-none">⠿</span>
      </div>

      <span className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-dim w-8 text-center self-end mb-3">
        #{node.order}
      </span>

      {/* Searchable Preset Select */}
      <div className="w-[180px] flex flex-col">
        <SearchablePresetSelect
          value={n8nFamousNodes.some(n => n.label === node.label && n.type === node.type) ? node.label : ""}
          onChange={(val) => {
            const found = n8nFamousNodes.find(n => n.label === val);
            if (found) {
              onUpdate(index, "label", found.label);
              onUpdate(index, "type", found.type);
            }
          }}
          n8nFamousNodes={n8nFamousNodes}
        />
      </div>

      {/* Node Label */}
      <div className="flex-1 min-w-[150px] flex flex-col gap-1">
        <label className="text-[10px] text-dim font-bold uppercase">Node Label</label>
        <input 
          type="text" 
          placeholder="e.g. Send Slack Notification"
          className="bg-black/5 border border-glass rounded-lg px-3 py-2 font-[family-name:var(--font-inter)] text-xs focus:outline-none focus:border-primary/30"
          value={node.label}
          onChange={(e) => onUpdate(index, "label", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const addBtn = document.getElementById("add-node-step-btn");
              if (addBtn) addBtn.click();
            }
          }}
        />
      </div>

      {/* Node Type */}
      <div className="w-[150px] flex flex-col gap-1">
        <label className="text-[10px] text-dim font-bold uppercase">Node Type</label>
        <select 
          className="bg-black/5 border border-glass rounded-lg px-3 py-2 font-[family-name:var(--font-inter)] text-xs focus:outline-none focus:border-primary/30"
          value={node.type}
          onChange={(e) => onUpdate(index, "type", e.target.value)}
        >
          {nodeTypes.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Action buttons (Duplicate + Trash) */}
      <div className="flex items-center gap-2 mt-5 self-end">
        <button 
          type="button"
          onClick={() => onDuplicate(index)}
          className="px-2.5 py-2 bg-neutral-900 border border-glass/40 hover:border-primary/40 text-dim hover:text-primary rounded-lg transition-colors text-[10px] font-[family-name:var(--font-orbitron)] uppercase animate-pulse-subtle"
          title="Duplicate Node"
        >
          Clone
        </button>

        <button 
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg border border-red-500/10 transition-colors"
          disabled={isOnlyNode}
          title="Remove Node"
        >
          <FaTrash size={12} />
        </button>
      </div>

      {/* Node Description Textarea */}
      <div className="w-full flex flex-col gap-1 mt-1">
        <label className="text-[10px] text-dim font-bold uppercase">Node Description (Optional)</label>
        <textarea 
          placeholder="Brief description of what this node does in context of the workflow..."
          rows={1}
          className="bg-black/5 border border-glass rounded-lg px-3 py-2 font-[family-name:var(--font-inter)] text-xs focus:outline-none focus:border-primary/30 resize-y"
          value={node.description || ""}
          onChange={(e) => onUpdate(index, "description", e.target.value)}
        />
      </div>
    </div>
  );
}

// ==========================================
// SEARCHABLE PRESET COMBOBOX
// ==========================================
interface SearchablePresetSelectProps {
  value: string;
  onChange: (val: string) => void;
  n8nFamousNodes: { label: string; type: string; }[];
}

function SearchablePresetSelect({
  value,
  onChange,
  n8nFamousNodes
}: SearchablePresetSelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filtered = n8nFamousNodes.filter(node => 
    node.label.toLowerCase().includes(search.toLowerCase()) ||
    node.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full flex flex-col gap-1" ref={containerRef}>
      <label className="text-[10px] text-dim font-bold uppercase">Node Preset</label>
      <div 
        className="bg-black/5 border border-glass rounded-lg px-3 py-2 text-xs flex justify-between items-center cursor-pointer hover:border-primary/20 bg-neutral-900/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-primary truncate" : "text-dim truncate"}>
          {value || "-- Custom --"}
        </span>
        <span className="text-[8px] text-dim ml-1">&#9662;</span>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-glass rounded-lg shadow-xl z-50 max-h-[220px] overflow-y-auto p-2 flex flex-col gap-1">
          <input
            type="text"
            placeholder="Search nodes..."
            className="bg-neutral-900 border border-glass rounded px-2.5 py-1.5 text-xs text-primary focus:outline-none mb-1.5"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
          {filtered.length === 0 ? (
            <span className="text-[10px] text-dim text-center py-2">No nodes found</span>
          ) : (
            filtered.map(node => (
              <button
                key={node.label}
                type="button"
                onClick={() => {
                  onChange(node.label);
                  setIsOpen(false);
                  setSearch("");
                }}
                className="w-full text-left px-2.5 py-1.5 text-[11px] rounded hover:bg-primary/10 hover:text-primary text-dim transition-colors flex justify-between items-center"
              >
                <span className="truncate mr-1">{node.label}</span>
                <span className="text-[7px] text-neutral-500 uppercase shrink-0">{node.type}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
