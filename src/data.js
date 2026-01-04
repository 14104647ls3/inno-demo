const STATUS_ON_HOLD = { id: 1, name: "On Hold", color: "blue.200" };
const STATUS_IN_PROGRESS = { id: 2, name: "In Progress", color: "yellow.500", };
const STATUS_RE_ENGAGEMENT = { id: 3, name: "Re-engagement", color: "pink.300" };
const STATUS_PROPOSAL_SENT = { id: 4, name: "Proposal Sent", color: "blue.300" };
const STATUS_CLOSED_LOST = { id: 5, name: "Closed Lost", color: "red.600" };
const STATUS_CLOSED_WON = { id: 6, name: "Closed Won", color: "green.600" };
const STATUS_CONTACTED = { id: 7, name: "Contacted", color: "blue.100" };
const STATUS_DISQUALIFIED = { id: 8, name: "Disqualified", color: "red.600" };
const STATUS_NEW_LEAD = { id: 9, name: "New Lead", color: "yellow.300" };
const STATUS_NEGOTIATION = { id: 10, name: "Negotiation", color: "blue.600" };
const STATUS_QUALIFIED = { id: 11, name: "Qualified", color: "green.200" };


export const STATUSES = [
  STATUS_NEW_LEAD,
  STATUS_IN_PROGRESS,
  STATUS_CONTACTED,
  STATUS_ON_HOLD,
  STATUS_PROPOSAL_SENT,
  STATUS_NEGOTIATION,
  STATUS_QUALIFIED,
  STATUS_CLOSED_WON,
  STATUS_CLOSED_LOST,
  STATUS_DISQUALIFIED,
  STATUS_RE_ENGAGEMENT,
];

const DATA = [
  {
    task: "Add a New Feature",
    status: STATUS_ON_HOLD,
    due: new Date("2023/10/15"),
    notes: "This is a note",
  }, {
    task: "Add a New Feature",
    status: STATUS_IN_PROGRESS,
    due: new Date("2023/10/15"),
    notes: "This is a note",
  },
  {
    task: "Add a New Feature",
    status: STATUS_RE_ENGAGEMENT,
    due: new Date("2023/10/15"),
    notes: "This is a note",
  }
];

export default DATA;
