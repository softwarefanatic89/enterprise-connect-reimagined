import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { Channel } from "./data";

export function DeleteChannelDialog({
  channel, open, onOpenChange, onConfirm,
}: {
  channel: Channel | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (id: string) => void;
}) {
  if (!channel) return null;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[15px]">Delete {channel.kind === "dm" ? "conversation" : "channel"}?</AlertDialogTitle>
          <AlertDialogDescription className="text-[11.5px]">
            This will permanently remove <span className="font-mono font-semibold text-foreground">{channel.name}</span>{" "}
            ({channel.id}) for you. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => onConfirm(channel.id)}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
