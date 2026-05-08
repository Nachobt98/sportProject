export const EVENT_STATUS = {
  OPEN: "open",
  FULL: "full",
  CANCELLED: "cancelled",
  PAST: "past",
};

export const EVENT_STATUS_LABELS = {
  [EVENT_STATUS.OPEN]: "Open",
  [EVENT_STATUS.FULL]: "Full",
  [EVENT_STATUS.CANCELLED]: "Cancelled",
  [EVENT_STATUS.PAST]: "Past",
};

export const EVENT_STATUS_COLORS = {
  [EVENT_STATUS.OPEN]: "success",
  [EVENT_STATUS.FULL]: "warning",
  [EVENT_STATUS.CANCELLED]: "error",
  [EVENT_STATUS.PAST]: "default",
};

export function isLockedEvent(event) {
  return event?.status && event.status !== EVENT_STATUS.OPEN;
}

export function canJoinEvent(event) {
  return event?.status === EVENT_STATUS.OPEN && event.canJoin !== false;
}

export function canEditEventDate(event, isCreator) {
  return Boolean(isCreator && event?.status === EVENT_STATUS.PAST);
}

export function getEventStatusLabel(status) {
  return EVENT_STATUS_LABELS[status] || EVENT_STATUS_LABELS[EVENT_STATUS.OPEN];
}

export function getEventStatusColor(status) {
  return EVENT_STATUS_COLORS[status] || EVENT_STATUS_COLORS[EVENT_STATUS.OPEN];
}
