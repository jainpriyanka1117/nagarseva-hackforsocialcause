export type Status =
  | "Submitted"
  | "Accepted"
  | "In Progress"
  | "Resolved — pending verification"
  | "Closed: verified"
  | "Closed: unverified"
  | "Reopened";
export type Complaint = {
  id: string;
  category: string;
  location: string;
  ward: string;
  status: Status;
  priority: "High" | "Medium" | "Low";
  date: string;
  sla: string;
  description: string;
  x: number;
  y: number;
  safety?: boolean;
};

export const complaints: Complaint[] = [
  {
    id: "NS-24-01847",
    category: "Blocked drain",
    location: "12th Cross, Indiranagar",
    ward: "Ward 82",
    status: "In Progress",
    priority: "High",
    date: "Today, 09:14",
    sla: "7h 42m remaining",
    description: "Drain overflow after morning rain. Water is entering the footpath.",
    x: 31,
    y: 49,
  },
  {
    id: "NS-24-01822",
    category: "Poor lighting",
    location: "CMH Road bus stop",
    ward: "Ward 82",
    status: "Resolved — pending verification",
    priority: "Medium",
    date: "Yesterday",
    sla: "Verification due tomorrow",
    description: "Streetlight repaired; resident confirmation requested.",
    x: 65,
    y: 28,
    safety: true,
  },
  {
    id: "NS-24-01796",
    category: "Illegal dumping",
    location: "HAL 2nd Stage park edge",
    ward: "Ward 82",
    status: "Accepted",
    priority: "Medium",
    date: "18 Oct",
    sla: "1d 5h remaining",
    description: "Construction debris beside the public park entrance.",
    x: 48,
    y: 72,
  },
  {
    id: "NS-24-01751",
    category: "Broken infrastructure",
    location: "100 Ft Road crossing",
    ward: "Ward 82",
    status: "Closed: verified",
    priority: "Low",
    date: "15 Oct",
    sla: "Resolved in 19h",
    description: "Damaged pedestrian railing restored and verified by citizen.",
    x: 76,
    y: 58,
  },
];
export const statusStyles: Record<Status, string> = {
  Submitted: "bg-muted text-muted-foreground",
  Accepted: "bg-civic-soft text-civic",
  "In Progress": "bg-warning/25 text-warning-foreground",
  "Resolved — pending verification": "bg-warning/25 text-warning-foreground",
  "Closed: verified": "bg-success text-success-foreground",
  "Closed: unverified": "bg-muted text-muted-foreground",
  Reopened: "bg-risk text-risk-foreground",
};
export const categories = [
  "Broken infrastructure",
  "Illegal dumping",
  "Unsafe area",
  "Poor lighting",
  "Encroachment",
  "Blocked drain",
];
