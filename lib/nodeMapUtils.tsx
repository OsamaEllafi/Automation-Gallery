import React from "react";
import { 
  FaPlay, FaClock, FaLink, FaSlack, FaEnvelope, FaCode, 
  FaDatabase, FaCheckCircle, FaTrello, FaGithub, FaRobot, 
  FaWhatsapp, FaFilter, FaListUl, FaExchangeAlt
} from "react-icons/fa";

export const getNodeColor = (type: string): string => {
  switch (type) {
    case "trigger":
      return "#ff6d5a"; // n8n orange
    case "condition":
      return "#ffb300"; // amber
    case "integration":
      return "#6366f1"; // indigo
    case "action":
      return "#06b6d4"; // cyan
    case "output":
      return "#10b981"; // green
    default:
      return "#9ca3af"; // gray
  }
};

export const getNodeIcon = (label: string, type: string, size: number = 11) => {
  const lowerLabel = label.toLowerCase();
  
  if (type === "trigger") {
    if (lowerLabel.includes("schedule") || lowerLabel.includes("cron") || lowerLabel.includes("time") || lowerLabel.includes("clock")) {
      return <FaClock style={{ fontSize: size }} className="text-[#ff6d5a]" />;
    }
    if (lowerLabel.includes("webhook") || lowerLabel.includes("api") || lowerLabel.includes("receive")) {
      return <FaLink style={{ fontSize: size }} className="text-[#ff6d5a]" />;
    }
    return <FaPlay style={{ fontSize: size }} className="text-[#ff6d5a]" />;
  }
  
  if (type === "condition" || lowerLabel.includes("if") || lowerLabel.includes("switch") || lowerLabel.includes("filter")) {
    return <FaFilter style={{ fontSize: size }} className="text-amber-500" />;
  }
  
  if (lowerLabel.includes("slack")) return <FaSlack style={{ fontSize: size }} className="text-purple-400" />;
  if (lowerLabel.includes("gmail") || lowerLabel.includes("mail") || lowerLabel.includes("email")) return <FaEnvelope style={{ fontSize: size }} className="text-red-400" />;
  if (lowerLabel.includes("sheet") || lowerLabel.includes("excel")) return <FaListUl style={{ fontSize: size }} className="text-emerald-400" />;
  if (lowerLabel.includes("airtable")) return <FaExchangeAlt style={{ fontSize: size }} className="text-cyan-400" />;
  if (lowerLabel.includes("trello")) return <FaTrello style={{ fontSize: size }} className="text-blue-400" />;
  if (lowerLabel.includes("github")) return <FaGithub style={{ fontSize: size }} className="text-neutral-300" />;
  if (lowerLabel.includes("openai") || lowerLabel.includes("gpt") || lowerLabel.includes("ai") || lowerLabel.includes("llm")) return <FaRobot style={{ fontSize: size }} className="text-purple-300" />;
  if (lowerLabel.includes("whatsapp")) return <FaWhatsapp style={{ fontSize: size }} className="text-green-400" />;
  if (lowerLabel.includes("database") || lowerLabel.includes("postgres") || lowerLabel.includes("sql") || lowerLabel.includes("mysql")) return <FaDatabase style={{ fontSize: size }} className="text-blue-400" />;
  if (lowerLabel.includes("code") || lowerLabel.includes("js") || lowerLabel.includes("javascript") || lowerLabel.includes("python")) return <FaCode style={{ fontSize: size }} className="text-indigo-400" />;
  
  if (type === "output" || lowerLabel.includes("complete") || lowerLabel.includes("end") || lowerLabel.includes("finish")) {
    return <FaCheckCircle style={{ fontSize: size }} className="text-[#10b981]" />;
  }
  
  return <FaCode style={{ fontSize: size }} className="text-neutral-400" />;
};
