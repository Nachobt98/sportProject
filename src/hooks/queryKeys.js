export const queryKeys = {
  events: {
    all: ["events"],
    list: (filters) => ["events", "list", filters],
    detail: (eventId) => ["events", "detail", eventId],
    profile: ["events", "profile"],
    created: ["events", "profile", "created"],
    joined: ["events", "profile", "joined"],
  },
};
