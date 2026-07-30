import { useState } from "react";
import { Bell, Smartphone, Laptop, Moon, MailWarning } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function Row({ icon: Icon, title, desc, checked, onChange }: { icon: typeof Bell; title: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-muted-foreground"><Icon className="h-4 w-4" /></div>
        <div>
          <div className="text-[12px] font-semibold">{title}</div>
          <div className="text-[10.5px] text-muted-foreground">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function NotificationSettings() {
  const [desktopPush, setDesktopPush] = useState(true);
  const [mobile, setMobile] = useState(true);
  const [laptop, setLaptop] = useState(true);
  const [unreadBadge, setUnreadBadge] = useState(true);
  const [quietHours, setQuietHours] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="mb-1 text-[12.5px] font-bold">Notification settings</h3>
      <p className="mb-2 text-[11px] text-muted-foreground">Control how reminders and messages reach you.</p>
      <div className="divide-y divide-border-soft">
        <Row icon={Bell} title="Desktop push notifications" desc="Show reminders as system notifications" checked={desktopPush} onChange={setDesktopPush} />
        <Row icon={Smartphone} title="Mobile device delivery" desc="Sync reminders to your mobile app" checked={mobile} onChange={setMobile} />
        <Row icon={Laptop} title="Laptop / desktop delivery" desc="Sync reminders to desktop app" checked={laptop} onChange={setLaptop} />
        <Row icon={MailWarning} title="Unread message counter" desc="Show unread badge count on app icon" checked={unreadBadge} onChange={setUnreadBadge} />
      </div>
      <div className="mt-1 border-t border-border-soft pt-2.5">
        <Row icon={Moon} title="Quiet hours" desc="Mute non-urgent notifications during set hours" checked={quietHours} onChange={setQuietHours} />
        {quietHours && (
          <div className="mt-1.5 grid grid-cols-2 gap-2.5 rounded-xl border border-border-soft bg-background p-2.5">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">From</label>
              <input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} className="h-8 w-full rounded-lg border border-border bg-card px-2 text-[12px] outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">To</label>
              <input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} className="h-8 w-full rounded-lg border border-border bg-card px-2 text-[12px] outline-none" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
