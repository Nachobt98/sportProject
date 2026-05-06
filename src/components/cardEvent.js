import React, { useState } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../context/eventContext";
import { makeStyles } from "@mui/styles";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useEffect } from "react";
import { useUser } from "../context/userContext";
import { apiFetch } from "../api/client";
const useStyles = makeStyles((theme) => ({
  eventCard: {
    marginBottom: theme.spacing(3),
    backgroundColor: "rgb(245, 245, 245, 0.8)",
    border: "3px solid",
    borderRadius: "15px",
    borderColor: "#c59c00",
  },
}));
export function CardEvent({ event }) {
  const { users, updateUserData } = useUser();
  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);
    let formattedDate = date.toLocaleDateString("es-ES", options);

    // Capitalizar primera letra de weekday y month
    const words = formattedDate.split(" ");
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1); // Capitalizar primera letra de weekday
    words[3] = words[3].charAt(0).toUpperCase() + words[3].slice(1); // Capitalizar primera letra de month
    formattedDate = words.join(" ");

    return formattedDate;
  };
  const classes = useStyles();
  const { setEvent } = useEventContext();
  const navigate = useNavigate();
  const handleInfoClick = (event) => {
    setEvent(event);
    navigate("/cardDetails");
  };
  const handleDeleteClick = async (eventId) => {
    try {
      const response = await apiFetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        console.log("Evento eliminado exitosamente");
      } else {
        console.error("Error al eliminar el evento:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
    }
  };
  const handleJoinClick = async (eventId) => {
    try {
      const response = await apiFetch(`/api/events/${eventId}/join`, {
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
        console.error(
          "Error al unir al usuario al evento:",
          response.statusText
        );
      }

      // Aquí puedes realizar alguna acción adicional si es necesario, como actualizar la lista de eventos.
    } catch (error) {
      console.error("Error al unir al usuario al evento:", error);
    }
  };

  const handleCancelClick = async (eventId) => {
    try {
      const response = await apiFetch(
        `/api/events/${eventId}/join/${users.userName}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setIsUserJoined(false);
      } else {
        console.error(
          "Error al cancelar la participacion en el evento:",
          response.statusText
        );
      }

    } catch (error) {
      console.error(
        "Error al eliminar el evento o al usuario del evento:",
        error
      );
    }
  };

  const isCreator = event.creator === users.userName;

  const [isUserJoined, setIsUserJoined] = useState(false);

  useEffect(() => {
    setIsUserJoined((event.participantsList || []).includes(users.userName));
  }, [event.participantsList, users.userName]);
  return (
    <Card key={event.id} className={classes.eventCard}>
      <Grid
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <CardHeader title={event.sport} subheader={event.city} />
        <Grid
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginRight: "30px",
            gap: "10px",
          }}
        >
          <AccessTimeOutlinedIcon />
          {formatDate(event.date)}
        </Grid>
      </Grid>

      <CardContent>
        <Typography variant="h5" sx={{ color: "black" }}>
          {event.name}
        </Typography>
        <Typography variant="body1" sx={{ color: "black" }}>
          {event.description}
        </Typography>
      </CardContent>
      <CardActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginRight: "10px",
          marginLeft: "10px",
        }}
      >
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleInfoClick(event)}
        >
          INFO
        </Button>
        {!isCreator && !isUserJoined && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleJoinClick(event._id)}
          >
            UNIRSE
          </Button>
        )}

        {!isCreator && isUserJoined && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleCancelClick(event._id)}
          >
            CANCELAR EVENTO
          </Button>
        )}

        {isCreator && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDeleteClick(event._id)}
          >
            DELETE
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
