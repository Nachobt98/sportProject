import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
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
  if (status === EVENT_STATUS.FULL) {
    return "Este evento esta completo. El detalle sigue disponible, pero no admite nuevas inscripciones.";
  }
  if (status === EVENT_STATUS.CANCELLED) {
    return "Este evento ha sido cancelado. Solo permanece visible para el creador y usuarios vinculados que no lo hayan borrado de su perfil.";
  }
  if (status === EVENT_STATUS.PAST) {
    return "Este evento ya ha pasado. El creador puede cambiar la fecha para reactivarlo.";
  }
  return "Evento abierto y disponible para inscripciones.";
}

function findParticipantProfile(event, userName) {
  return event.participantsProfiles?.find((profile) => profile.userName === userName) || { userName, profileImage: "" };
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
      if (confirmAction === DETAIL_CONFIRM_ACTIONS.CANCEL_EVENT) {
        await cancelEventMutation.mutateAsync();
      }

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
        <EmptyState
          title="Evento no encontrado"
          description="El evento no existe, fue eliminado o ya no esta disponible para tu usuario."
          action={<Button variant="outlined" onClick={() => navigate("/events")}>Volver a eventos</Button>}
        />
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
        maxWidth="md"
        actions={
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            {canEdit && (
              <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => navigate(`/events/${eventId}/edit`)}>
                {canEditDate ? "Cambiar fecha" : "Editar"}
              </Button>
            )}
            {canManageActiveEvent && (
              <Button variant="outlined" color="warning" startIcon={<CancelOutlinedIcon />} onClick={() => setConfirmAction(DETAIL_CONFIRM_ACTIONS.CANCEL_EVENT)}>
                Cancelar evento
              </Button>
            )}
            {(status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.PAST) && (
              <Button variant="outlined" startIcon={<VisibilityOffOutlinedIcon />} onClick={() => setConfirmAction(DETAIL_CONFIRM_ACTIONS.DISMISS_EVENT)}>
                Borrar de mi perfil
              </Button>
            )}
            {canManageActiveEvent && (
              <Button variant="outlined" color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => setConfirmAction(DETAIL_CONFIRM_ACTIONS.DELETE_EVENT)}>
                Eliminar globalmente
              </Button>
            )}
            <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon />} onClick={() => navigate("/events")}>
              Volver
            </Button>
          </Stack>
        }
      >
        {actionError && <Alert severity="error">{actionError}</Alert>}
        <Paper sx={{ p: { xs: 2, md: 3 }, border: "1px solid", borderColor: "divider" }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip label={eventData.sport} color="primary" />
              <Chip label={getEventStatusLabel(status)} color={getEventStatusColor(status)} variant={status === EVENT_STATUS.OPEN ? "filled" : "outlined"} />
              <Chip label={eventData.city} variant="outlined" />
              <Chip icon={<PeopleAltOutlinedIcon />} label={`${participants.length}/${eventData.participants} plazas`} color={status === EVENT_STATUS.OPEN ? "secondary" : "default"} variant="outlined" />
            </Stack>

            <Alert severity={status === EVENT_STATUS.OPEN ? "success" : "info"}>{getStatusMessage(status)}</Alert>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Stack spacing={2} sx={{ flex: 1 }}>
                <Box>
                  <Typography variant="overline" color="text.secondary">Creador</Typography>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
                    <UserAvatar userName={creatorProfile.userName} profileImage={creatorProfile.profileImage} />
                    <Typography variant="h6">{eventData.creator || "Usuario desconocido"}</Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="overline" color="text.secondary">Participantes</Typography>
                  <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: "wrap" }}>
                    {participants.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">Todavia no hay participantes.</Typography>
                    ) : (
                      participants.map((participant) => {
                        const participantProfile = findParticipantProfile(eventData, participant);
                        return (
                          <Chip
                            key={participant}
                            avatar={<UserAvatar userName={participantProfile.userName} profileImage={participantProfile.profileImage} />}
                            label={participant}
                            variant="outlined"
                          />
                        );
                      })
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Stack spacing={2} sx={{ minWidth: { md: 260 }, p: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <AccessTimeOutlinedIcon color="primary" />
                  <Typography variant="body2">{formatDate(eventData.date)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <LocationOnOutlinedIcon color="primary" />
                  {locationHref ? (
                    <MuiLink href={locationHref} target="_blank" rel="noopener">{eventData.locationName || eventData.location}</MuiLink>
                  ) : (
                    <Typography variant="body2">{eventData.locationName || "Ubicacion no indicada"}</Typography>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </AppShell>
      {activeConfirmConfig && (
        <ConfirmDialog
          open={Boolean(activeConfirmConfig)}
          title={activeConfirmConfig.title}
          description={activeConfirmConfig.description}
          confirmLabel={activeConfirmConfig.confirmLabel}
          severity={activeConfirmConfig.severity}
          isConfirming={isConfirming}
          onCancel={() => setConfirmAction(null)}
          onConfirm={runConfirmedAction}
        />
      )}
    </>
  );
}

export default CardDetails;
