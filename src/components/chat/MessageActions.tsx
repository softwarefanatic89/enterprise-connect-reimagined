import { useState } from "react";
import {
  Reply, Pencil, Trash2, Forward, Copy, Link2, Star, Pin, Quote,
  Smile, MoreHorizontal, MessageSquareText,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type MessageActionHandlers = {
  onReplyInThread: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onForward: (target: string) => void;
  onCopyText: () => void;
  onCopyLink: () => void;
  onStar: () => void;
  onPin: () => void;
  onQuote: () => void;
  onReact: () => void;
  starred: boolean;
  pinned: boolean;
  canEdit: boolean;
  forwardTargets: string[];
};

/** Hover action bar shown on top of a bubble (desktop) */
export function MessageActionBar({ out, h }: { out: boolean; h: MessageActionHandlers }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);

  return (
    <>
      <div
        role="toolbar"
        aria-label="Message actions"
        className={`pointer-events-none absolute -top-4 ${out ? "right-2" : "left-2"} z-20 flex items-center gap-0.5 rounded-full border border-border bg-popover px-1 py-1 opacity-0 shadow-[0_10px_28px_-12px_oklch(0.35_0.12_290/0.5)] backdrop-blur-xl transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100`}
      >
        <ActBtn label="React" onClick={h.onReact}><Smile className="h-3.5 w-3.5" /></ActBtn>
        <ActBtn label="Reply in thread" onClick={h.onReplyInThread}><MessageSquareText className="h-3.5 w-3.5" /></ActBtn>
        <ActBtn label="Quote" onClick={h.onQuote}><Quote className="h-3.5 w-3.5" /></ActBtn>
        <ActBtn label={h.pinned ? "Unpin" : "Pin"} onClick={h.onPin} active={h.pinned}><Pin className="h-3.5 w-3.5" /></ActBtn>
        <ActBtn label={h.starred ? "Unstar" : "Star"} onClick={h.onStar} active={h.starred}><Star className="h-3.5 w-3.5" /></ActBtn>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              title="More"
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-all hover:bg-surface-hover hover:text-foreground"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={out ? "end" : "start"} className="w-48">
            {h.canEdit && (
              <DropdownMenuItem onClick={h.onEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setForwardOpen(true)}>
              <Forward className="mr-2 h-3.5 w-3.5" /> Forward
            </DropdownMenuItem>
            <DropdownMenuItem onClick={h.onCopyText}>
              <Copy className="mr-2 h-3.5 w-3.5" /> Copy text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={h.onCopyLink}>
              <Link2 className="mr-2 h-3.5 w-3.5" /> Copy permalink
            </DropdownMenuItem>
            <DropdownMenuItem onClick={h.onReplyInThread}>
              <Reply className="mr-2 h-3.5 w-3.5" /> Reply
            </DropdownMenuItem>
            {h.canEdit && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmOpen(true)}
                  className="text-[--color-destructive] focus:text-[--color-destructive]"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the message from the conversation for everyone. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[--color-destructive] text-white hover:bg-[--color-destructive]/90"
              onClick={() => { h.onDelete(); toast.success("Message deleted"); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ForwardDialog
        open={forwardOpen}
        onOpenChange={setForwardOpen}
        targets={h.forwardTargets}
        onForward={h.onForward}
      />
    </>
  );
}

function ActBtn({ children, label, onClick, active }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`grid h-7 w-7 place-items-center rounded-full transition-all hover:bg-surface-hover ${active ? "text-gold" : "text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function ForwardDialog({
  open, onOpenChange, targets, onForward,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  targets: string[];
  onForward: (target: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Forward message</DialogTitle>
          <DialogDescription>Choose a channel or user to forward this message to.</DialogDescription>
        </DialogHeader>
        <div className="scrollbar-thin max-h-64 overflow-y-auto rounded-lg border border-border">
          {targets.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSelected(t)}
              className={`flex w-full items-center gap-2 border-b border-border-soft px-3 py-2 text-left font-mono text-[12px] last:border-b-0 transition-colors hover:bg-surface-hover ${selected === t ? "bg-primary-soft text-primary" : ""}`}
            >
              {t}
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              onForward(selected);
              toast.success("Message forwarded", { description: `Sent to ${selected}` });
              onOpenChange(false);
              setSelected(null);
            }}
          >
            <Forward className="mr-1.5 h-3.5 w-3.5" /> Forward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
