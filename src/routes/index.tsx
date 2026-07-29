import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, PanelRightOpen } from "lucide-react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatView } from "@/components/chat/ChatView";
import { DetailsPanel } from "@/components/chat/DetailsPanel";
import { TopBar } from "@/components/chat/TopBar";
import { ShortcutsLayer } from "@/components/chat/Shortcuts";
import { conversations, type Conversation } from "@/components/chat/data";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Enterprise Chat — Software Vala" },
      {
        name: "description",
        content:
          "Immutable, audit-grade conversations with permanent message records for the Software Vala ecosystem.",
      },
      { property: "og:title", content: "Enterprise Chat — Software Vala" },
      {
        property: "og:description",
        content: "Immutable, audit-grade enterprise conversations with permanent message records.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const [active, setActive] = useState<Conversation>(conversations[0]);
  const [navOpen, setNavOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-mesh bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        {/* Left sidebar — inline from md+ */}
        <Sidebar activeId={active.id} onSelect={setActive} />

        {/* Chat area — full width on mobile */}
        <ChatView chat={active} />

        {/* Right details — inline from xl+ */}
        <DetailsPanel chat={active} />
      </div>

      {/* ─── Mobile: floating conversation-list trigger ─── */}
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        aria-label="Open conversation list"
        className="fixed left-0 top-1/2 z-40 grid h-14 w-8 -translate-y-1/2 place-items-center rounded-r-2xl bg-primary/95 text-primary-foreground shadow-[var(--shadow-float)] backdrop-blur transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
      >
        <Menu className="h-4.5 w-4.5" />
      </button>

      {/* ─── Mobile: floating details trigger ─── */}
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        aria-label="Open conversation details"
        className="fixed right-0 top-1/2 z-40 grid h-14 w-8 -translate-y-1/2 place-items-center rounded-l-2xl bg-surface/95 text-foreground shadow-[var(--shadow-float)] ring-1 ring-border backdrop-blur transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary xl:hidden"
      >
        <PanelRightOpen className="h-4.5 w-4.5" />
      </button>

      {/* ─── Mobile drawer: conversation list (slides from left) ─── */}
      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent
          side="left"
          className="w-[min(320px,88vw)] border-r-0 bg-sidebar p-0 sm:max-w-[320px] md:hidden"
        >
          <SheetTitle className="sr-only">Conversations</SheetTitle>
          <Sidebar
            mobile
            activeId={active.id}
            onSelect={setActive}
            onNavigate={() => setNavOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* ─── Mobile/tablet bottom sheet: conversation details ─── */}
      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent
          side="bottom"
          className="h-[85dvh] border-t-0 bg-sidebar p-0 xl:hidden"
        >
          <SheetTitle className="sr-only">Conversation details</SheetTitle>
          <DetailsPanel mobile chat={active} />
        </SheetContent>
      </Sheet>

      <ShortcutsLayer />
    </div>
  );
}
