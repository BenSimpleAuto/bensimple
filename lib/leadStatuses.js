export const LEAD_STATUSES = [
  ["new", "New Lead"],
  ["needs_contact", "Needs Contact"],
  ["appointment_requested", "Appointment Requested"],
  ["appointment_confirmed", "Appointment Confirmed"],
  ["follow_up_today", "Follow Up Today"],
  ["future_follow_up", "Future Follow Up"],
  ["long_term", "Long-Term"],
  ["sold", "Closed / Sold"],
  ["lost", "Lost"]
];

export const LEAD_STATUS_VALUES = LEAD_STATUSES.map(([value]) => value);
