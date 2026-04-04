"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function getLabel(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? args.path : "";
  const file = path.split("/").filter(Boolean).at(-1) ?? path;
  const cmd = args.command;

  if (toolName === "str_replace_editor") {
    if (cmd === "create") return `Creating ${file}`;
    if (cmd === "str_replace" || cmd === "insert" || cmd === "undo_edit") return `Editing ${file}`;
    if (cmd === "view") return `Viewing ${file}`;
  }
  if (toolName === "file_manager") {
    if (cmd === "rename") return `Renaming ${file}`;
    if (cmd === "delete") return `Deleting ${file}`;
  }
  return toolName;
}

export function ToolInvocationBadge({ tool }: { tool: ToolInvocation }) {
  const label = getLabel(tool.toolName, tool.args as Record<string, unknown>);
  const done = tool.state === "result" && tool.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
