import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import {
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
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { cancelEventJoin, deleteEvent, joinEvent } from "../api/eventsApi";

export const eventPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string,
  description: PropTypes.string,
  sport: PropTypes.string,
  date: PropTypes.string,
  city: PropTypes.string,
  creator: PropTypes.string,
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

export function CardEvent({ event, onChanged, onRemoved }) {
  const { users } = useUser();
  const navigate = useNavigate();
  const [currentEvent, setCurrentEvent] = useState(event);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setCurrentEvent(event);
  }, [event]);

  const participants = useMemo(
    () => currentEvent.participantsList || [],
    [currentEvent.participantsList]
  );
  const isCreator = currentEvent.creator === users.userName;
  const availableSlots = Math.max(Number(currentEvent.participants || 0) - participants.length, 0);

  useEffect(() => {
    setIsUserJoined(participants.includes(users.userName));
  }, [participants, users.userName]);

  const handleInfoClick = () => {
    navigate(`/events/${currentEvent._id}`);
  };

  const handleDeleteClick = async () => {
    try {
      await deleteEvent(currentEvent._id);
      onRemoved?.(currentEvent._id);
      setFeedback({ severity: "success", message: "Evento eliminado" });
    } catch (error) {
      setFeedback({ severity: "error", message: error.message || "No se pudo conectar con el servidor" });
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

  const handleCancelClick = async () => {
    try {
      const data = await cancelEventJoin(currentEvent._id);
      setCurrentEvent(data.event);
      setIsUserJoined(false);
      onChanged?.(data.event);
    } catch (error) {
      setFeedback({ severity: "error", message: error.message || "No se pudo conectar con el servidor" });
    }
  };

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        transition: "border-color 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          borderColor: "primary.light",
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
                  label={`${participants.length}/${currentEvent.participants} plazas`}
                  size="small"
                  color={availableSlots > 0 ? "secondary" : "default"}
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

        {!isCreator && !isUserJoined && (
          <Button
            variant="contained"
            startIcon={<LoginOutlinedIcon />}
            onClick={handleJoinClick}
            disabled={availableSlots === 0}
          >
            Unirse
          </Button>
        )}

        {!isCreator && isUserJoined && (
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<LogoutOutlinedIcon />}
            onClick={handleCancelClick}
          >
            Cancelar
          </Button>
        )}

        {isCreator && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineOutlinedIcon />}
            onClick={handleDeleteClick}
          >
            Eliminar
          </Button>
        )}
      </CardActions>
      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={3500}
        onClose={() => setFeedback(null)}
        message={feedback?.message}
      />
    </Card>
  );
}

CardEvent.propTypes = {
  event: eventPropType.isRequired,
  onChanged: PropTypes.func,
  onRemoved: PropTypes.func,
};
