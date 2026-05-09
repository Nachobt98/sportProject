import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditCalendarOutlinedIcon from "@mui/icons-material/EditCalendarOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import {
  useCancelEventJoinMutation,
  useCancelEventMutation,
  useDeleteEventMutation,
  useDismissEventMutation,
  useJoinEventMutation,
} from "../hooks/useEvents";
import { ConfirmDialog } from "./ConfirmDialog";
import { UserAvatar } from "./UserAvatar";
import {
  EVENT_STATUS,
  canEditEventDate,
  canJoinEvent,
  getEventStatusColor,
  getEventStatusLabel,
  isLockedEvent,
} from "../utils/eventStatus";

const CONFIRM_ACTIONS = {
  CANCEL_PARTICIPATION: "cancel-participation",
  CANCEL_EVENT: "cancel-event",
  DISMISS_EVENT: "dismiss-event",
  DELETE_EVENT: "delete-event",
};

const userProfilePropType = PropTypes.shape({
  userName: PropTypes.string,
  profileImage: PropTypes.string,
});

const confirmDialogConfig = {
  [CONFIRM_ACTIONS.CANCEL_PARTICIPATION]: {
    title: "Cancelar participacion",
    description: "Dejaras de aparecer como participante de este evento. Si quedan plazas, otra persona podra ocupar tu sitio.",
    confirmLabel: "Cancelar participacion",
    severity: "warning",
  },
  [CONFIRM_ACTIONS.CANCEL_EVENT]: {
    title: "Cancelar evento",
    description: "El evento dejara de aparecer en la busqueda publica y quedara bloqueado para los participantes vinculados.",
    confirmLabel: "Cancelar evento",
    severity: "warning",
  },
  [CONFIRM_ACTIONS.DISMISS_EVENT]: {
    title: "Borrar de mi perfil",
    description: "El evento desaparecera de tu perfil, pero no se eliminara para el resto de usuarios vinculados.",
    confirmLabel: "Borrar de mi perfil",
    severity: "info",
  },
  [CONFIRM_ACTIONS.DELETE_EVENT]: {
    title: "Eliminar evento globalmente",
    description: "Esta accion eliminara el evento para todos los usuarios. No se podra deshacer.",
    confirmLabel: "Eliminar globalmente",
    severity: "error",
  },
};

export const eventPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
  sport: PropTypes.string,
  date: PropTypes.string,
  city: PropTypes.string,
  creator: PropTypes.string,
  creatorProfile: userProfilePropType,
  status: PropTypes.oneOf(Object.values(EVENT_STATUS)),
  canJoin: PropTypes.bool,
  isLocked: PropTypes.bool,
  participants: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  participantsList: PropTypes.arrayOf(PropTypes.string),
  participantsProfiles: PropTypes.arrayOf(userProfilePropType),
});

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getLockedMessage(status) {
  if (status === EVENT_STATUS.FULL) return "Evento completo. Puedes consultar el detalle, pero no quedan plazas.";
  if (status === EVENT_STATUS.CANCELLED) return "Evento cancelado. Las acciones de participacion estan bloqueadas.";
  if (status === EVENT_STATUS.PAST) return "Evento pasado. No acepta nuevas inscripciones.";
  return "";
}

function findParticipantProfile(event, userName) {
  return event.participantsProfiles?.find((profile) => profile.userName === userName) || { userName, profileImage: "" };
}

export function CardEvent({ event, onChanged, onRemoved }) {
  const { users } = useUser();
  const navigate = useNavigate();
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const cancelEventMutation = useCancelEventMutation(currentEvent._id);
  const cancelEventJoinMutation = useCancelEventJoinMutation(currentEvent._id);
  const deleteEventMutation = useDeleteEventMutation(currentEvent._id);
  const dismissEventMutation = useDismissEventMutation(currentEvent._id);
  const joinEventMutation = useJoinEventMutation(currentEvent._id);

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  const participants = useMemo(() => currentEvent.participantsList || [], [currentEvent.participantsList]);
  const creatorProfile = currentEvent.creatorProfile || { userName: currentEvent.creator, profileImage: "" };
  const isCreator = currentEvent.creator === users.userName;
  const availableSlots = Math.max(Number(currentEvent.participants || 0) - participants.length, 0);
  const status = currentEvent.status || EVENT_STATUS.OPEN;
  const locked = isLockedEvent(currentEvent);
  const canJoin = canJoinEvent(currentEvent) && availableSlots > 0;
  const canCancelParticipation = status !== EVENT_STATUS.CANCELLED;
  const canEditDate = canEditEventDate(currentEvent, isCreator);
  const isActiveLifecycle = status === EVENT_STATUS.OPEN || status === EVENT_STATUS.FULL;
  const canManageActiveEvent = isCreator && isActiveLifecycle;
  const lockedMessage = getLockedMessage(status);
  const activeConfirmConfig = confirmAction ? confirmDialogConfig[confirmAction] : null;
  const isConfirming = cancelEventMutation.isPending || cancelEventJoinMutation.isPending || deleteEventMutation.isPending || dismissEventMutation.isPending;

  useEffect(() => {
    setIsUserJoined(participants.includes(users.userName));
  }, [participants, users.userName]);

  const handleInfoClick = () => navigate(`/events/${currentEvent._id}`);
  const handleEditClick = () => navigate(`/events/${currentEvent._id}/edit`);

  const handleUpdatedEvent = (updatedEvent) => {
    setCurrentEvent(updatedEvent);
    onChanged?.(updatedEvent);
  };

  const runConfirmedAction = async () => {
    try {
      if (confirmAction === CONFIRM_ACTIONS.DELETE_EVENT) {
        await deleteEventMutation.mutateAsync();
        onRemoved?.(currentEvent._id);
        setFeedback({ severity: "success", message: "Evento eliminado" });
      }

      if (confirmAction === CONFIRM_ACTIONS.CANCEL_EVENT) {
        const data = await cancelEventMutation.mutateAsync();
        handleUpdatedEvent(data.event);
        setFeedback({ severity: "success", message: "Evento cancelado" });
      }

      if (confirmAction === CONFIRM_ACTIONS.DISMISS_EVENT) {
        await dismissEventMutation.mutateAsync();
        onRemoved?.(currentEvent._id);
        setFeedback({ severity: "success", message: "Evento borrado de tu perfil" });
      }

      if (confirmAction === CONFIRM_ACTIONS.CANCEL_PARTICIPATION) {
        const data = await cancelEventJoinMutation.mutateAsync();
        setIsUserJoined(false);
        handleUpdatedEvent(data.event);
        setFeedback({ severity: "success", message: "Participacion cancelada" });
      }

      setConfirmAction(null);
    } catch (error) {
      const fallbackMessage = {
        [CONFIRM_ACTIONS.DELETE_EVENT]: "No se pudo eliminar el evento",
        [CONFIRM_ACTIONS.CANCEL_EVENT]: "No se pudo cancelar el evento",
        [CONFIRM_ACTIONS.DISMISS_EVENT]: "No se pudo borrar el evento de tu perfil",
        [CONFIRM_ACTIONS.CANCEL_PARTICIPATION]: "No se pudo cancelar la participacion",
      }[confirmAction];
      setFeedback({ severity: "error", message: error.message || fallbackMessage });
    }
  };

  const handleJoinClick = async () => {
    try {
      const data = await joinEventMutation.mutateAsync();
      setIsUserJoined(true);
      handleUpdatedEvent(data.event);
    } catch (error) {
      setFeedback({ severity: "error", message: error.message || "No se pudo conectar con el servidor" });
    }
  };

  return (
    <>
      <Card
        sx={{
          overflow: "hidden",
          borderColor: locked ? "divider" : "primary.light",
          opacity: status === EVENT_STATUS.CANCELLED ? 0.78 : 1,
          transition: "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            transform: "translateY(-2px)",
            borderColor: locked ? "text.disabled" : "primary.light",
            boxShadow: "0 18px 42px rgba(15, 23, 42, 0.12)",
          },
        }}
      >
        <Box sx={{ height: 6, bgcolor: locked ? "divider" : "primary.main" }} />
        <CardContent sx={{ p: { xs: 2, md: 2.75 } }}>
          <Stack spacing={2.25}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between">
              <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <Chip label={currentEvent.sport} size="small" color="primary" />
                  <Chip label={getEventStatusLabel(status)} size="small" color={getEventStatusColor(status)} variant={status === EVENT_STATUS.OPEN ? "filled" : "outlined"} />
                  <Chip label={`${participants.length}/${currentEvent.participants} plazas`} size="small" color={availableSlots > 0 && status === EVENT_STATUS.OPEN ? "secondary" : "default"} variant="outlined" />
                </Stack>
                <Box>
                  <Typography variant="h5" color="text.primary">{currentEvent.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 760 }}>{currentEvent.description}</Typography>
                </Box>
              </Stack>

              <Stack spacing={1} sx={{ color: "text.secondary", minWidth: { md: 220 } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="body2" fontWeight={700}>{formatDate(currentEvent.date)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlaceOutlinedIcon fontSize="small" color="primary" />
                  <Typography variant="body2">{currentEvent.city}</Typography>
                </Stack>
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <UserAvatar userName={creatorProfile.userName} profileImage={creatorProfile.profileImage} size={32} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Creador</Typography>
                  <Typography variant="body2" fontWeight={700}>{currentEvent.creator || "Usuario desconocido"}</Typography>
                </Box>
              </Stack>
              {participants.length > 0 && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: "wrap" }}>
                  {participants.slice(0, 4).map((participant) => {
                    const participantProfile = findParticipantProfile(currentEvent, participant);
                    return <UserAvatar key={participant} userName={participantProfile.userName} profileImage={participantProfile.profileImage} size={26} />;
                  })}
                  {participants.length > 4 && <Typography variant="caption" color="text.secondary">+{participants.length - 4}</Typography>}
                </Stack>
              )}
            </Stack>

            {lockedMessage && <Alert severity={status === EVENT_STATUS.FULL ? "warning" : "info"}>{lockedMessage}</Alert>}
          </Stack>
        </CardContent>

        <CardActions sx={{ px: { xs: 2, md: 2.75 }, pb: { xs: 2, md: 2.75 }, pt: 0, justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
          <Button startIcon={<InfoOutlinedIcon />} onClick={handleInfoClick}>Detalle</Button>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            {!isCreator && !isUserJoined && <Button variant="contained" startIcon={<LoginOutlinedIcon />} onClick={handleJoinClick} disabled={!canJoin || joinEventMutation.isPending}>Unirse</Button>}
            {!isCreator && isUserJoined && <Button variant="outlined" color="secondary" startIcon={<LogoutOutlinedIcon />} onClick={() => setConfirmAction(CONFIRM_ACTIONS.CANCEL_PARTICIPATION)} disabled={!canCancelParticipation || cancelEventJoinMutation.isPending}>Cancelar participacion</Button>}
            {canManageActiveEvent && <Button variant="outlined" color="warning" startIcon={<CancelOutlinedIcon />} onClick={() => setConfirmAction(CONFIRM_ACTIONS.CANCEL_EVENT)} disabled={cancelEventMutation.isPending}>Cancelar evento</Button>}
            {canEditDate && <Button variant="outlined" startIcon={<EditCalendarOutlinedIcon />} onClick={handleEditClick}>Cambiar fecha</Button>}
            {(status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.PAST) && <Button variant="outlined" color="inherit" startIcon={<VisibilityOffOutlinedIcon />} onClick={() => setConfirmAction(CONFIRM_ACTIONS.DISMISS_EVENT)} disabled={dismissEventMutation.isPending}>Borrar de mi perfil</Button>}
            {canManageActiveEvent && <Button variant="outlined" color="error" startIcon={<DeleteOutlineOutlinedIcon />} onClick={() => setConfirmAction(CONFIRM_ACTIONS.DELETE_EVENT)} disabled={deleteEventMutation.isPending}>Eliminar globalmente</Button>}
          </Stack>
        </CardActions>
        <Snackbar open={Boolean(feedback)} autoHideDuration={3500} onClose={() => setFeedback(null)} message={feedback?.message} />
      </Card>
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

CardEvent.propTypes = {
  event: eventPropType.isRequired,
  onChanged: PropTypes.func,
  onRemoved: PropTypes.func,
};
