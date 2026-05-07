import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Grid, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { apiFetch } from "../api/client";
import { CardEvent } from "../components/cardEvent";
import { AppShell } from "../components/AppShell";
import { useUser } from "../context/userContext";

dayjs.locale("es");

function groupEventsByDate(events) {
  return events.reduce((groups, event) => {
    const date = dayjs(event.date).format("YYYY-MM-DD");
    return {
      ...groups,
      [date]: [...(groups[date] || []), event],
    };
  }, {});
}

function EventList({ events, selectedDate, emptyText }) {
  const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);
  const upcomingDates = Object.keys(groupedEvents)
    .filter((date) => dayjs(date).isSame(selectedDate, "day") || dayjs(date).isAfter(selectedDate, "day"))
    .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf());

  if (upcomingDates.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">{emptyText}</Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      {upcomingDates.map((date) => (
        <Stack spacing={1.5} key={date}>
          <Typography variant="h6" color="text.primary">
            {dayjs(date).format("dddd, D [de] MMMM [de] YYYY")}
          </Typography>
          {groupedEvents[date].map((event) => (
            <CardEvent key={event._id} event={event} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}

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

  const selectedEvents = useMemo(
    () => events.filter((event) => dayjs(event.date).isSame(selectedDate, "day")),
    [events, selectedDate]
  );

  return (
    <AppShell
      title="Calendario"
      subtitle="Revisa los eventos por fecha y controla rapidamente los planes en los que participas."
    >
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, height: "100%" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue || dayjs())}
                sx={{
                  width: "100%",
                  "& .MuiPickersDay-root.Mui-selected": {
                    bgcolor: "primary.main",
                  },
                }}
              />
            </LocalizationProvider>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h5">Dia seleccionado</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDate.format("dddd, D [de] MMMM [de] YYYY")}
                </Typography>
              </Box>
              {selectedEvents.length === 0 ? (
                <Typography color="text.secondary">No hay eventos para este dia.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {selectedEvents.map((event) => (
                    <CardEvent key={event._id} event={event} />
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <Tabs
          value={activeTab}
          onChange={(event, nextTab) => setActiveTab(nextTab)}
          sx={{ borderBottom: "1px solid", borderColor: "divider", px: 2 }}
        >
          <Tab label="Todos los eventos" />
          <Tab label="Mis eventos" />
        </Tabs>
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {activeTab === 0 ? (
            <EventList
              events={events}
              selectedDate={selectedDate}
              emptyText="No hay eventos proximos desde esta fecha."
            />
          ) : (
            <EventList
              events={userEvents}
              selectedDate={selectedDate}
              emptyText="Todavia no te has unido a eventos proximos."
            />
          )}
        </Box>
      </Paper>
    </AppShell>
  );
}
