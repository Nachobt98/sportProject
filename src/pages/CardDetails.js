import React from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import perfil from "../img/pexels-stefan-stefancik-91227.jpg";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { useEventContext } from "../context/eventContext";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function safeLocationHref(location) {
  if (!location) {
    return null;
  }

  if (location.startsWith("http://") || location.startsWith("https://")) {
    return location;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    location
  )}`;
}

function CardDetails() {
  const { eventData } = useEventContext();
  const navigate = useNavigate();

  if (!eventData) {
    return (
      <AppShell title="Detalle de evento" maxWidth="md">
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/searchCard2")}>
              Volver
            </Button>
          }
        >
          No hay ningun evento seleccionado.
        </Alert>
      </AppShell>
    );
  }

  const participants = eventData.participantsList || [];
  const locationHref = safeLocationHref(eventData.location);

  return (
    <AppShell
      title={eventData.name}
      subtitle={eventData.description}
      maxWidth="md"
      actions={
        <Button
          variant="outlined"
          startIcon={<ArrowBackOutlinedIcon />}
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      }
    >
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={3}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip label={eventData.sport} color="primary" />
            <Chip label={eventData.city} variant="outlined" />
            <Chip
              icon={<PeopleAltOutlinedIcon />}
              label={`${participants.length}/${eventData.participants} plazas`}
              color="secondary"
              variant="outlined"
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Stack spacing={2} sx={{ flex: 1 }}>
              <Box>
                <Typography variant="overline" color="text.secondary">
                  Creador
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                  <Avatar src={perfil} />
                  <Typography variant="h6">
                    {eventData.creator || "Usuario desconocido"}
                  </Typography>
                </Stack>
              </Box>

              <Box>
                <Typography variant="overline" color="text.secondary">
                  Participantes
                </Typography>
                <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: "wrap" }}>
                  {participants.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Todavia no hay participantes.
                    </Typography>
                  ) : (
                    participants.map((participant) => (
                      <Chip
                        key={participant}
                        avatar={<Avatar src={perfil} />}
                        label={participant}
                        variant="outlined"
                      />
                    ))
                  )}
                </Stack>
              </Box>
            </Stack>

            <Stack
              spacing={2}
              sx={{
                minWidth: { md: 260 },
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <AccessTimeOutlinedIcon color="primary" />
                <Typography variant="body2">{formatDate(eventData.date)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <LocationOnOutlinedIcon color="primary" />
                {locationHref ? (
                  <MuiLink href={locationHref} target="_blank" rel="noopener">
                    {eventData.locationName || eventData.location}
                  </MuiLink>
                ) : (
                  <Typography variant="body2">
                    {eventData.locationName || "Ubicacion no indicada"}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </AppShell>
  );
}

export default CardDetails;
