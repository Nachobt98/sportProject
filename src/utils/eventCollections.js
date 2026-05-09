export function replaceEventById(events, updatedEvent) {
  return events.map((event) => (event._id === updatedEvent._id ? updatedEvent : event));
}

export function removeEventById(events, eventId) {
  return events.filter((event) => event._id !== eventId);
}

export function syncJoinedEvents(events, updatedEvent, userName) {
  const nextEvents = replaceEventById(events, updatedEvent);
  const isAlreadyListed = nextEvents.some((event) => event._id === updatedEvent._id);
  const shouldBeListed = updatedEvent.participantsList?.includes(userName);

  if (shouldBeListed && !isAlreadyListed) return [...nextEvents, updatedEvent];
  return nextEvents.filter((event) => event.participantsList?.includes(userName));
}
