import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Chip, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { apiFetch } from "../api/client";
import { CardEvent, eventPropType } from "../components/cardEvent";
import { AppShell } from "../components/AppShell";
import { EmptyState } from "../components/FeedbackState";
import { useUser } from "../context/userContext";

dayjs.locale("es");

function groupEventsByDate(events) {
  return events.reduce((groups, event) => {
    const date = dayjs(event.date).format("YYYY-MM-DD");
    return { ...groups, [date]: [...(groups[date] || []), event] };
  }, {});
}

function EventList({ events, selectedDate, emptyText, onChanged, onRemoved }) {
  const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);
  const upcomingDates = Object.keys(groupedEvents)
    .filter((date) => dayjs(date).isSame(selectedDate, "day") || dayjs(date).isAfter(selectedDate, "day"))
    .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());

  if (upcomingDates.length === 0) return <EmptyState title="Sin eventos proximos" description={emptyText} compact />;

  return (
    <Stack spacing={3}>
      {upcomingDates.map((date) => (
        <Stack spacing={1.5} key={date}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main" }} />
            <Typography variant="h6" color="text.primary">{dayjs(date).format("dddd, D [de] MMMM [de] YYYY")}</Typography>
          </Stack>
          {groupedEvents[date].map((event) => <CardEvent key={event._id} event={event} onChanged={onChanged} onRemoved={onRemoved} />)}
        </Stack>
      ))}
    </Stack>
  );
}

EventList.propTypes = {
  events: PropTypes.arrayOf(eventPropType).isRequired,
  selectedDate: PropTypes.shape({ format: PropTypes.func.isRequired }).isRequired,
  emptyText: PropTypes.string.isRequired,
  onChanged: PropTypes.func.isRequired,
  onRemoved: PropTypes.func.isRequired,
};

function CalendarStat({ icon, label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: "15px", bgcolor: "primary.soft", color: "primary.main" }}>{icon}</Box>
        <Box>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

CalendarStat.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export function Calendar() {
  const { users } = useUser();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await apiFetch("/api/events");
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }, []);

  const fetchJoinedEvents = useCallback(async () => {
    if (!users.userName) {
      setUserEvents([]);
      return;
    }
    try {
      const response = await apiFetch(`/api/user/${users.userName}/joinedEvents`);
      if (response.ok) {
        const data = await response.json();
        setUserEvents(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error al obtener los eventos unidos del usuario:", error);
    }
  }, [users.userName]);

  useEffect(() => {
    fetchEvents();
    fetchJoinedEvents();
  }, [fetchEvents, fetchJoinedEvents]);

  const selectedEvents = useMemo(() => events.filter((event) => dayjs(event.date).isSame(selectedDate, "day")), [events, selectedDate]);
  const upcomingEventsCount = useMemo(() => events.filter((event) => dayjs(event.date).isSame(selectedDate, "day") || dayjs(event.date).isAfter(selectedDate, "day")).length, [events, selectedDate]);
  const calendarStats = [
    { label: "Eventos este dia", value: selectedEvents.length, icon: <CalendarMonthOutlinedIcon /> },
    { label: "Eventos proximos", value: upcomingEventsCount, icon: <EventAvailableOutlinedIcon /> },
    { label: "Mis participaciones", value: userEvents.length, icon: <GroupsOutlinedIcon /> },
  ];

  const handleEventChanged = (updatedEvent) => {
    setEvents((currentEvents) => currentEvents.map((event) => (event._id === updatedEvent._id ? updatedEvent : event)));
    setUserEvents((currentEvents) => {
      const nextEvents = currentEvents.map((event) => (event._id === updatedEvent._id ? updatedEvent : event));
      const isAlreadyListed = nextEvents.some((event) => event._id === updatedEvent._id);
      const shouldBeListed = updatedEvent.participantsList?.includes(users.userName);
      if (shouldBeListed && !isAlreadyListed) return [...nextEvents, updatedEvent];
      return nextEvents.filter((event) => event.participantsList?.includes(users.userName));
    });
  };

  const handleEventRemoved = (eventId) => {
    setEvents((currentEvents) => currentEvents.filter((event) => event._id !== eventId));
    setUserEvents((currentEvents) => currentEvents.filter((event) => event._id !== eventId));
  };

  return (
    <AppShell title="Calendario" subtitle="Revisa los eventos por fecha y controla rapidamente los planes en los que participas." maxWidth="xl">
      <Grid container spacing={2.5}>
        {calendarStats.map((stat) => (
          <Grid item xs={12} md={4} key={stat.label}>
            <CalendarStat icon={stat.icon} value={stat.value} label={stat.label} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={5} lg={4}>
          <Paper sx={{ p: { xs: 1.5, sm: 2 }, height: "100%", border: "1px solid", borderColor: "divider" }}>
            <Stack spacing={2}>
              <Box sx={{ px: 1 }}>
                <Typography variant="h5">Selector de fecha</Typography>
                <Typography variant="body2" color="text.secondary">Elige un dia para revisar actividades concretas.</Typography>
              </Box>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DateCalendar value={selectedDate} onChange={(newValue) => setSelectedDate(newValue || dayjs())} sx={{ width: "100%", "& .MuiPickersDay-root.Mui-selected": { bgcolor: "primary.main" } }} />
              </LocalizationProvider>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <Paper sx={{ p: { xs: 2, md: 3 }, height: "100%", border: "1px solid", borderColor: "divider" }}>
            <Stack spacing={2.25}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: "center" }}>
                <Box>
                  <Typography variant="h5">Dia seleccionado</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedDate.format("dddd, D [de] MMMM [de] YYYY")}</Typography>
                </Box>
                <Chip label={`${selectedEvents.length} eventos`} color={selectedEvents.length ? "primary" : "default"} />
              </Stack>
              {selectedEvents.length === 0 ? (
                <EmptyState title="No hay eventos para este dia." description="Prueba otra fecha o revisa la lista de eventos proximos." compact />
              ) : (
                <Stack spacing={1.5}>{selectedEvents.map((event) => <CardEvent key={event._id} event={event} onChanged={handleEventChanged} onRemoved={handleEventRemoved} />)}</Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}>
          <Typography variant="h5">Planning de eventos</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Vista agrupada desde la fecha seleccionada.</Typography>
        </Box>
        <Tabs value={activeTab} onChange={(event, nextTab) => setActiveTab(nextTab)} sx={{ borderBottom: "1px solid", borderColor: "divider", px: { xs: 1, md: 2 }, mt: 2 }}>
          <Tab label="Todos los eventos" />
          <Tab label="Mis eventos" />
        </Tabs>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === 0 ? (
            <EventList events={events} selectedDate={selectedDate} emptyText="No hay eventos proximos desde esta fecha." onChanged={handleEventChanged} onRemoved={handleEventRemoved} />
          ) : (
            <EventList events={userEvents} selectedDate={selectedDate} emptyText="Todavia no te has unido a eventos proximos." onChanged={handleEventChanged} onRemoved={handleEventRemoved} />
          )}
        </Box>
      </Paper>
    </AppShell>
  );
}
