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
import { cancelEvent, cancelEventJoin, deleteEvent, dismissEvent, joinEvent } from "../api/eventsApi";
import { ConfirmDialog } from "./ConfirmDialog";
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
  status: PropTypes.oneOf(Object.values(EVENT_STATUS)),
  canJoin: PropTypes.bool,
  isLocked: PropTypes.bool,
  participants: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  participantsList: PropTypes.arrayOf(PropTypes.string),
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
  if (status === EVENT_STATUS.FULL) {
    return "Evento completo. Puedes consultar el detalle, pero no quedan plazas.";
  }
  if (status === EVENT_STATUS.CANCELLED) {
    return "Evento cancelado. Las acciones de participacion estan bloqueadas.";
  }
  if (status === EVENT_STATUS.PAST) {
    return "Evento pasado. No acepta nuevas inscripciones.";
  }
  return "";
}

export function CardEvent({ event, onChanged, onRemoved }) {
  const { users } = useUser();
  const navigate = useNavigate();
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  const participants = useMemo(
    () => currentEvent.participantsList || [],
    [currentEvent.participantsList]
  );
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

  useEffect(() => {
    setIsUserJoined(participants.includes(users.userName));
  }, [participants, users.userName]);

  const handleInfoClick = () => {
    navigate(`/events/${currentEvent._id}`);
  };

  const handleEditClick = () => {
    navigate(`/events/${currentEvent._id}/edit`);
  };

  const runConfirmedAction = async () => {
    setIsConfirming(true);
    try {
      if (confirmAction === CONFIRM_ACTIONS.DELETE_EVENT) {
        await deleteEvent(currentEvent._id);
        onRemoved?.(currentEvent._id);
        setFeedback({ severity: "success", message: "Evento eliminado" });
      }

      if (confirmAction === CONFIRM_ACTIONS.CANCEL_EVENT) {
        const data = await cancelEvent(currentEvent._id);
        setCurrentEvent(data.event);
        onChanged?.(data.event);
        setFeedback({ severity: "success", message: "Evento cancelado" });
      }

      if (confirmAction === CONFIRM_ACTIONS.DISMISS_EVENT) {
        await dismissEvent(currentEvent._id);
        onRemoved?.(currentEvent._id);
        setFeedback({ severity: "success", message: "Evento borrado de tu perfil" });
      }

      if (confirmAction === CONFIRM_ACTIONS.CANCEL_PARTICIPATION) {
        const data = await cancelEventJoin(currentEvent._id);
        setCurrentEvent(data.event);
        setIsUserJoined(false);
        onChanged?.(data.event);
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
    } finally {
      setIsConfirming(false);
    }
  };

  const handleJoinClick = async () => {
    try {
      const data = await joinEvent(currentEvent._id);
      setCurrentEvent(data.event);
      setIsUserJoined(true);
      onChanged?.(data.event);
    } catch (error) {
      setFeedback({ severity: "error", message: error.message || "No se pudo conectar con el servidor" });
    }
  };

  return (
    <>
      <Card
        sx={{
          border: "1px solid",
          borderColor: locked ? "divider" : "primary.light",
          opacity: status === EVENT_STATUS.CANCELLED ? 0.78 : 1,
          transition: "border-color 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            borderColor: locked ? "text.disabled" : "primary.light",
            boxShadow: "0 12px 32px rgba(15, 23, 42, 0.1)",
          },
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              justifyContent="space-between"
            >
              <Box>
                <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
                  <Chip label={currentEvent.sport} size="small" color="primary" />
                  <Chip
                    label={getEventStatusLabel(status)}
                    size="small"
                    color={getEventStatusColor(status)}
                    variant={status === EVENT_STATUS.OPEN ? "filled" : "outlined"}
                  />
                  <Chip
                    label={`${participants.length}/${currentEvent.participants} plazas`}
                    size="small"
                    color={availableSlots > 0 && status === EVENT_STATUS.OPEN ? "secondary" : "default"}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="h5" color="text.primary">
                  {currentEvent.name}
                </Typography>
              </Box>

              <Stack
                spacing={0.75}
                sx={{ color: "text.secondary", minWidth: { sm: 190 } }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <AccessTimeOutlinedIcon fontSize="small" />
                  <Typography variant="body2">{formatDate(currentEvent.date)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlaceOutlinedIcon fontSize="small" />
                  <Typography variant="body2">{currentEvent.city}</Typography>
                </Stack>
              </Stack>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              {currentEvent.description}
            </Typography>

            {lockedMessage && <Alert severity={status === EVENT_STATUS.FULL ? "warning" : "info"}>{lockedMessage}</Alert>}
          </Stack>
        </CardContent>

        <CardActions
          sx={{
            px: 2.5,
            pb: 2.5,
            pt: 0,
            justifyContent: "space-between",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button startIcon={<InfoOutlinedIcon />} onClick={handleInfoClick}>
            Detalle
          </Button>

          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
            {!isCreator && !isUserJoined && (
              <Button
                variant="contained"
                startIcon={<LoginOutlinedIcon />}
                onClick={handleJoinClick}
                disabled={!canJoin}
              >
                Unirse
              </Button>
            )}

            {!isCreator && isUserJoined && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<LogoutOutlinedIcon />}
                onClick={() => setConfirmAction(CONFIRM_ACTIONS.CANCEL_PARTICIPATION)}
                disabled={!canCancelParticipation}
              >
                Cancelar participacion
              </Button>
            )}

            {canManageActiveEvent && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<CancelOutlinedIcon />}
                onClick={() => setConfirmAction(CONFIRM_ACTIONS.CANCEL_EVENT)}
              >
                Cancelar evento
              </Button>
            )}

            {canEditDate && (
              <Button
                variant="outlined"
                startIcon={<EditCalendarOutlinedIcon />}
                onClick={handleEditClick}
              >
                Cambiar fecha
              </Button>
            )}

            {(status === EVENT_STATUS.CANCELLED || status === EVENT_STATUS.PAST) && (
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<VisibilityOffOutlinedIcon />}
                onClick={() => setConfirmAction(CONFIRM_ACTIONS.DISMISS_EVENT)}
              >
                Borrar de mi perfil
              </Button>
            )}

            {canManageActiveEvent && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineOutlinedIcon />}
                onClick={() => setConfirmAction(CONFIRM_ACTIONS.DELETE_EVENT)}
              >
                Eliminar globalmente
              </Button>
            )}
          </Stack>
        </CardActions>
        <Snackbar
          open={Boolean(feedback)}
          autoHideDuration={3500}
          onClose={() => setFeedback(null)}
          message={feedback?.message}
        />
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
