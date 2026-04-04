import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, test, expect } from "vitest";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => cleanup());

function makeTool(
  toolName: string,
  args: Record<string, unknown>,
  state: "call" | "result" = "result",
  result: unknown = "ok"
): ToolInvocation {
  return { toolCallId: "1", toolName, args, state, result } as ToolInvocation;
}

test("str_replace_editor create shows Creating <file>", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" })} />);
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing <file>", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "str_replace", path: "/components/Card.jsx" })} />);
  expect(screen.getByText("Editing Card.jsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing <file>", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "insert", path: "/utils.ts" })} />);
  expect(screen.getByText("Editing utils.ts")).toBeDefined();
});

test("str_replace_editor undo_edit shows Editing <file>", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "undo_edit", path: "/index.js" })} />);
  expect(screen.getByText("Editing index.js")).toBeDefined();
});

test("str_replace_editor view shows Viewing <file>", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "view", path: "/index.js" })} />);
  expect(screen.getByText("Viewing index.js")).toBeDefined();
});

test("file_manager rename shows Renaming <file>", () => {
  render(<ToolInvocationBadge tool={makeTool("file_manager", { command: "rename", path: "/OldName.jsx" })} />);
  expect(screen.getByText("Renaming OldName.jsx")).toBeDefined();
});

test("file_manager delete shows Deleting <file>", () => {
  render(<ToolInvocationBadge tool={makeTool("file_manager", { command: "delete", path: "/utils.ts" })} />);
  expect(screen.getByText("Deleting utils.ts")).toBeDefined();
});

test("unknown tool falls back to tool name", () => {
  render(<ToolInvocationBadge tool={makeTool("some_other_tool", {})} />);
  expect(screen.getByText("some_other_tool")).toBeDefined();
});

test("done state shows green dot, no spinner", () => {
  const { container } = render(
    <ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" }, "result", "ok")} />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(container.querySelector(".animate-spin")).toBeFalsy();
});

test("pending state shows spinner, no green dot", () => {
  const { container } = render(
    <ToolInvocationBadge tool={{ toolCallId: "1", toolName: "str_replace_editor", args: { command: "create", path: "/App.jsx" }, state: "call" } as ToolInvocation} />
  );
  expect(container.querySelector(".animate-spin")).toBeTruthy();
  expect(container.querySelector(".bg-emerald-500")).toBeFalsy();
});
