import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState, ErrorState, LoadingState } from "../components/FeedbackState";
import { UserAvatar } from "../components/UserAvatar";
import { useUser } from "../context/userContext";
import {
  useCancelEventMutation,
  useDeleteEventMutation,
  useDismissEventMutation,
  useEvent,
} from "../hooks/useEvents";
import {
  EVENT_STATUS,
  canEditEventDate,
  getEventStatusColor,
  getEventStatusLabel,
} from "../utils/eventStatus";

const DETAIL_CONFIRM_ACTIONS = {
  CANCEL_EVENT: "cancel-event",
  DISMISS_EVENT: "dismiss-event",
  DELETE_EVENT: "delete-event",
};

const confirmDialogConfig = {
  [DETAIL_CONFIRM_ACTIONS.CANCEL_EVENT]: {
    title: "Cancelar evento",
    description: "El evento dejara de aparecer en la busqueda publica y quedara bloqueado para sus participantes.",
    confirmLabel: "Cancelar evento",
    severity: "warning",
  },
  [DETAIL_CONFIRM_ACTIONS.DISMISS_EVENT]: {
    title: "Borrar de mi perfil",
    description: "El evento desaparecera de tu perfil, pero seguira disponible para otros usuarios vinculados.",
    confirmLabel: "Borrar de mi perfil",
    severity: "info",
  },
  [DETAIL_CONFIRM_ACTIONS.DELETE_EVENT]: {
    title: "Eliminar evento globalmente",
    description: "Esta accion eliminara el evento para todos los usuarios. No se podra deshacer.",
    confirmLabel: "Eliminar globalmente",
    severity: "error",
  },
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function safeLocationHref(location) {
  if (!location) return null;
  if (location.startsWith("http://") || location.startsWith("https://")) return location;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}

function getStatusMessage(status) {
  if (status === EVENT_STATUS.FULL) return "Este evento esta completo. El detalle sigue disponible, pero no admite nuevas inscripciones.";
  if (status === EVENT_STATUS.CANCELLED) return "Este evento ha sido cancelado. Solo permanece visible para el creador y usuarios vinculados que no lo hayan borrado de su perfil.";
  if (status === EVENT_STATUS.PAST) return "Este evento ya ha pasado. El creador puede cambiar la fecha para reactivarlo.";
  return "Evento abierto y disponible para inscripciones.";
}

function findParticipantProfile(event, userName) {
  return event.participantsProfiles?.find((profile) => profile.userName === userName) || { userName, profileImage: "" };
}

function InfoTile({ icon, label, children }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: "100%", bgcolor: "background.paper" }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: "14px", bgcolor: "primary.soft", color: "primary.main", flexShrink: 0 }}>
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{label}</Typography>
          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.25 }}>{children}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function CardDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { users } = useUser();
  const eventQuery = useEvent(eventId);
  const cancelEventMutation = useCancelEventMutation(eventId);
  const dismissEventMutation = useDismissEventMutation(eventId);
  const deleteEventMutation = useDeleteEventMutation(eventId);
  const [actionError, setActionError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const runConfirmedAction = async () => {
    setActionError("");
    try {
      if (confirmAction === DETAIL_CONFIRM_ACTIONS.CANCEL_EVENT) await cancelEventMutation.mutateAsync();
      if (confirmAction === DETAIL_CONFIRM_ACTIONS.DISMISS_EVENT) {
        await dismissEventMutation.mutateAsync();
        navigate("/profile", { replace: true });
      }
      if (confirmAction === DETAIL_CONFIRM_ACTIONS.DELETE_EVENT) {
        await deleteEventMutation.mutateAsync();
        navigate("/profile", { replace: true });
      }
      setConfirmAction(null);
    } catch (error) {
      const fallbackMessage = {
        [DETAIL_CONFIRM_ACTIONS.CANCEL_EVENT]: "No se pudo cancelar el evento.",
        [DETAIL_CONFIRM_ACTIONS.DISMISS_EVENT]: "No se pudo borrar el evento de tu perfil.",
        [DETAIL_CONFIRM_ACTIONS.DELETE_EVENT]: "No se pudo eliminar el evento.",
      }[confirmAction];
      setActionError(error.message || fallbackMessage);
    }
  };

  if (!eventId) {
    return (
      <AppShell title="Detalle de evento" maxWidth="md">
        <ErrorState title="No se pudo cargar el evento" message="No se ha indicado ningun evento." actionLabel="Volver a eventos" onAction={() => navigate("/events")} />
      </AppShell>
    );
  }

  if (eventQuery.isLoading) {
    return (
      <AppShell title="Detalle de evento" maxWidth="md">
        <LoadingState title="Cargando evento" description="Estamos recuperando los datos actualizados del evento." />
      </AppShell>
    );
  }

  if (eventQuery.error) {
    return (
      <AppShell title="Detalle de evento" maxWidth="md">
        <ErrorState title="No se pudo cargar el evento" message={eventQuery.error.message || "No se pudo cargar el evento."} actionLabel="Volver a eventos" onAction={() => navigate("/events")} />
      </AppShell>
    );
  }

  const eventData = eventQuery.data?.event;

  if (!eventData) {
    return (
      <AppShell title="Detalle de evento" maxWidth="md">
        <EmptyState title="Evento no encontrado" description="El evento no existe, fue eliminado o ya no esta disponible para tu usuario." action={<Button variant="outlined" onClick={() => navigate("/events")}>Volver a eventos</Button>} />
      </AppShell>
    );
  }

  const participants = eventData.participantsList || [];
  const creatorProfile = eventData.creatorProfile || { userName: eventData.creator, profileImage: "" };
  const locationHref = safeLocationHref(eventData.location);
  const isCreator = eventData.creator === users.userName;
  const status = eventData.status || EVENT_STATUS.OPEN;
  const isActiveLifecycle = status === EVENT_STATUS.OPEN || status === EVENT_STATUS.FULL;
  const canManageActiveEvent = isCreator && isActiveLifecycle;
  const canEdit = isCreator && status !== EVENT_STATUS.CANCELLED;
  const canEditDate = canEditEventDate(eventData, isCreator);
  const activeConfirmConfig = confirmAction ? confirmDialogConfig[confirmAction] : null;
  const isConfirming = cancelEventMutation.isPending || dismissEventMutation.isPending || deleteEventMutation.isPending;

  return (
    <>
      <AppShell
        title={eventData.name}
        subtitle={eventData.description}
        maxWidth="lg"
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            {canEdit && <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => navigate(`/events/${eventId}/edit`)}>{canEditDate ? "Cambiar fecha" : "Editar"}</Button>}
            <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate("/events")}>Volver</Button>
          </Stack>
        }
      >
        {actionError && <Alert severity="error">{actionError}</Alert>}

        <Paper sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
          <Box sx={{ height: 8, bgcolor: status === EVENT_STATUS.OPEN ? "primary.main" : "divider" }} />
          <Box sx={{ p: { xs: 2.25, md: 3 } }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip label={eventData.sport} color="primary" />
                <Chip label={getEventStatusLabel(status)} color={getEventStatusColor(status)} variant={status === EVENT_STATUS.OPEN ? "filled" : "outlined"} />
                <Chip label={eventData.city} variant="outlined" />
                <Chip icon={<PeopleAltOutlinedIcon />} label={`${participants.length}/${eventData.participants} plazas`} color={status === EVENT_STATUS.OPEN ? "secondary" : "default"} variant="outlined" />
              </Stack>

              <Alert severity={status === EVENT_STATUS.OPEN ? "success" : "info"}>{getStatusMessage(status)}</Alert>

              <Grid container disableEqualOverflow columnSpacing={2.5} rowSpacing={2.5}>
                <Grid item xs={12} md={4}>
                  <InfoTile icon={<AccessTimeOutlinedIcon />} label="Fecha">{formatDate(eventData.date)}</InfoTile>
                </Grid>
                <Grid item xs={12} md={4}>
                  <InfoTile icon={<LocationOnOutlinedIcon />} label="Ubicacion">
                    {locationHref ? <MuiLink href={locationHref} target="_blank" rel="noopener">{eventData.locationName || eventData.location}</MuiLink> : (eventData.locationName || "Ubicacion no indicada")}
                  </InfoTile>
                </Grid>
                <Grid item xs={12} md={4}>
                  <InfoTile icon={<PeopleAltOutlinedIcon />} label="Plazas">{participants.length} apuntados de {eventData.participants}</InfoTile>
                </Grid>
              </Grid>

              <Grid container disableEqualOverflow columnSpacing={3} rowSpacing={3}>
                <Grid item xs={12} md={5}>
                  <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
                    <Stack spacing={2}>
                      <Typography variant="h5">Organizador</Typography>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <UserAvatar userName={creatorProfile.userName} profileImage={creatorProfile.profileImage} size={56} />
                        <Box>
                          <Typography variant="h6">{eventData.creator || "Usuario desconocido"}</Typography>
                          <Typography variant="body2" color="text.secondary">Creador del evento</Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={7}>
                  <Paper variant="outlined" sx={{ p: 2.5, height: "100%" }}>
                    <Stack spacing={2}>
                      <Typography variant="h5">Participantes</Typography>
                      <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap", gap: 1 }}>
                        {participants.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">Todavia no hay participantes.</Typography>
                        ) : (
                          participants.map((participant) => {
                            const participantProfile = findParticipantProfile(eventData, participant);
                            return <Chip key={participant} avatar={<UserAvatar userName={participantProfile.userName} profileImage={participantProfile.profileImage} />} label={participant} variant="outlined" />;
                          })
                        )}
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
                {canManageActiveEvent && <Button variant="outlined" color="warning" startIcon={<CancelOutlinedIcon />} onClick={() => setConfirmAction(DETAIL_CONFIRM_ACTIONS.CANCEL_EVENT)}>Cancelar evento</Button>}
                {(status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.PAST) && <Button variant="outlined" startIcon={<VisibilityOffOutlinedIcon />} onClick={() => setConfirmAction(DETAIL_CONFIRM_ACTIONS.DISMISS_EVENT)}>Borrar de mi perfil</Button>}
                {canManageActiveEvent && <Button variant="outlined" color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => setConfirmAction(DETAIL_CONFIRM_ACTIONS.DELETE_EVENT)}>Eliminar globalmente</Button>}
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </AppShell>
      {activeConfirmConfig && (
        <ConfirmDialog open={Boolean(activeConfirmConfig)} title={activeConfirmConfig.title} description={activeConfirmConfig.description} confirmLabel={activeConfirmConfig.confirmLabel} severity={activeConfirmConfig.severity} isConfirming={isConfirming} onCancel={() => setConfirmAction(null)} onConfirm={runConfirmedAction} />
      )}
    </>
  );
}

export default CardDetails;
