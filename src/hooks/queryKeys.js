export const queryKeys = {
  events: {
    all: ["events"],
    list: (filters) => ["events", "list", filters],
    detail: (eventId) => ["events", "detail", eventId],
    profile: (userName) => ["events", "profile", userName],
    created: (userName) => ["events", "profile", userName, "created"],
    joined: (userName) => ["events", "profile", userName, "joined"],
  },
};
