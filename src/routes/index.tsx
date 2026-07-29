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
      { title: "Software Vala — Enterprise Chat" },
      { name: "description", content: "Premium enterprise chat experience for the Software Vala ecosystem." },
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
        className="fixed bottom-24 left-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-float)] transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ─── Mobile: floating details trigger ─── */}
      <button
        type="button"
        onClick={() => setDetailsOpen(true)}
        aria-label="Open conversation details"
        className="fixed bottom-24 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-surface text-foreground shadow-[var(--shadow-float)] ring-1 ring-border transition-all hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background xl:hidden"
      >
        <PanelRightOpen className="h-5 w-5" />
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
