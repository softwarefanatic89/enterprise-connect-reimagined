import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Channel } from "./data";

export function RenameChannelDialog({
  channel, open, onOpenChange, onRename,
}: {
  channel: Channel | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onRename: (id: string, name: string) => void;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (channel) setName(channel.name);
  }, [channel]);

  if (!channel) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-5 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-[15px]">Rename channel</DialogTitle>
          <DialogDescription className="font-mono text-[11px]">{channel.id}</DialogDescription>
        </DialogHeader>
        <label className="block space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Channel name</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[12.5px] outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!name.trim()}
            onClick={() => { onRename(channel.id, name.trim()); onOpenChange(false); }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
