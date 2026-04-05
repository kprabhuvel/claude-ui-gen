"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface FeedbackButtonProps {
  onSubmit?: (feedback: string) => void | Promise<void>;
}

export function FeedbackButton({ onSubmit }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit?.(feedback.trim());
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFeedback("");
      setSubmitted(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className="h-8 gap-2"
        onClick={() => setOpen(true)}
        aria-label="Give feedback"
      >
        <MessageSquare className="h-4 w-4" />
        Feedback
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Feedback</DialogTitle>
            <DialogDescription>
              Help us improve UIGen by sharing your thoughts.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <p className="text-sm text-center py-4">
              Thanks for your feedback!
            </p>
          ) : (
            <>
              <textarea
                className="w-full min-h-[120px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="What's on your mind?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                aria-label="Feedback"
                disabled={submitting}
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!feedback.trim() || submitting}
                >
                  {submitting ? "Sending..." : "Send Feedback"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
