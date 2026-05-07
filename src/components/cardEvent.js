import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
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
import { useEventContext } from "../context/eventContext";
import { useUser } from "../context/userContext";
import { apiFetch } from "../api/client";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CardEvent({ event }) {
  const { users, updateUserData } = useUser();
  const { setEvent } = useEventContext();
  const navigate = useNavigate();
  const [isUserJoined, setIsUserJoined] = useState(false);

  const participants = useMemo(
    () => event.participantsList || [],
    [event.participantsList]
  );
  const isCreator = event.creator === users.userName;
  const availableSlots = Math.max(Number(event.participants || 0) - participants.length, 0);

  useEffect(() => {
    setIsUserJoined(participants.includes(users.userName));
  }, [participants, users.userName]);

  const handleInfoClick = () => {
    setEvent(event);
    navigate("/cardDetails");
  };

  const handleDeleteClick = async () => {
    try {
      const response = await apiFetch(`/api/events/${event._id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        console.error("Error al eliminar el evento:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
    }
  };

  const handleJoinClick = async () => {
    try {
      const response = await apiFetch(`/api/events/${event._id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName: users.userName }),
      });
      if (response.ok) {
        setIsUserJoined(true);
        updateUserData({});
      } else {
        console.error("Error al unirse al evento:", response.statusText);
      }
    } catch (error) {
      console.error("Error al unirse al evento:", error);
    }
  };

  const handleCancelClick = async () => {
    try {
      const response = await apiFetch(
        `/api/events/${event._id}/join/${users.userName}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setIsUserJoined(false);
      } else {
        console.error("Error al cancelar la participacion:", response.statusText);
      }
    } catch (error) {
      console.error("Error al cancelar la participacion:", error);
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
                <Chip label={event.sport} size="small" color="primary" />
                <Chip
                  label={`${participants.length}/${event.participants} plazas`}
                  size="small"
                  color={availableSlots > 0 ? "secondary" : "default"}
                  variant="outlined"
                />
              </Stack>
              <Typography variant="h5" color="text.primary">
                {event.name}
              </Typography>
            </Box>

            <Stack
              spacing={0.75}
              sx={{ color: "text.secondary", minWidth: { sm: 190 } }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeOutlinedIcon fontSize="small" />
                <Typography variant="body2">{formatDate(event.date)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PlaceOutlinedIcon fontSize="small" />
                <Typography variant="body2">{event.city}</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {event.description}
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
    </Card>
  );
}
