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

export function getEventStatus(status) {
  return status || EVENT_STATUS.OPEN;
}

export function isLockedEvent(event) {
  return getEventStatus(event?.status) !== EVENT_STATUS.OPEN;
}

export function canJoinEvent(event) {
  return getEventStatus(event?.status) === EVENT_STATUS.OPEN && event?.canJoin !== false;
}

export function canEditEventDate(event, isCreator) {
  return Boolean(isCreator && getEventStatus(event?.status) === EVENT_STATUS.PAST);
}

export function getEventStatusLabel(status) {
  return EVENT_STATUS_LABELS[getEventStatus(status)] || EVENT_STATUS_LABELS[EVENT_STATUS.OPEN];
}

export function getEventStatusColor(status) {
  return EVENT_STATUS_COLORS[getEventStatus(status)] || EVENT_STATUS_COLORS[EVENT_STATUS.OPEN];
}
