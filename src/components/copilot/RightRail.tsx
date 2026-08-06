import { useState } from "react";
import { Sparkles, PanelRight } from "lucide-react";
import { DetailsPanel } from "@/components/chat/DetailsPanel";
import { AICopilotPanel } from "./AICopilotPanel";
import type { Conversation } from "@/components/chat/data";

export function RightRail({ chat, mobile = false }: { chat: Conversation; mobile?: boolean }) {
  const [tab, setTab] = useState<"copilot" | "details">("copilot");

  return (
    <div
      className={`h-full min-h-0 shrink-0 flex-col ${
        mobile ? "flex w-full" : "hidden w-[clamp(300px,20vw,352px)] xl:flex"
      }`}
    >
      <div className="panel-dark flex shrink-0 items-center gap-1 border-b border-l border-sidebar-border px-2 py-1.5">
        <RailTab active={tab === "copilot"} onClick={() => setTab("copilot")} icon={<Sparkles className="h-3.5 w-3.5" />}>
          AI Copilot
        </RailTab>
        <RailTab active={tab === "details"} onClick={() => setTab("details")} icon={<PanelRight className="h-3.5 w-3.5" />}>
          Details
        </RailTab>
      </div>
      <div className="min-h-0 flex-1">
        {tab === "copilot" ? <AICopilotPanel chat={chat} mobile /> : <DetailsPanel chat={chat} mobile />}
      </div>
    </div>
  );
}

function RailTab({
  active, onClick, icon, children,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11.5px] font-semibold transition-all active:scale-[0.98] ${
        active
          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
          : "text-sidebar-muted hover:bg-sidebar-surface-hover hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
