// Role-Based Expression Library — Software Vala
// Professional emoji sets per role. No memes, no childish content.

export type ExpressionRole =
  | "FOUNDER" | "MANAGER" | "DEVELOPER" | "DESIGNER" | "QA"
  | "SALES" | "SUPPORT" | "CLIENT" | "RESELLER" | "FRANCHISE"
  | "INFLUENCER" | "AFFILIATE" | "AUTHOR" | "VENDOR" | "CREATOR"
  | "MARKETING" | "HR" | "FINANCE" | "ADMIN" | "AI";

export type Expression = { label: string; emoji: string };

export type ExpressionPack = {
  role: ExpressionRole;
  title: string;
  icon: string;
  accent: string; // tailwind text/border accent
  categories: { name: string; items: Expression[] }[];
};

const COMMON: Expression[] = [
  { label: "Approved", emoji: "✅" },
  { label: "Rejected", emoji: "🚫" },
  { label: "Pending", emoji: "🕒" },
  { label: "Completed", emoji: "🎯" },
  { label: "In Progress", emoji: "🔄" },
  { label: "Urgent", emoji: "🚨" },
  { label: "Reminder", emoji: "🔔" },
  { label: "Meeting", emoji: "📅" },
  { label: "Announcement", emoji: "📣" },
  { label: "Congratulations", emoji: "🎊" },
  { label: "Welcome", emoji: "🙌" },
  { label: "Thank You", emoji: "🙏" },
  { label: "Sorry", emoji: "🕊️" },
  { label: "Good Morning", emoji: "🌅" },
  { label: "Good Night", emoji: "🌙" },
  { label: "Success", emoji: "🏆" },
  { label: "Warning", emoji: "⚠️" },
  { label: "Information", emoji: "ℹ️" },
  { label: "Error", emoji: "❌" },
  { label: "Question", emoji: "❓" },
  { label: "Idea", emoji: "💡" },
  { label: "Innovation", emoji: "🚀" },
  { label: "Teamwork", emoji: "🤝" },
  { label: "Celebration", emoji: "🎉" },
];

export const EXPRESSIONS: Record<ExpressionRole, ExpressionPack> = {
  FOUNDER: {
    role: "FOUNDER", title: "Founder / Boss", icon: "👑", accent: "text-amber-600",
    categories: [
      { name: "Leadership", items: [
        { label: "Leadership", emoji: "👑" },
        { label: "Vision", emoji: "🔭" },
        { label: "Strategy", emoji: "♟️" },
        { label: "Decision", emoji: "🗝️" },
        { label: "Announcement", emoji: "📣" },
      ]},
      { name: "Recognition", items: [
        { label: "Approval", emoji: "✅" },
        { label: "Congratulations", emoji: "🎊" },
        { label: "Award", emoji: "🏅" },
        { label: "Milestone", emoji: "🎖️" },
        { label: "Achievement", emoji: "🏆" },
      ]},
      { name: "Growth", items: [
        { label: "Investment", emoji: "💼" },
        { label: "Growth", emoji: "📈" },
        { label: "Success", emoji: "🌟" },
        { label: "Meeting", emoji: "📅" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  MANAGER: {
    role: "MANAGER", title: "Manager", icon: "🧭", accent: "text-blue-600",
    categories: [
      { name: "Workflow", items: [
        { label: "Approved", emoji: "✅" },
        { label: "Rejected", emoji: "🚫" },
        { label: "Assigned", emoji: "📌" },
        { label: "Escalated", emoji: "⬆️" },
        { label: "Review", emoji: "🔍" },
        { label: "Priority", emoji: "🔺" },
      ]},
      { name: "Planning", items: [
        { label: "Meeting", emoji: "📅" },
        { label: "Reminder", emoji: "🔔" },
        { label: "Planning", emoji: "🗺️" },
        { label: "Progress", emoji: "📊" },
        { label: "Completed", emoji: "🎯" },
        { label: "Deadline", emoji: "⏰" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  DEVELOPER: {
    role: "DEVELOPER", title: "Developer", icon: "💻", accent: "text-emerald-600",
    categories: [
      { name: "Code", items: [
        { label: "Coding", emoji: "💻" },
        { label: "Debugging", emoji: "🔧" },
        { label: "Bug", emoji: "🐞" },
        { label: "Bug Fixed", emoji: "✅" },
        { label: "Refactoring", emoji: "🧹" },
        { label: "Commit", emoji: "📝" },
        { label: "Merge", emoji: "🔀" },
        { label: "Pull Request", emoji: "🔃" },
      ]},
      { name: "Ship", items: [
        { label: "Deploy", emoji: "🚀" },
        { label: "Build Success", emoji: "🟢" },
        { label: "Build Failed", emoji: "🔴" },
        { label: "Release", emoji: "📦" },
        { label: "Production", emoji: "🏭" },
        { label: "Sprint", emoji: "🏁" },
      ]},
      { name: "Stack", items: [
        { label: "Testing", emoji: "🧪" },
        { label: "API", emoji: "🔌" },
        { label: "Database", emoji: "🗄️" },
        { label: "Server", emoji: "🖥️" },
        { label: "Performance", emoji: "⚡" },
      ]},
      { name: "Flow", items: [
        { label: "Coffee", emoji: "☕" },
        { label: "Late Night Coding", emoji: "🌙" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  DESIGNER: {
    role: "DESIGNER", title: "Designer", icon: "🎨", accent: "text-pink-600",
    categories: [
      { name: "Craft", items: [
        { label: "Creative", emoji: "🎨" },
        { label: "UI", emoji: "🖼️" },
        { label: "UX", emoji: "🧭" },
        { label: "Prototype", emoji: "🧩" },
        { label: "Wireframe", emoji: "📐" },
        { label: "Color", emoji: "🌈" },
        { label: "Typography", emoji: "🔠" },
        { label: "Illustration", emoji: "🖌️" },
        { label: "Animation", emoji: "🎞️" },
      ]},
      { name: "Review", items: [
        { label: "Design Review", emoji: "🔍" },
        { label: "Approval", emoji: "✅" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  QA: {
    role: "QA", title: "QA / Tester", icon: "🧪", accent: "text-sky-600",
    categories: [
      { name: "Testing", items: [
        { label: "Bug Report", emoji: "🐛" },
        { label: "Testing", emoji: "🧪" },
        { label: "Regression", emoji: "🔁" },
        { label: "Passed", emoji: "✅" },
        { label: "Failed", emoji: "❌" },
        { label: "Verification", emoji: "🔎" },
        { label: "Quality", emoji: "🏅" },
        { label: "Checklist", emoji: "📋" },
        { label: "Automation", emoji: "🤖" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  SALES: {
    role: "SALES", title: "Sales", icon: "💼", accent: "text-orange-600",
    categories: [
      { name: "Pipeline", items: [
        { label: "Deal Closed", emoji: "🤝" },
        { label: "Lead", emoji: "🎯" },
        { label: "Negotiation", emoji: "💬" },
        { label: "Target", emoji: "🏹" },
        { label: "Proposal", emoji: "📄" },
        { label: "Follow Up", emoji: "🔁" },
        { label: "Customer Visit", emoji: "🚗" },
      ]},
      { name: "Money", items: [
        { label: "Payment", emoji: "💳" },
        { label: "Invoice", emoji: "🧾" },
        { label: "Celebration", emoji: "🎉" },
        { label: "Meeting", emoji: "📅" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  SUPPORT: {
    role: "SUPPORT", title: "Support", icon: "🎧", accent: "text-violet-600",
    categories: [
      { name: "Tickets", items: [
        { label: "Issue", emoji: "⚠️" },
        { label: "Resolved", emoji: "✅" },
        { label: "Investigating", emoji: "🔍" },
        { label: "Escalated", emoji: "⬆️" },
        { label: "Need Information", emoji: "❓" },
        { label: "Waiting", emoji: "⏳" },
        { label: "Customer Reply", emoji: "💬" },
        { label: "Support Ticket", emoji: "🎫" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  CLIENT: {
    role: "CLIENT", title: "User / Client", icon: "🧾", accent: "text-slate-600",
    categories: [
      { name: "Voice", items: [
        { label: "Thank You", emoji: "🙏" },
        { label: "Question", emoji: "❓" },
        { label: "Problem", emoji: "⚠️" },
        { label: "Feedback", emoji: "💬" },
        { label: "Request", emoji: "📝" },
        { label: "Waiting", emoji: "⏳" },
        { label: "Suggestion", emoji: "💡" },
        { label: "Complaint", emoji: "📩" },
      ]},
      { name: "Status", items: [
        { label: "Happy", emoji: "😊" },
        { label: "Sad", emoji: "🙁" },
        { label: "Confused", emoji: "🤔" },
        { label: "Success", emoji: "🎉" },
        { label: "Payment", emoji: "💳" },
        { label: "Approval", emoji: "✅" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  RESELLER: {
    role: "RESELLER", title: "Reseller", icon: "🛍️", accent: "text-rose-600",
    categories: [
      { name: "Business", items: [
        { label: "New Customer", emoji: "🧑‍💼" },
        { label: "Commission", emoji: "💰" },
        { label: "Referral", emoji: "🔗" },
        { label: "Sales", emoji: "📈" },
        { label: "Target", emoji: "🎯" },
        { label: "Network", emoji: "🌐" },
        { label: "Reward", emoji: "🎁" },
        { label: "Business Growth", emoji: "🚀" },
        { label: "Partner", emoji: "🤝" },
        { label: "Success", emoji: "🏆" },
        { label: "Achievement", emoji: "🏅" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  FRANCHISE: {
    role: "FRANCHISE", title: "Franchise", icon: "🏢", accent: "text-indigo-600",
    categories: [
      { name: "Operations", items: [
        { label: "Branch", emoji: "🏢" },
        { label: "Team", emoji: "👥" },
        { label: "Expansion", emoji: "🗺️" },
        { label: "Opening", emoji: "🎀" },
        { label: "Training", emoji: "🎓" },
        { label: "Performance", emoji: "📊" },
        { label: "Revenue", emoji: "💵" },
        { label: "Branch Success", emoji: "🏆" },
        { label: "Award", emoji: "🏅" },
        { label: "Growth", emoji: "📈" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  INFLUENCER: {
    role: "INFLUENCER", title: "Influencer", icon: "📢", accent: "text-fuchsia-600",
    categories: [
      { name: "Content", items: [
        { label: "Promotion", emoji: "📢" },
        { label: "Campaign", emoji: "🚩" },
        { label: "Collaboration", emoji: "🤝" },
        { label: "Brand", emoji: "🏷️" },
        { label: "Trending", emoji: "📈" },
        { label: "Content Published", emoji: "📰" },
        { label: "Live", emoji: "🔴" },
        { label: "Engagement", emoji: "💬" },
        { label: "Followers", emoji: "👥" },
        { label: "Creator Success", emoji: "🌟" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  AFFILIATE: {
    role: "AFFILIATE", title: "Affiliate", icon: "🔗", accent: "text-rose-500",
    categories: [
      { name: "Performance", items: [
        { label: "Referral", emoji: "🔗" },
        { label: "Affiliate Sale", emoji: "💸" },
        { label: "Commission", emoji: "💰" },
        { label: "Conversion", emoji: "🔄" },
        { label: "Tracking", emoji: "📍" },
        { label: "Performance", emoji: "📊" },
        { label: "Campaign", emoji: "🚩" },
        { label: "Reward", emoji: "🎁" },
        { label: "Target Achieved", emoji: "🎯" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  AUTHOR: {
    role: "AUTHOR", title: "Author", icon: "✍️", accent: "text-yellow-700",
    categories: [
      { name: "Craft", items: [
        { label: "Writing", emoji: "✍️" },
        { label: "Publishing", emoji: "📚" },
        { label: "Book", emoji: "📖" },
        { label: "Research", emoji: "🔬" },
        { label: "Draft", emoji: "📝" },
        { label: "Review", emoji: "🔍" },
        { label: "Knowledge", emoji: "🧠" },
        { label: "Documentation", emoji: "📑" },
        { label: "Learning", emoji: "🎓" },
        { label: "Achievement", emoji: "🏆" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  VENDOR: {
    role: "VENDOR", title: "Vendor", icon: "🏭", accent: "text-fuchsia-500",
    categories: [
      { name: "Supply", items: [
        { label: "Quotation", emoji: "🧾" },
        { label: "Purchase", emoji: "🛒" },
        { label: "Inventory", emoji: "📦" },
        { label: "Supply", emoji: "🏭" },
        { label: "Shipment", emoji: "🚚" },
        { label: "Delivery", emoji: "📬" },
        { label: "Invoice", emoji: "📄" },
        { label: "Payment Received", emoji: "💰" },
        { label: "Stock", emoji: "🗃️" },
        { label: "Order Completed", emoji: "✅" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  CREATOR: {
    role: "CREATOR", title: "Content Creator", icon: "🎬", accent: "text-red-600",
    categories: [
      { name: "Production", items: [
        { label: "Video", emoji: "🎥" },
        { label: "Editing", emoji: "✂️" },
        { label: "Camera", emoji: "📷" },
        { label: "Recording", emoji: "🎙️" },
        { label: "Thumbnail", emoji: "🖼️" },
        { label: "Publishing", emoji: "📤" },
        { label: "Content Ready", emoji: "✅" },
        { label: "Live Stream", emoji: "🔴" },
        { label: "Shorts", emoji: "📱" },
        { label: "Podcast", emoji: "🎧" },
        { label: "Photography", emoji: "📸" },
        { label: "Creative Success", emoji: "🌟" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  MARKETING: {
    role: "MARKETING", title: "Marketing", icon: "📣", accent: "text-orange-500",
    categories: [
      { name: "Growth", items: [
        { label: "Campaign", emoji: "🚩" },
        { label: "Ads", emoji: "📢" },
        { label: "SEO", emoji: "🔎" },
        { label: "Analytics", emoji: "📊" },
        { label: "Traffic", emoji: "🚦" },
        { label: "Leads", emoji: "🎯" },
        { label: "Brand", emoji: "🏷️" },
        { label: "Growth", emoji: "📈" },
        { label: "Launch", emoji: "🚀" },
        { label: "Promotion", emoji: "🎁" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  HR: {
    role: "HR", title: "Human Resources", icon: "🧑‍💼", accent: "text-teal-600",
    categories: [
      { name: "People", items: [
        { label: "Interview", emoji: "💬" },
        { label: "Hiring", emoji: "📝" },
        { label: "Employee", emoji: "🧑‍💼" },
        { label: "Training", emoji: "🎓" },
        { label: "Attendance", emoji: "📅" },
        { label: "Welcome", emoji: "🙌" },
        { label: "Appreciation", emoji: "🌸" },
        { label: "Birthday", emoji: "🎂" },
        { label: "Celebration", emoji: "🎉" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  FINANCE: {
    role: "FINANCE", title: "Finance", icon: "💰", accent: "text-emerald-700",
    categories: [
      { name: "Books", items: [
        { label: "Invoice", emoji: "🧾" },
        { label: "Payment", emoji: "💳" },
        { label: "Expense", emoji: "📉" },
        { label: "Profit", emoji: "📈" },
        { label: "Revenue", emoji: "💵" },
        { label: "Tax", emoji: "🏛️" },
        { label: "Settlement", emoji: "⚖️" },
        { label: "Budget", emoji: "📊" },
        { label: "Approval", emoji: "✅" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  ADMIN: {
    role: "ADMIN", title: "Admin", icon: "⚙️", accent: "text-zinc-600",
    categories: [
      { name: "System", items: [
        { label: "Workspace", emoji: "🗂️" },
        { label: "Permission", emoji: "🔑" },
        { label: "Security", emoji: "🛡️" },
        { label: "Audit", emoji: "📋" },
        { label: "Configuration", emoji: "⚙️" },
        { label: "Monitoring", emoji: "📡" },
        { label: "Backup", emoji: "💾" },
        { label: "Approval", emoji: "✅" },
        { label: "Maintenance", emoji: "🔧" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
  AI: {
    role: "AI", title: "AI Assistant", icon: "✦", accent: "text-cyan-600",
    categories: [
      { name: "Intelligence", items: [
        { label: "Thinking", emoji: "🧠" },
        { label: "Analyzing", emoji: "🔬" },
        { label: "Searching", emoji: "🔎" },
        { label: "Learning", emoji: "📚" },
        { label: "Generating", emoji: "✨" },
        { label: "Completed", emoji: "✅" },
        { label: "Suggestion", emoji: "💡" },
        { label: "Automation", emoji: "🤖" },
        { label: "Insight", emoji: "📊" },
        { label: "Smart Reply", emoji: "💬" },
      ]},
      { name: "Common", items: COMMON },
    ],
  },
};

export const EXPRESSION_ROLE_LIST: ExpressionRole[] = [
  "FOUNDER","MANAGER","DEVELOPER","DESIGNER","QA","SALES","SUPPORT",
  "CLIENT","RESELLER","FRANCHISE","INFLUENCER","AFFILIATE","AUTHOR",
  "VENDOR","CREATOR","MARKETING","HR","FINANCE","ADMIN","AI",
];

const STORAGE_KEY = "sv-current-role";

export function getStoredRole(): ExpressionRole {
  if (typeof window === "undefined") return "FOUNDER";
  const v = window.localStorage.getItem(STORAGE_KEY) as ExpressionRole | null;
  return v && EXPRESSIONS[v] ? v : "FOUNDER";
}
export function setStoredRole(r: ExpressionRole) {
  if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, r);
}
