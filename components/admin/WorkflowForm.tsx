"use client";

import { useState, useEffect } from "react";
import { Workflow, NodeMapItem } from "@/types/workflow";
import { FaTrash, FaPlus, FaSave, FaEye, FaArrowLeft, FaCheck } from "react-icons/fa";
import Link from "next/link";
import NodeMapSVG from "@/components/sections/NodeMapSVG";

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
  
  // Logic
  { label: "IF Condition", type: "condition" },
  { label: "Switch Node", type: "condition" },
  { label: "Filter Data", type: "condition" },
  { label: "Merge Streams", type: "action" },
  { label: "Wait Delay", type: "action" },
  
  // Actions
  { label: "Set Fields", type: "action" },
  { label: "Code Execution", type: "action" },
  { label: "HTTP Request", type: "action" },
  
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
  
  // Outputs
  { label: "Success Complete", type: "output" },
  { label: "Error Capture", type: "output" }
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

  // Node Map Builder
  const [nodes, setNodes] = useState<NodeMapItem[]>(
    initialData?.node_map_data || [
      { label: "Webhook Received", type: "trigger", order: 1 }
    ]
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
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Auto-generate workflow ID if new and name changes
  useEffect(() => {
    if (!isEditing && !workflowId && name) {
      const cleanName = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 20);
      setWorkflowId(`WF-${cleanName}`);
    }
  }, [name, isEditing, workflowId]);

  // Automatically sync totalNodes count with the number of nodes in the builder
  useEffect(() => {
    setTotalNodes(nodes.length);
  }, [nodes.length]);

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
      { label: "", type: "action", order: nodes.length + 1 }
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

  const updateNode = (index: number, field: keyof NodeMapItem, value: any) => {
    const updated = [...nodes];
    updated[index] = { ...updated[index], [field]: value };
    setNodes(updated);
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

    if (!workflowId || !name || !shortDesc) {
      setMessage({ type: "error", text: "Please fill in all required fields (Workflow ID, Name, Short Description)." });
      setLoading(false);
      return;
    }

    try {
      const finalCategory = category === "Other" && customCategory ? customCategory : category;

      const payload: Partial<Workflow> = {
        workflow_id: workflowId.trim().toUpperCase(),
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
              <label className="font-[family-name:var(--font-inter)] text-xs text-dim uppercase tracking-wider">Workflow ID*</label>
              <input 
                type="text" 
                className="bg-black/5 border border-glass rounded-xl px-4 py-3 font-[family-name:var(--font-inter)] text-sm focus:outline-none focus:border-primary/30"
                placeholder="e.g. WF-004"
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                disabled={isEditing}
              />
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
            <h3 className="font-[family-name:var(--font-orbitron)] text-xs text-dim uppercase tracking-widest">
              IV. NODE MAP BUILDER
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

          <div className="space-y-4 mb-6">
            {nodes.map((node, index) => (
              <div key={index} className="flex flex-wrap items-center gap-4 bg-black/5 p-4 rounded-xl border border-glass/40">
                <span className="font-[family-name:var(--font-orbitron)] text-xs font-bold text-dim w-8 text-center">
                  #{node.order}
                </span>

                <div className="w-[180px] flex flex-col gap-1">
                  <label className="text-[10px] text-dim font-bold uppercase">Node Preset</label>
                  <select 
                    className="bg-black/5 border border-glass rounded-lg px-3 py-2 font-[family-name:var(--font-inter)] text-xs focus:outline-none focus:border-primary/30"
                    value={n8nFamousNodes.some(n => n.label === node.label && n.type === node.type) ? node.label : ""}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      if (selectedVal) {
                        const found = n8nFamousNodes.find(n => n.label === selectedVal);
                        if (found) {
                          updateNode(index, "label", found.label);
                          updateNode(index, "type", found.type);
                        }
                      }
                    }}
                  >
                    <option value="">-- Custom --</option>
                    <optgroup label="Triggers">
                      {n8nFamousNodes.filter(n => n.type === "trigger").map(n => (
                        <option key={n.label} value={n.label}>{n.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Logic">
                      {n8nFamousNodes.filter(n => n.type === "condition" || n.label.includes("Streams") || n.label.includes("Delay")).map(n => (
                        <option key={n.label} value={n.label}>{n.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Actions & Core">
                      {n8nFamousNodes.filter(n => n.type === "action" && !n.label.includes("Streams") && !n.label.includes("Delay")).map(n => (
                        <option key={n.label} value={n.label}>{n.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Integrations">
                      {n8nFamousNodes.filter(n => n.type === "integration").map(n => (
                        <option key={n.label} value={n.label}>{n.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Outputs">
                      {n8nFamousNodes.filter(n => n.type === "output").map(n => (
                        <option key={n.label} value={n.label}>{n.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                  <label className="text-[10px] text-dim font-bold uppercase">Node Label</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Send Slack Notification"
                    className="bg-black/5 border border-glass rounded-lg px-3 py-2 font-[family-name:var(--font-inter)] text-xs focus:outline-none focus:border-primary/30"
                    value={node.label}
                    onChange={(e) => updateNode(index, "label", e.target.value)}
                  />
                </div>

                <div className="w-[180px] flex flex-col gap-1">
                  <label className="text-[10px] text-dim font-bold uppercase">Node Type</label>
                  <select 
                    className="bg-black/5 border border-glass rounded-lg px-3 py-2 font-[family-name:var(--font-inter)] text-xs focus:outline-none focus:border-primary/30"
                    value={node.type}
                    onChange={(e) => updateNode(index, "type", e.target.value)}
                  >
                    {nodeTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button"
                  onClick={() => removeNode(index)}
                  className="mt-5 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-lg border border-red-500/10 transition-colors"
                  disabled={nodes.length <= 1}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ))}
          </div>

          <button 
            type="button" 
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
    </div>
  );
}
