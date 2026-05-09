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
import { StatCard, SurfaceSection } from "../components/SurfacePanel";
import { useUser } from "../context/userContext";
import { removeEventById, replaceEventById, syncJoinedEvents } from "../utils/eventCollections";

dayjs.locale("es");

const paperBorderSx = { border: "1px solid", borderColor: "divider" };
const calendarTopPanelHeight = { md: 430, lg: 430 };
const topPanelSx = { width: "100%", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" };
const topGridItemSx = { display: "flex", alignSelf: "stretch", height: calendarTopPanelHeight };

async function fetchEventArray(path) {
  const response = await apiFetch(path);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

function groupEventsByDate(events) {
  return events.reduce((groups, event) => {
    const date = dayjs(event.date).format("YYYY-MM-DD");
    return { ...groups, [date]: [...(groups[date] || []), event] };
  }, {});
}

function EventCards({ events, onChanged, onRemoved }) {
  return events.map((event) => <CardEvent key={event._id} event={event} onChanged={onChanged} onRemoved={onRemoved} />);
}

EventCards.propTypes = {
  events: PropTypes.arrayOf(eventPropType).isRequired,
  onChanged: PropTypes.func.isRequired,
  onRemoved: PropTypes.func.isRequired,
};

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
          <EventCards events={groupedEvents[date]} onChanged={onChanged} onRemoved={onRemoved} />
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

function StatsGrid({ stats }) {
  return (
    <Grid container spacing={2.5}>
      {stats.map((stat) => (
        <Grid item xs={12} md={4} key={stat.label}>
          <StatCard {...stat} />
        </Grid>
      ))}
    </Grid>
  );
}

StatsGrid.propTypes = {
  stats: PropTypes.arrayOf(PropTypes.shape({
    icon: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  })).isRequired,
};

function DatePickerPanel({ selectedDate, onDateChange }) {
  return (
    <SurfaceSection title="Selector de fecha" description="Elige un dia para revisar actividades concretas." sx={{ ...topPanelSx, p: { xs: 1.5, sm: 2 } }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <DateCalendar value={selectedDate} onChange={onDateChange} sx={{ width: "100%", "& .MuiPickersDay-root.Mui-selected": { bgcolor: "primary.main" } }} />
      </LocalizationProvider>
    </SurfaceSection>
  );
}

DatePickerPanel.propTypes = {
  selectedDate: PropTypes.shape({ format: PropTypes.func.isRequired }).isRequired,
  onDateChange: PropTypes.func.isRequired,
};

function SelectedDayPanel({ selectedDate, selectedEvents, onChanged, onRemoved }) {
  return (
    <SurfaceSection title="Dia seleccionado" description={selectedDate.format("dddd, D [de] MMMM [de] YYYY")} sx={topPanelSx}>
      <Stack direction="row" justifyContent="flex-end">
        <Chip label={`${selectedEvents.length} eventos`} color={selectedEvents.length ? "primary" : "default"} />
      </Stack>
      {selectedEvents.length === 0 ? (
        <EmptyState title="No hay eventos para este dia." description="Prueba otra fecha o revisa la lista de eventos proximos." compact />
      ) : (
        <Stack spacing={1.5}>
          <EventCards events={selectedEvents} onChanged={onChanged} onRemoved={onRemoved} />
        </Stack>
      )}
    </SurfaceSection>
  );
}

SelectedDayPanel.propTypes = {
  selectedDate: PropTypes.shape({ format: PropTypes.func.isRequired }).isRequired,
  selectedEvents: PropTypes.arrayOf(eventPropType).isRequired,
  onChanged: PropTypes.func.isRequired,
  onRemoved: PropTypes.func.isRequired,
};

function PlanningPanel({ activeTab, onTabChange, tabs, selectedDate, onChanged, onRemoved }) {
  const activePlanning = tabs[activeTab];

  return (
    <Paper sx={{ overflow: "hidden", ...paperBorderSx }}>
      <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 } }}>
        <Typography variant="h5">Planning de eventos</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Vista agrupada desde la fecha seleccionada.</Typography>
      </Box>
      <Tabs value={activeTab} onChange={onTabChange} sx={{ borderBottom: "1px solid", borderColor: "divider", px: { xs: 1, md: 2 }, mt: 2 }}>
        {tabs.map((tab) => <Tab key={tab.label} label={tab.label} />)}
      </Tabs>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <EventList events={activePlanning.events} selectedDate={selectedDate} emptyText={activePlanning.emptyText} onChanged={onChanged} onRemoved={onRemoved} />
      </Box>
    </Paper>
  );
}

PlanningPanel.propTypes = {
  activeTab: PropTypes.number.isRequired,
  onTabChange: PropTypes.func.isRequired,
  tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    events: PropTypes.arrayOf(eventPropType).isRequired,
    emptyText: PropTypes.string.isRequired,
  })).isRequired,
  selectedDate: PropTypes.shape({ format: PropTypes.func.isRequired }).isRequired,
  onChanged: PropTypes.func.isRequired,
  onRemoved: PropTypes.func.isRequired,
};

export function Calendar() {
  const { users } = useUser();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      setEvents(await fetchEventArray("/api/events"));
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
      setUserEvents(await fetchEventArray(`/api/user/${users.userName}/joinedEvents`));
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
    { label: "Participaciones", value: userEvents.length, icon: <GroupsOutlinedIcon /> },
  ];
  const planningTabs = [
    { label: "Todos los eventos", events, emptyText: "No hay eventos proximos desde esta fecha." },
    { label: "Mis eventos", events: userEvents, emptyText: "Todavia no te has unido a eventos proximos." },
  ];

  const handleEventChanged = (updatedEvent) => {
    setEvents((currentEvents) => replaceEventById(currentEvents, updatedEvent));
    setUserEvents((currentEvents) => syncJoinedEvents(currentEvents, updatedEvent, users.userName));
  };

  const handleEventRemoved = (eventId) => {
    setEvents((currentEvents) => removeEventById(currentEvents, eventId));
    setUserEvents((currentEvents) => removeEventById(currentEvents, eventId));
  };

  const handleDateChange = (newValue) => setSelectedDate(newValue || dayjs());
  const handleTabChange = (_event, nextTab) => setActiveTab(nextTab);

  return (
    <AppShell title="Calendario" subtitle="Revisa los eventos por fecha y controla rapidamente los planes en los que participas." maxWidth="xl">
      <StatsGrid stats={calendarStats} />

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={5} lg={4} sx={topGridItemSx}>
          <DatePickerPanel selectedDate={selectedDate} onDateChange={handleDateChange} />
        </Grid>
        <Grid item xs={12} md={7} lg={8} sx={topGridItemSx}>
          <SelectedDayPanel selectedDate={selectedDate} selectedEvents={selectedEvents} onChanged={handleEventChanged} onRemoved={handleEventRemoved} />
        </Grid>
        <Grid item xs={12} sx={{ mt: 2 }}>
          <PlanningPanel activeTab={activeTab} onTabChange={handleTabChange} tabs={planningTabs} selectedDate={selectedDate} onChanged={handleEventChanged} onRemoved={handleEventRemoved} />
        </Grid>
      </Grid>
    </AppShell>
  );
}
