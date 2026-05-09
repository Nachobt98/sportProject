import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
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
import { AppShell } from "../components/AppShell";
import { CardEvent, eventPropType } from "../components/cardEvent";
import { EmptyState, ErrorState, LoadingState } from "../components/FeedbackState";
import { UserAvatar } from "../components/UserAvatar";
import { useUser } from "../context/userContext";
import { useProfileEvents } from "../hooks/useEvents";
import { updateCurrentUser } from "../api/usersApi";

const profileFields = [
  ["firstName", "Nombre"],
  ["lastName", "Apellidos"],
  ["userName", "Usuario"],
  ["city", "Ciudad"],
  ["email", "Email"],
  ["birthdate", "Fecha de nacimiento"],
];

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function formatDate(date) {
  if (!date) return "Sin completar";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Sin completar";
  return parsedDate.toLocaleDateString("es-ES");
}

function toDateInputValue(date) {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toISOString().slice(0, 10);
}

function buildProfilePayload(profileData) {
  return {
    firstName: profileData.firstName,
    lastName: profileData.lastName,
    city: profileData.city,
    email: profileData.email,
    birthdate: profileData.birthdate,
    profileImage: profileData.profileImage || "",
  };
}

function EventsPanel({ title, emptyText, events, onChanged, onRemoved }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Typography variant="h5">{title}</Typography>
        {events.length === 0 ? (
          <EmptyState title={emptyText} description="Cuando haya actividad, aparecera aqui con sus acciones disponibles." compact />
        ) : (
          <Stack spacing={1.5}>
            {events.map((event) => (
              <CardEvent key={event._id} event={event} onChanged={onChanged} onRemoved={onRemoved} />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

EventsPanel.propTypes = {
  title: PropTypes.string.isRequired,
  emptyText: PropTypes.string.isRequired,
  events: PropTypes.arrayOf(eventPropType).isRequired,
  onChanged: PropTypes.func.isRequired,
  onRemoved: PropTypes.func.isRequired,
};

export function Perfil() {
  const { users, setUsers } = useUser();
  const profileEventsQuery = useProfileEvents(users.userName);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editable, setEditable] = useState(false);
  const [editedData, setEditedData] = useState({ ...users });
  const inputRef = useRef(null);

  useEffect(() => {
    setEditedData({ ...users, birthdate: toDateInputValue(users.birthdate) });
  }, [users]);

  useEffect(() => {
    setCreatedEvents(profileEventsQuery.createdEvents);
    setJoinedEvents(profileEventsQuery.joinedEvents);
  }, [profileEventsQuery.createdEvents, profileEventsQuery.joinedEvents]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setEditedData((previousData) => ({ ...previousData, [name]: value }));
  };

  const persistProfile = async (profileData, successMessage) => {
    setProfileError("");
    setProfileSuccess("");
    setIsSaving(true);
    try {
      const data = await updateCurrentUser(buildProfilePayload(profileData));
      setUsers(data.user);
      setEditedData({ ...data.user, birthdate: toDateInputValue(data.user.birthdate) });
      setProfileSuccess(successMessage);
      return data.user;
    } catch (error) {
      setProfileError(error.message || "No se pudo actualizar el perfil.");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (event) => {
    setProfileError("");
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setProfileError("La imagen debe ser JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setProfileError("La imagen es demasiado grande. Usa una imagen de menos de 1.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const nextData = { ...editedData, profileImage: reader.result };
      setEditedData(nextData);
      await persistProfile(nextData, "Foto de perfil actualizada correctamente.");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const updatedUser = await persistProfile(editedData, "Perfil actualizado correctamente.");
    if (updatedUser) setEditable(false);
  };

  const handleEventChanged = (updatedEvent) => {
    setCreatedEvents((currentEvents) => currentEvents.map((event) => (event._id === updatedEvent._id ? updatedEvent : event)));
    setJoinedEvents((currentEvents) => {
      const nextEvents = currentEvents.map((event) => (event._id === updatedEvent._id ? updatedEvent : event));
      const isAlreadyListed = nextEvents.some((event) => event._id === updatedEvent._id);
      const shouldBeListed = updatedEvent.participantsList?.includes(users.userName);
      if (shouldBeListed && !isAlreadyListed) return [...nextEvents, updatedEvent];
      return nextEvents.filter((event) => event.participantsList?.includes(users.userName));
    });
  };

  const handleEventRemoved = (eventId) => {
    setCreatedEvents((currentEvents) => currentEvents.filter((event) => event._id !== eventId));
    setJoinedEvents((currentEvents) => currentEvents.filter((event) => event._id !== eventId));
  };

  return (
    <AppShell title="Perfil" subtitle="Gestiona tus datos y revisa tu actividad dentro de la plataforma." actions={<Button startIcon={<EditRoundedIcon />} variant="contained" onClick={() => setEditable(true)}>Editar perfil</Button>}>
      {profileEventsQuery.error && <ErrorState title="No se pudieron cargar tus eventos" message={profileEventsQuery.error.message || "No se pudieron cargar los eventos del perfil."} compact />}
      {profileEventsQuery.isLoading && <LoadingState title="Cargando tus eventos" description="Preparando tus eventos creados y tus participaciones." compact />}
      {profileError && <Alert severity="error">{profileError}</Alert>}
      {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md="auto">
            <Box sx={{ position: "relative", width: 128, height: 128 }}>
              <UserAvatar userName={users.userName} profileImage={editedData.profileImage || users.profileImage || ""} size={128} sx={{ border: "1px solid", borderColor: "divider" }} />
              <Tooltip title="Editar foto">
                <IconButton color="primary" onClick={() => inputRef.current?.click()} disabled={isSaving} sx={{ position: "absolute", right: 0, bottom: 0, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", "&:hover": { bgcolor: "background.paper" } }}>
                  <PhotoCameraRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} style={{ display: "none" }} />
            </Box>
          </Grid>
          <Grid item xs={12} md>
            <Stack spacing={1}>
              <Typography variant="h4">{[users.firstName, users.lastName].filter(Boolean).join(" ") || users.userName || "Usuario"}</Typography>
              <Typography color="text.secondary">{users.email || "Email sin completar"}</Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                {profileFields.map(([field, label]) => (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body1">{field === "birthdate" ? formatDate(users.birthdate) : users[field] || "Sin completar"}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={6}>
          <EventsPanel title="Eventos creados" emptyText="Aun no has creado ningun evento." events={createdEvents} onChanged={handleEventChanged} onRemoved={handleEventRemoved} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <EventsPanel title="Mis eventos" emptyText="No te has unido a ningun evento." events={joinedEvents} onChanged={handleEventChanged} onRemoved={handleEventRemoved} />
        </Grid>
      </Grid>

      <Dialog open={editable} onClose={() => setEditable(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar datos personales</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Nombre" name="firstName" value={editedData.firstName || ""} onChange={handleChange} />
            <TextField label="Apellidos" name="lastName" value={editedData.lastName || ""} onChange={handleChange} />
            <TextField label="Ciudad" name="city" value={editedData.city || ""} onChange={handleChange} />
            <TextField label="Email" name="email" type="email" value={editedData.email || ""} onChange={handleChange} />
            <TextField label="Fecha de nacimiento" name="birthdate" type="date" value={editedData.birthdate || ""} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditable(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={isSaving}>{isSaving ? "Guardando..." : "Guardar"}</Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
