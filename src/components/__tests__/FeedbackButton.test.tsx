import { test, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FeedbackButton } from "../FeedbackButton";

afterEach(() => {
  cleanup();
});

test("renders feedback button", () => {
  render(<FeedbackButton />);
  expect(screen.getByRole("button", { name: /feedback/i })).toBeDefined();
});

test("opens dialog when button is clicked", async () => {
  render(<FeedbackButton />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  expect(screen.getByRole("dialog")).toBeDefined();
  expect(screen.getByText("Share Feedback")).toBeDefined();
});

test("dialog contains textarea and action buttons", async () => {
  render(<FeedbackButton />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  expect(screen.getByLabelText("Feedback")).toBeDefined();
  expect(screen.getByRole("button", { name: /send feedback/i })).toBeDefined();
  expect(screen.getByRole("button", { name: /cancel/i })).toBeDefined();
});

test("send button is disabled when textarea is empty", async () => {
  render(<FeedbackButton />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  expect(screen.getByRole("button", { name: /send feedback/i })).toHaveProperty("disabled", true);
});

test("send button is disabled when textarea contains only whitespace", async () => {
  render(<FeedbackButton />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  const textarea = screen.getByLabelText("Feedback");
  await userEvent.type(textarea, "   ");
  expect(screen.getByRole("button", { name: /send feedback/i })).toHaveProperty("disabled", true);
});

test("send button is enabled when textarea has content", async () => {
  render(<FeedbackButton />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  const textarea = screen.getByLabelText("Feedback");
  await userEvent.type(textarea, "Great app!");
  expect(screen.getByRole("button", { name: /send feedback/i })).toHaveProperty("disabled", false);
});

test("calls onSubmit with trimmed feedback text", async () => {
  const onSubmit = vi.fn();
  render(<FeedbackButton onSubmit={onSubmit} />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  const textarea = screen.getByLabelText("Feedback");
  await userEvent.type(textarea, "  Great app!  ");
  await userEvent.click(screen.getByRole("button", { name: /send feedback/i }));
  expect(onSubmit).toHaveBeenCalledWith("Great app!");
});

test("shows thank you message after submission", async () => {
  render(<FeedbackButton onSubmit={vi.fn()} />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  await userEvent.type(screen.getByLabelText("Feedback"), "Looks good");
  await userEvent.click(screen.getByRole("button", { name: /send feedback/i }));
  await waitFor(() => {
    expect(screen.getByText(/thanks for your feedback/i)).toBeDefined();
  });
});

test("closing dialog resets state", async () => {
  render(<FeedbackButton onSubmit={vi.fn()} />);

  // Open and submit
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  await userEvent.type(screen.getByLabelText("Feedback"), "Looks good");
  await userEvent.click(screen.getByRole("button", { name: /send feedback/i }));
  await waitFor(() => screen.getByText(/thanks for your feedback/i));

  // Close via the X button
  const closeButton = screen.getByRole("button", { name: /close/i });
  await userEvent.click(closeButton);

  // Re-open — should show the form again, not the thank-you message
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  expect(screen.queryByText(/thanks for your feedback/i)).toBeNull();
  expect(screen.getByLabelText("Feedback")).toBeDefined();
});

test("cancel button closes the dialog", async () => {
  render(<FeedbackButton />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  expect(screen.getByRole("dialog")).toBeDefined();
  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
  await waitFor(() => {
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

test("textarea is disabled while submitting", async () => {
  let resolve!: () => void;
  const onSubmit = vi.fn(
    () => new Promise<void>((res) => { resolve = res; })
  );

  render(<FeedbackButton onSubmit={onSubmit} />);
  await userEvent.click(screen.getByRole("button", { name: /feedback/i }));
  await userEvent.type(screen.getByLabelText("Feedback"), "Testing");
  fireEvent.click(screen.getByRole("button", { name: /send feedback/i }));

  await waitFor(() => {
    expect(screen.getByLabelText("Feedback")).toHaveProperty("disabled", true);
  });

  resolve();
});
