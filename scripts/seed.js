const fs = require('fs');
const path = require('path');
const https = require('https');

const home = require('os').homedir();
const configPath = path.join(home, '.config', 'configstore', 'firebase-tools.json');

if (!fs.existsSync(configPath)) {
  console.error("firebase-tools.json not found.");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const token = config.tokens?.access_token;

if (!token) {
  console.error("No access token found in firebase-tools.json.");
  process.exit(1);
}

function toFirestoreValue(val) {
  if (val === null) return { nullValue: null };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (typeof val === 'string') return { stringValue: val };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    // If it has a special type or is a plain object
    const fields = {};
    for (const k in val) {
      fields[k] = toFirestoreValue(val[k]);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function toFirestoreDoc(obj) {
  const fields = {};
  for (const k in obj) {
    fields[k] = toFirestoreValue(obj[k]);
  }
  return { fields };
}

function request(url, method, body = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: 443,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status: ${res.statusCode}, Body: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const sampleWorkflows = [
  {
    workflow_id: "WF-001",
    name: "Employee Onboarding Flow",
    short_description: "Automatically provisions accounts, sends NDA contracts, and schedules onboarding training when an offer letter is signed.",
    long_description: "A comprehensive enterprise-grade onboarding automation system designed to remove the administrative burden from HR and IT departments. The workflow listens for signed contracts via webhooks, initiates document generation, creates employee profiles in Google Workspace and Slack, and schedules training sessions with automated follow-ups.",
    status: "live",
    featured: true,
    category: "Onboarding",
    trigger_type: "Webhook",
    complexity_score: 4,
    tags: ["HR", "Onboarding", "Google Sheets", "Slack"],
    total_nodes: 18,
    automation_percentage: 95,
    steps_automated: 12,
    hours_saved_per_month: 24,
    date_built: "2024-03-15",
    node_map_data: [
      { label: "Webhook: Offer Signed", type: "trigger", order: 1 },
      { label: "Get Employee Info", type: "action", order: 2 },
      { label: "Check NDA Document", type: "condition", order: 3 },
      { label: "Generate NDA PDF", type: "action", order: 4 },
      { label: "Send Sign Request", type: "integration", order: 5 },
      { label: "Create Workspace User", type: "integration", order: 6 },
      { label: "Invite to Slack", type: "integration", order: 7 },
      { label: "Notify Manager", type: "output", order: 8 }
    ],
    connected_services: ["Gmail", "Google Sheets", "Slack", "Google Workspace", "SignWell"],
    primary_integration: "Google Sheets",
    demo_video_url: null,
    thumbnail_url: null,
    json_export_url: null,
    problem: "The HR team manually spent over 3 hours per employee typing out onboarding emails, creating IT accounts, generating NDA PDFs, and scheduling calendar invites. This caused delays and frequent copy-paste errors.",
    solution: "A unified n8n workflow that orchestrates the entire onboarding process. Now, when a contract is signed, all tools are updated within 45 seconds, ensuring a perfect Day 1 experience for the new joiner.",
    notes: "Requires OAuth scopes for Google Workspace directory administration and SignWell webhook authorization.",
    related_workflow_ids: ["WF-002"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    workflow_id: "WF-002",
    name: "Incident Report Processor",
    short_description: "Monitors production server alerts, parses critical error logs, creates Jira tickets, and alerts the engineering on-call rotation.",
    long_description: "An automated DevOps incident response pipeline. The workflow monitors incoming alerts from monitoring services (e.g., Datadog, Grafana), filters out false positives, summarizes log files using OpenAI, creates high-priority Jira tasks, and escalates to the designated on-call engineer via PagerDuty.",
    status: "live",
    featured: false,
    category: "Operations",
    trigger_type: "Webhook",
    complexity_score: 5,
    tags: ["DevOps", "Monitoring", "Jira", "OpenAI"],
    total_nodes: 22,
    automation_percentage: 88,
    steps_automated: 15,
    hours_saved_per_month: 40,
    date_built: "2024-04-10",
    node_map_data: [
      { label: "Alert Webhook", type: "trigger", order: 1 },
      { label: "Parse Log Payload", type: "action", order: 2 },
      { label: "Filter Level == Error", type: "condition", order: 3 },
      { label: "Summarize with AI", type: "action", order: 4 },
      { label: "Check On-Call Schedule", type: "action", order: 5 },
      { label: "Create Jira Ticket", type: "integration", order: 6 },
      { label: "Send Slack Alert", type: "output", order: 7 },
      { label: "PagerDuty Escalation", type: "integration", order: 8 }
    ],
    connected_services: ["Datadog", "Jira", "PagerDuty", "Slack", "OpenAI"],
    primary_integration: "PagerDuty",
    demo_video_url: null,
    thumbnail_url: null,
    json_export_url: null,
    problem: "Production error alerts often went unnoticed in noisy Slack channels, or took engineers up to 30 minutes to manually investigate and log into Jira.",
    solution: "The processor intercepts system alerts immediately, attaches relevant logs, drafts an AI-generated analysis, and pages the correct on-call engineer within 2 minutes of the initial error.",
    notes: "Requires OpenAI API token and PagerDuty routing keys.",
    related_workflow_ids: ["WF-001"],
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    workflow_id: "WF-003",
    name: "Contract Generation Pipeline",
    short_description: "Drafts client service agreements, routes them for internal legal approval, and executes final signing via DocuSign.",
    long_description: "A secure legal document generation pipeline. When a sales opportunity is marked as 'Closed Won' in Salesforce, this workflow pulls client metadata, compiles a standardized service agreement from a Google Docs template, routes it internally for approval, and initiates a DocuSign signature flow.",
    status: "live",
    featured: true,
    category: "Integrations",
    trigger_type: "Scheduled",
    complexity_score: 3,
    tags: ["Salesforce", "DocuSign", "Legal", "Automation"],
    total_nodes: 14,
    automation_percentage: 90,
    steps_automated: 9,
    hours_saved_per_month: 15,
    date_built: "2024-02-28",
    node_map_data: [
      { label: "Poll Salesforce API", type: "trigger", order: 1 },
      { label: "Retrieve Deal Details", type: "action", order: 2 },
      { label: "Populate Google Doc", type: "action", order: 3 },
      { label: "Export as PDF", type: "action", order: 4 },
      { label: "Notify Legal (Slack)", type: "output", order: 5 },
      { label: "Wait for Approval", type: "condition", order: 6 },
      { label: "Send DocuSign Envelope", type: "integration", order: 7 }
    ],
    connected_services: ["Salesforce", "Google Docs", "Slack", "DocuSign"],
    primary_integration: "DocuSign",
    demo_video_url: null,
    thumbnail_url: null,
    json_export_url: null,
    problem: "Sales representatives spent hours copying client info into Word templates and chasing managers for contract approvals, resulting in slow turnaround times and lost deals.",
    solution: "Automated standard contract drafting and approval notifications. Deals are completed and sent to the client for signature automatically within minutes of a closed-won update.",
    notes: "Strict data privacy compliance rules are applied to customer records.",
    related_workflow_ids: ["WF-001", "WF-002"],
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function seed() {
  const projectId = 'taskmaster-todo-8e733';
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

  console.log("Seeding workflows...");
  for (const workflow of sampleWorkflows) {
    const docUrl = `${baseUrl}/workflows/${workflow.workflow_id}`;
    const payload = toFirestoreDoc(workflow);
    await request(docUrl, 'PATCH', payload);
    console.log(`Seeded: ${workflow.name}`);
  }

  console.log("Seeding site stats...");
  const statsUrl = `${baseUrl}/site_stats/global`;
  const stats = {
    total_workflows: sampleWorkflows.length,
    total_nodes: sampleWorkflows.reduce((acc, w) => acc + w.total_nodes, 0),
    categories: [...new Set(sampleWorkflows.map(w => w.category))],
    last_updated: new Date()
  };
  await request(statsUrl, 'PATCH', toFirestoreDoc(stats));
  console.log("Seeded global stats.");
  console.log("Seeding complete!");
}

seed().catch(err => {
  console.error("Seeding failed:", err);
});
