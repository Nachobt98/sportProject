import React, { useMemo, useState } from "react";
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { CardEvent } from "../components/cardEvent";
import { EmptyState, ErrorState, LoadingState } from "../components/FeedbackState";
import { useEvents } from "../hooks/useEvents";

const DEFAULT_PAGE = 1;
const EVENTS_PAGE_SIZE = 10;

const cities = [
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Zaragoza",
  "Malaga",
  "Murcia",
  "Palma",
  "Las Palmas",
  "Bilbao",
];

const sports = [
  "Futbol",
  "Baloncesto",
  "Tenis",
  "Atletismo",
  "Natacion",
  "Ciclismo",
  "Voleibol",
  "Golf",
  "Balonmano",
  "Padel",
];

function renderEventsContent({ isLoading, loadError, events, onEventChanged, onEventRemoved }) {
  if (isLoading && events.length === 0) {
    return <LoadingState title="Cargando eventos" description="Buscando actividades disponibles con los filtros actuales." />;
  }

  if (loadError) {
    return <ErrorState title="No se pudieron cargar los eventos" message={loadError} />;
  }

  if (events.length === 0) {
    return <EmptyState title="No hay eventos disponibles" description="Prueba a limpiar filtros o buscar otra ciudad, deporte o fecha." />;
  }

  return events.map((event) => (
    <CardEvent key={event._id} event={event} onChanged={onEventChanged} onRemoved={onEventRemoved} />
  ));
}

export function SearchCard2() {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState({ city: "", sport: "", date: "" });
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [localEvents, setLocalEvents] = useState([]);
  const queryFilters = useMemo(() => ({ ...searchCriteria, page, limit: EVENTS_PAGE_SIZE }), [page, searchCriteria]);
  const eventsQuery = useEvents(queryFilters);
  const events = eventsQuery.data?.events || [];
  const pagination = eventsQuery.data?.pagination || null;
  const visibleEvents = page === DEFAULT_PAGE ? events : localEvents;

  React.useEffect(() => {
    if (!eventsQuery.data) {
      return;
    }

    setLocalEvents((currentEvents) => (page === DEFAULT_PAGE ? events : [...currentEvents, ...events]));
  }, [events, eventsQuery.data, page]);

  const updateSearchCriteria = (nextCriteria) => {
    setLocalEvents([]);
    setPage(DEFAULT_PAGE);
    setSearchCriteria(nextCriteria);
  };

  const handleEventChanged = (updatedEvent) => {
    setLocalEvents((currentEvents) => currentEvents.map((event) => (event._id === updatedEvent._id ? updatedEvent : event)));
  };

  const handleEventRemoved = (eventId) => {
    setLocalEvents((currentEvents) => currentEvents.filter((event) => event._id !== eventId));
  };

  const handleClear = () => {
    updateSearchCriteria({ city: "", sport: "", date: "" });
  };

  const handleLoadMore = () => {
    setPage((currentPage) => currentPage + 1);
  };

  return (
    <AppShell
      title="Eventos"
      subtitle="Busca actividades deportivas por ciudad, deporte o fecha y gestiona tu participacion desde una lista mas clara."
      actions={
        <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={() => navigate("/events/new")}>
          Crear evento
        </Button>
      }
    >
      <Paper sx={{ p: { xs: 2, md: 2.5 }, border: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField fullWidth label="Ciudad" select value={searchCriteria.city} onChange={(event) => updateSearchCriteria({ ...searchCriteria, city: event.target.value })}>
            {cities.map((city) => <MenuItem key={city} value={city}>{city}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Deporte" select value={searchCriteria.sport} onChange={(event) => updateSearchCriteria({ ...searchCriteria, sport: event.target.value })}>
            {sports.map((sport) => <MenuItem key={sport} value={sport}>{sport}</MenuItem>)}
          </TextField>
          <TextField fullWidth label="Fecha" type="date" value={searchCriteria.date} InputLabelProps={{ shrink: true }} onChange={(event) => updateSearchCriteria({ ...searchCriteria, date: event.target.value })} />
          <Button variant="outlined" startIcon={<RestartAltOutlinedIcon />} onClick={handleClear} sx={{ minWidth: { md: 150 } }}>
            Limpiar
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {renderEventsContent({
          isLoading: eventsQuery.isLoading,
          loadError: eventsQuery.error?.message || "",
          events: visibleEvents,
          onEventChanged: handleEventChanged,
          onEventRemoved: handleEventRemoved,
        })}
        {pagination?.hasNextPage && (
          <Button variant="outlined" onClick={handleLoadMore} disabled={eventsQuery.isFetching}>
            {eventsQuery.isFetching ? "Cargando..." : "Cargar mas"}
          </Button>
        )}
      </Stack>
    </AppShell>
  );
}
