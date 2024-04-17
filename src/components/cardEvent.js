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
  const { eventData, setEvent } = useEventContext();
  const navigate = useNavigate();
  const handleInfoClick = (event) => {
    setEvent(event);
    navigate("/cardDetails");
  };
  const handleDeleteClick = async (eventId) => {
    try {
      console.log("id", eventId);
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("Evento eliminado exitosamente");
        // Aquí puedes realizar alguna acción adicional si es necesario, como actualizar la lista de eventos.
      } else {
        console.error("Error al eliminar el evento:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar el evento:", error);
    }
  };
  const handleJoinClick = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/participants/${users.userName}`,
        {
          method: "POST",
        }
      );
      if (response.ok) {
        console.log("Usuario unido al evento exitosamente");
      } else {
        console.error(
          "Error al unir al usuario al evento:",
          response.statusText
        );
      }
      const res = await fetch(
        `http://localhost:5000/api/user/${users.userName}/joinEvent/${eventId}`,
        {
          method: "POST",
        }
      );
      if (res.ok) {
        console.log("Usuario unido al evento exitosamente");
        updateUserData({});
        return;
      } else {
        console.error(
          "Error al actualizar la lista de participantes del evento:",
          res.statusText
        );
      }

      // Aquí puedes realizar alguna acción adicional si es necesario, como actualizar la lista de eventos.
    } catch (error) {
      console.error("Error al unir al usuario al evento:", error);
    }
  };

  const handleCancelClick = async (eventId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${eventId}/participants/${users.userName}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        console.log("Usuario eliminado del evento exitosamente");
        setIsUserJoined(false); // Actualizar el estado para reflejar que el usuario ya no está unido al evento
      } else {
        console.error(
          "Error al cancelar la participación del usuario en el evento:",
          response.statusText
        );
      }
    } catch (error) {
      console.error(
        "Error al cancelar la participación del usuario en el evento:",
        error
      );
    }
  };

  const isCreator = event.creator === users.userName;

  const [isUserJoined, setIsUserJoined] = useState(false);

  useEffect(() => {
    setIsUserJoined(event.participantsList.includes(users.userName));
  }, []);
  console.log("verdad?", isUserJoined);
  console.log(event.participantsList);
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
