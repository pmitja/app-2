"use client";

import { MessageSquare } from "lucide-react";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProblemComment } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { CommentEditor } from "./comment-editor";
import { CommentItem } from "./comment-item";

interface CommentSectionProps {
  problemId: string;
  comments: ProblemComment[];
  isAuthenticated: boolean;
  currentUserId?: string;
}

interface CommentNode extends ProblemComment {
  children: CommentNode[];
}

function buildCommentTree(comments: ProblemComment[]): CommentNode[] {
  const commentMap = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  // Initialize map
  comments.forEach((c) => {
    commentMap.set(c.id, { ...c, children: [] });
  });

  // Build tree
  comments.forEach((c) => {
    const node = commentMap.get(c.id)!;
    if (c.parentId && commentMap.has(c.parentId)) {
      commentMap.get(c.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // Sort: Root comments by date (desc), Replies by date (asc) usually makes sense, 
  // but let's stick to user preference or default. 
  // The query returns desc. So roots are Newest First.
  // Replies usually strictly chronological (Oldest First) to read like a conversation, 
  // or Newest First. 
  // Let's sort replies Oldest First (asc) so it reads top-down.
  const sortReplies = (nodes: CommentNode[]) => {
    nodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    nodes.forEach(n => sortReplies(n.children));
  };

  // Roots we might want Newest First (default from DB is desc, so already sorted if we preserve order).
  // But let's ensure it.
  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Sort children recursively
  roots.forEach(root => sortReplies(root.children));

  return roots;
}

function CommentThread({ 
  node, 
  problemId, 
  currentUserId, 
  isAuthenticated 
}: { 
  node: CommentNode; 
  problemId: string; 
  currentUserId?: string; 
  isAuthenticated: boolean;
}) {
  return (
    <div className="group">
      <CommentItem
        comment={node}
        problemId={problemId}
        currentUserId={currentUserId}
        isAuthenticated={isAuthenticated}
      />
      
      {node.children.length > 0 && (
        <div className="relative mt-4 pl-6 md:pl-8">
           {/* Thread line */}
          <div className="absolute left-2 md:left-3 top-0 bottom-0 w-px bg-border/50 group-last:bottom-auto group-last:h-full" />
          
          <div className="space-y-6">
            {node.children.map((child) => (
              <CommentThread
                key={child.id}
                node={child}
                problemId={problemId}
                currentUserId={currentUserId}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  problemId,
  comments,
  isAuthenticated,
  currentUserId,
}: CommentSectionProps) {
  const [sort, setSort] = React.useState("newest");
  
  // Filter for discussion type only? The prompt says "reply and like and dislike system for our comments inside the problem".
  // The existing page filters: const discussionComments = problem.comments.filter((c) => c.type === "discussion");
  // We should probably handle both or pass pre-filtered comments.
  // The Page component currently filters. I will assume the passed `comments` are the ones we want to show.
  
  const tree = React.useMemo(() => buildCommentTree(comments), [comments]);

  // Handle sort for roots
  const sortedTree = React.useMemo(() => {
    return [...tree].sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
  }, [tree, sort]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          Comments
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
            {comments.length}
          </span>
        </h3>
        
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Most recent</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <CommentEditor
        problemId={problemId}
        isAuthenticated={isAuthenticated}
      />

      <div className="space-y-8">
        {sortedTree.length > 0 ? (
          sortedTree.map((node) => (
            <CommentThread
              key={node.id}
              node={node}
              problemId={problemId}
              currentUserId={currentUserId}
              isAuthenticated={isAuthenticated}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/30">
            <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
            <p className="font-medium">No comments yet</p>
            <p className="text-sm opacity-60">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}

