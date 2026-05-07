import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import { apiFetch } from "../api/client";
import { AppShell } from "../components/AppShell";
import { CardEvent } from "../components/cardEvent";
import { useUser } from "../context/userContext";
import perfil from "../img/pexels-stefan-stefancik-91227.jpg";

const profileFields = [
  ["firstName", "Nombre"],
  ["lastName", "Apellidos"],
  ["userName", "Usuario"],
  ["city", "Ciudad"],
  ["email", "Email"],
  ["birthdate", "Fecha de nacimiento"],
];

function formatDate(date) {
  if (!date) {
    return "Sin completar";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "Sin completar";
  }

  return parsedDate.toLocaleDateString("es-ES");
}

function toDateInputValue(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function EventsPanel({ title, emptyText, events, onChanged, onRemoved }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Typography variant="h5">{title}</Typography>
        {events.length === 0 ? (
          <Typography color="text.secondary">{emptyText}</Typography>
        ) : (
          <Stack spacing={1.5}>
            {events.map((event) => (
              <CardEvent
                key={event._id}
                event={event}
                onChanged={onChanged}
                onRemoved={onRemoved}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

export function Perfil() {
  const { users, setUsers } = useUser();
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [editable, setEditable] = useState(false);
  const [editedData, setEditedData] = useState({ ...users });
  const inputRef = useRef(null);

  useEffect(() => {
    setEditedData({ ...users, birthdate: toDateInputValue(users.birthdate) });
  }, [users]);

  useEffect(() => {
    if (!users.userName) {
      setCreatedEvents([]);
      setJoinedEvents([]);
      return;
    }

    async function fetchUserEvents() {
      try {
        const response = await apiFetch(`/api/user/${users.userName}/events`);
        const data = await response.json();
        setCreatedEvents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching user events:", error);
      }
    }

    async function fetchJoinedEvents() {
      try {
        const response = await apiFetch(`/api/user/${users.userName}/joinedEvents`);
        if (response.ok) {
          const data = await response.json();
          setJoinedEvents(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error al obtener los eventos unidos del usuario:", error);
      }
    }

    fetchUserEvents();
    fetchJoinedEvents();
  }, [users.userName]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditedData((previousData) => ({ ...previousData, [name]: value }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditedData((previousData) => ({
        ...previousData,
        profileImage: reader.result,
      }));
      setUsers({
        ...users,
        profileImage: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setUsers({ ...users, ...editedData });
    setEditable(false);
  };

  const handleEventChanged = (updatedEvent) => {
    setCreatedEvents((currentEvents) =>
      currentEvents.map((event) =>
        event._id === updatedEvent._id ? updatedEvent : event
      )
    );
    setJoinedEvents((currentEvents) => {
      const nextEvents = currentEvents.map((event) =>
        event._id === updatedEvent._id ? updatedEvent : event
      );
      const isAlreadyListed = nextEvents.some((event) => event._id === updatedEvent._id);
      const shouldBeListed = updatedEvent.participantsList?.includes(users.userName);

      if (shouldBeListed && !isAlreadyListed) {
        return [...nextEvents, updatedEvent];
      }

      return nextEvents.filter((event) =>
        event.participantsList?.includes(users.userName)
      );
    });
  };

  const handleEventRemoved = (eventId) => {
    setCreatedEvents((currentEvents) =>
      currentEvents.filter((event) => event._id !== eventId)
    );
    setJoinedEvents((currentEvents) =>
      currentEvents.filter((event) => event._id !== eventId)
    );
  };

  return (
    <AppShell
      title="Perfil"
      subtitle="Gestiona tus datos locales y revisa tu actividad dentro de la plataforma."
      actions={
        <Button startIcon={<EditRoundedIcon />} variant="contained" onClick={() => setEditable(true)}>
          Editar perfil
        </Button>
      }
    >
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md="auto">
            <Box sx={{ position: "relative", width: 128, height: 128 }}>
              <Avatar
                src={editedData.profileImage || perfil}
                sx={{ width: 128, height: 128, border: "1px solid", borderColor: "divider" }}
              />
              <Tooltip title="Editar foto">
                <IconButton
                  color="primary"
                  onClick={() => inputRef.current?.click()}
                  sx={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <PhotoCameraRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md>
            <Stack spacing={1}>
              <Typography variant="h4">
                {[users.firstName, users.lastName].filter(Boolean).join(" ") || users.userName || "Usuario"}
              </Typography>
              <Typography color="text.secondary">{users.email || "Email sin completar"}</Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                {profileFields.map(([field, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body1">
                      {field === "birthdate" ? formatDate(users.birthdate) : users[field] || "Sin completar"}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <EventsPanel
            title="Eventos creados"
            emptyText="Aun no has creado ningun evento."
            events={createdEvents}
            onChanged={handleEventChanged}
            onRemoved={handleEventRemoved}
          />
        </Grid>
        <Grid item xs={12} lg={6}>
          <EventsPanel
            title="Mis eventos"
            emptyText="No te has unido a ningun evento."
            events={joinedEvents}
            onChanged={handleEventChanged}
            onRemoved={handleEventRemoved}
          />
        </Grid>
      </Grid>

      <Dialog open={editable} onClose={() => setEditable(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar datos personales</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Nombre" name="firstName" value={editedData.firstName || ""} onChange={handleChange} />
            <TextField label="Apellidos" name="lastName" value={editedData.lastName || ""} onChange={handleChange} />
            <TextField label="Nombre de usuario" name="userName" value={editedData.userName || ""} onChange={handleChange} />
            <TextField label="Ciudad" name="city" value={editedData.city || ""} onChange={handleChange} />
            <TextField label="Email" name="email" type="email" value={editedData.email || ""} onChange={handleChange} />
            <TextField
              label="Fecha de nacimiento"
              name="birthdate"
              type="date"
              value={editedData.birthdate || ""}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditable(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
