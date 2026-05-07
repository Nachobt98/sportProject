import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
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
import { getEvents } from "../api/eventsApi";

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

function renderEventsContent({
  isLoading,
  loadError,
  events,
  onEventChanged,
  onEventRemoved,
}) {
  if (isLoading) {
    return <Alert severity="info">Cargando eventos...</Alert>;
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  if (events.length === 0) {
    return <Alert severity="info">No se encontraron eventos con esos filtros.</Alert>;
  }

  return events.map((event) => (
    <CardEvent
      key={event._id}
      event={event}
      onChanged={onEventChanged}
      onRemoved={onEventRemoved}
    />
  ));
}

export function SearchCard2() {
  const navigate = useNavigate();
  const [searchCriteria, setSearchCriteria] = useState({
    city: "",
    sport: "",
    date: "",
  });
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await getEvents(searchCriteria);
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(error.message || "No se pudieron cargar los eventos.");
    } finally {
      setIsLoading(false);
    }
  }, [searchCriteria]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEventChanged = (updatedEvent) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event._id === updatedEvent._id ? updatedEvent : event
      )
    );
  };

  const handleEventRemoved = (eventId) => {
    setEvents((currentEvents) =>
      currentEvents.filter((event) => event._id !== eventId)
    );
  };

  const handleClear = () => {
    setSearchCriteria({ city: "", sport: "", date: "" });
  };

  return (
    <AppShell
      title="Eventos"
      subtitle="Busca actividades deportivas por ciudad, deporte o fecha y gestiona tu participacion desde una lista mas clara."
      actions={
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate("/events/new")}
        >
          Crear evento
        </Button>
      }
    >
      <Paper
        sx={{
          p: { xs: 2, md: 2.5 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            fullWidth
            label="Ciudad"
            select
            value={searchCriteria.city}
            onChange={(event) =>
              setSearchCriteria({ ...searchCriteria, city: event.target.value })
            }
          >
            {cities.map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Deporte"
            select
            value={searchCriteria.sport}
            onChange={(event) =>
              setSearchCriteria({ ...searchCriteria, sport: event.target.value })
            }
          >
            {sports.map((sport) => (
              <MenuItem key={sport} value={sport}>
                {sport}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Fecha"
            type="date"
            value={searchCriteria.date}
            InputLabelProps={{ shrink: true }}
            onChange={(event) =>
              setSearchCriteria({ ...searchCriteria, date: event.target.value })
            }
          />
          <Button
            variant="outlined"
            startIcon={<RestartAltOutlinedIcon />}
            onClick={handleClear}
            sx={{ minWidth: { md: 150 } }}
          >
            Limpiar
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {renderEventsContent({
          isLoading,
          loadError,
          events,
          onEventChanged: handleEventChanged,
          onEventRemoved: handleEventRemoved,
        })}
      </Stack>
    </AppShell>
  );
}
