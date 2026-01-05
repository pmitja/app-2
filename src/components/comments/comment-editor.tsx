"use client";

import { Bold, ImageIcon, Italic, Link as LinkIcon, Underline as UnderlineIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { createComment } from "@/actions/comment-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentEditorProps {
  problemId: string;
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isAuthenticated: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function CommentEditor({
  problemId,
  parentId,
  onSuccess,
  onCancel,
  isAuthenticated,
  placeholder = "Add comment...",
  autoFocus = false,
}: CommentEditorProps) {
  const [content, setContent] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertFormat = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setContent(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    startTransition(async () => {
      const result = await createComment(problemId, {
        content: content.trim(),
        type: "discussion", // Default to discussion for now, could be prop if needed
        parentId,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment posted!");
        setContent("");
        onSuccess?.();
      }
    });
  };

  return (
    <div className="bg-card rounded-xl border p-4 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            disabled={!isAuthenticated || isPending}
            className="min-h-[120px] resize-y bg-transparent"
            autoFocus={autoFocus}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => insertFormat("**", "**")}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => insertFormat("*", "*")}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            {/* Markdown doesn't support underline natively, skipping or using HTML? 
                Let's skip U to stay clean markdown or use <u> if HTML is allowed. 
                For now I'll just use it as *italic* alternative or remove it. 
                Let's keep it simple and skip Underline to avoid confusion 
                unless I decide to parse HTML.
            */}
             <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => insertFormat("[", "](url)")}
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
             <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => insertFormat("![", "](url)")}
              title="Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={!isAuthenticated || isPending}
              className="rounded-full px-6"
            >
              {isPending ? "Posting..." : "Submit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

