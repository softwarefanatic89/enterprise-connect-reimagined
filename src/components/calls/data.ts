export type ParticipantState = {
  id: string;
  name: string;
  role: "Host" | "Co-host" | "Participant";
  avatar: string;
  muted: boolean;
  cameraOn: boolean;
  speaking: boolean;
  handRaised: boolean;
  isYou?: boolean;
  isPresenting?: boolean;
  connection: "excellent" | "good" | "weak";
};

export const initialParticipants: ParticipantState[] = [
  { id: "p1", name: "You", role: "Host", avatar: "🧑‍💼", muted: false, cameraOn: true, speaking: true, handRaised: false, isYou: true, connection: "excellent" },
  { id: "p2", name: "Ananya Rao", role: "Co-host", avatar: "👩‍💻", muted: true, cameraOn: true, speaking: false, handRaised: false, connection: "good" },
  { id: "p3", name: "Rahul Mehta", role: "Participant", avatar: "🧑‍🔧", muted: true, cameraOn: false, speaking: false, handRaised: true, connection: "good" },
  { id: "p4", name: "Sara Khan", role: "Participant", avatar: "👩‍🎨", muted: false, cameraOn: true, speaking: false, handRaised: false, connection: "weak" },
  { id: "p5", name: "David Chen", role: "Participant", avatar: "🧑‍💻", muted: true, cameraOn: true, speaking: false, handRaised: false, connection: "excellent" },
  { id: "p6", name: "Priya Nair", role: "Participant", avatar: "👩‍🚀", muted: true, cameraOn: false, speaking: false, handRaised: false, connection: "good" },
];

export type ChatMessage = {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  isYou?: boolean;
};

export const initialInCallMessages: ChatMessage[] = [
  { id: "m1", author: "Ananya Rao", avatar: "👩‍💻", time: "10:02", text: "Sharing the roadmap deck now." },
  { id: "m2", author: "Rahul Mehta", avatar: "🧑‍🔧", time: "10:03", text: "Can you pin slide 4? Losing audio a bit." },
  { id: "m3", author: "You", avatar: "🧑‍💼", time: "10:03", text: "Sure — repinning now.", isYou: true },
];

export type CallHistoryEntry = {
  id: string;
  type: "audio-1-1" | "video-1-1" | "audio-group" | "video-group";
  title: string;
  participants: string[];
  duration: string;
  when: string;
  status: "completed" | "missed" | "declined";
};

export const callHistory: CallHistoryEntry[] = [
  { id: "c1", type: "video-group", title: "Weekly Sync — Platform Team", participants: ["Ananya Rao", "Rahul Mehta", "Sara Khan", "You"], duration: "42m 18s", when: "Today · 09:30 AM", status: "completed" },
  { id: "c2", type: "audio-1-1", title: "1:1 with David Chen", participants: ["David Chen", "You"], duration: "12m 05s", when: "Today · 08:10 AM", status: "completed" },
  { id: "c3", type: "video-1-1", title: "Client Walkthrough — Priya Nair", participants: ["Priya Nair", "You"], duration: "0m 00s", when: "Yesterday · 06:45 PM", status: "missed" },
  { id: "c4", type: "audio-group", title: "Escalation Bridge — SEV-2", participants: ["Ananya Rao", "Rahul Mehta", "You", "+2"], duration: "28m 51s", when: "Yesterday · 04:12 PM", status: "completed" },
  { id: "c5", type: "video-group", title: "Design Review — Q3 Sprint", participants: ["Sara Khan", "David Chen", "You"], duration: "0m 00s", when: "Mon · 02:00 PM", status: "declined" },
];
