import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelEvent,
  cancelEventJoin,
  createEvent,
  deleteEvent,
  dismissEvent,
  getCurrentUserCreatedEvents,
  getCurrentUserJoinedEvents,
  getEventById,
  getEvents,
  joinEvent,
  updateEvent,
} from "../api/eventsApi";
import { queryKeys } from "./queryKeys";

const EMPTY_ARRAY = [];

export function normalizeEventsResponse(response) {
  return Array.isArray(response)
    ? { events: response, pagination: null }
    : { events: response?.events || [], pagination: response?.pagination || null };
}

export function useEvents(filters) {
  const stableFilters = useMemo(() => ({ ...filters }), [filters]);

  return useQuery({
    queryKey: queryKeys.events.list(stableFilters),
    queryFn: async () => normalizeEventsResponse(await getEvents(stableFilters)),
  });
}

export function useEvent(eventId) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => getEventById(eventId),
    enabled: Boolean(eventId),
  });
}

export function useProfileEvents(userName) {
  const enabled = Boolean(userName);

  const createdQuery = useQuery({
    queryKey: queryKeys.events.created(userName),
    queryFn: getCurrentUserCreatedEvents,
    enabled,
  });

  const joinedQuery = useQuery({
    queryKey: queryKeys.events.joined(userName),
    queryFn: getCurrentUserJoinedEvents,
    enabled,
  });

  return {
    createdEvents: createdQuery.data || EMPTY_ARRAY,
    joinedEvents: joinedQuery.data || EMPTY_ARRAY,
    isLoading: createdQuery.isLoading || joinedQuery.isLoading,
    isFetching: createdQuery.isFetching || joinedQuery.isFetching,
    error: createdQuery.error || joinedQuery.error || null,
    refetch: () => Promise.all([createdQuery.refetch(), joinedQuery.refetch()]),
  };
}

function useInvalidateEvents() {
  const queryClient = useQueryClient();

  return async (eventId) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all }),
      eventId ? queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(eventId) }) : Promise.resolve(),
    ]);
  };
}

export function useCreateEventMutation() {
  const invalidateEvents = useInvalidateEvents();

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => invalidateEvents(),
  });
}

export function useUpdateEventMutation(eventId) {
  const invalidateEvents = useInvalidateEvents();

  return useMutation({
    mutationFn: (eventData) => updateEvent(eventId, eventData),
    onSuccess: () => invalidateEvents(eventId),
  });
}

export function useCancelEventMutation(eventId) {
  const invalidateEvents = useInvalidateEvents();

  return useMutation({
    mutationFn: () => cancelEvent(eventId),
    onSuccess: () => invalidateEvents(eventId),
  });
}

export function useDismissEventMutation(eventId) {
  const invalidateEvents = useInvalidateEvents();

  return useMutation({
    mutationFn: () => dismissEvent(eventId),
    onSuccess: () => invalidateEvents(eventId),
  });
}

export function useDeleteEventMutation(eventId) {
  const invalidateEvents = useInvalidateEvents();

  return useMutation({
    mutationFn: () => deleteEvent(eventId),
    onSuccess: () => invalidateEvents(eventId),
  });
}

export function useJoinEventMutation(eventId) {
  const invalidateEvents = useInvalidateEvents();

  return useMutation({
    mutationFn: () => joinEvent(eventId),
    onSuccess: () => invalidateEvents(eventId),
  });
}

export function useCancelEventJoinMutation(eventId) {
  const invalidateEvents = useInvalidateEvents();

  return useMutation({
    mutationFn: () => cancelEventJoin(eventId),
    onSuccess: () => invalidateEvents(eventId),
  });
}
