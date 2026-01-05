"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare, MoreHorizontal, ThumbsDown, ThumbsUp, Trash } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteComment, voteComment } from "@/actions/comment-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProblemComment } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { CommentEditor } from "./comment-editor";

// Simple Markdown Parser Component
const MarkdownText = ({ content }: { content: string }) => {
  // Very basic parser: splits by newlines, then handles simple inline styles
  // Ideally, use a library like react-markdown
  
  const parseInline = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Regex for [text](url), **bold**, *italic*
    // Note: handling nested or complex cases is hard with regex, this is a simplified version
    const regex = /(!?\[(.*?)\]\((.*?)\))|(\*\*(.*?)\*\*)|(\*(.*?)\*)/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      if (match[1]) { // Link or Image
        const isImage = match[1].startsWith("!");
        const alt = match[2];
        const url = match[3];
        if (isImage) {
          parts.push(
            <img 
              key={match.index} 
              src={url} 
              alt={alt} 
              className="max-w-full rounded-md my-2 max-h-[300px]" 
            />
          );
        } else {
          parts.push(
            <a 
              key={match.index} 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary underline hover:text-primary/80"
            >
              {alt}
            </a>
          );
        }
      } else if (match[4]) { // Bold
        parts.push(<strong key={match.index}>{match[5]}</strong>);
      } else if (match[6]) { // Italic
        parts.push(<em key={match.index}>{match[7]}</em>);
      }
      
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
      {content.split("\n").map((line, i) => (
        <p key={i} className="min-h-[1em]">{parseInline(line)}</p>
      ))}
    </div>
  );
};

interface CommentItemProps {
  comment: ProblemComment;
  problemId: string;
  currentUserId?: string;
  replies?: ProblemComment[]; // Nested replies passed from parent
  isAuthenticated: boolean;
}

export function CommentItem({
  comment,
  problemId,
  currentUserId,
  isAuthenticated,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  // Optimistic UI state
  const [voteState, setVoteState] = useState<{
    score: number;
    userVote: "like" | "dislike" | null;
  }>({
    score: comment.voteCount,
    userVote: comment.userVote,
  });

  const handleVote = (type: "like" | "dislike") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    // Calculate optimistic new state
    let newScore = voteState.score;
    let newUserVote: "like" | "dislike" | null = type;

    if (voteState.userVote === type) {
      // Toggle off
      newUserVote = null;
      newScore -= type === "like" ? 1 : -1;
    } else {
      // Change vote or new vote
      if (voteState.userVote === "like") newScore -= 1;
      if (voteState.userVote === "dislike") newScore += 1;
      
      newScore += type === "like" ? 1 : -1;
    }

    setVoteState({ score: newScore, userVote: newUserVote });

    startTransition(async () => {
      const result = await voteComment(comment.id, type);
      if (result.error) {
        // Revert on error
        setVoteState({
          score: comment.voteCount,
          userVote: comment.userVote,
        });
        toast.error(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    startTransition(async () => {
      const result = await deleteComment(comment.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Comment deleted");
      }
    });
  };

  const isOwner = currentUserId === comment.author.id;

  return (
    <div className="group flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
      <Avatar className="h-8 w-8 md:h-10 md:w-10">
        <AvatarImage src={comment.author.image || undefined} alt={comment.author.name || "User"} />
        <AvatarFallback>{comment.author.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">
              {comment.author.name || "Anonymous"}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          {isOwner && (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive cursor-pointer">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="text-foreground/90">
          <MarkdownText content={comment.content} />
        </div>

        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                voteState.userVote === "like" && "text-primary bg-primary/10 dark:bg-primary/20"
              )}
              onClick={() => handleVote("like")}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <span className={cn(
              "text-xs font-medium min-w-[1ch] text-center",
              voteState.score > 0 ? "text-primary" : "text-muted-foreground"
            )}>
              {voteState.score > 0 ? voteState.score : 0}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 rounded-full",
                voteState.userVote === "dislike" && "text-red-600 bg-red-50 dark:bg-red-950/30"
              )}
              onClick={() => handleVote("dislike")}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-2 text-muted-foreground hover:text-foreground px-2"
            onClick={() => setIsReplying(!isReplying)}
          >
            <MessageSquare className="h-4 w-4" />
            Reply
          </Button>
        </div>

        {isReplying && (
          <div className="mt-4 pl-4 border-l-2 border-muted">
            <CommentEditor
              problemId={problemId}
              parentId={comment.id}
              isAuthenticated={isAuthenticated}
              autoFocus
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
              placeholder={`Reply to ${comment.author.name || "user"}...`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

