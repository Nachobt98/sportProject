import React from "react";
import { Button, Typography, Grid, Avatar, Container } from "@mui/material";
import { makeStyles } from "@mui/styles";
import img8 from "../img/img8.jpg";
import { useEventContext } from "../context/eventContext";
import { useNavigate } from "react-router-dom";
import perfil from "../img/pexels-stefan-stefancik-91227.jpg";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
const useStyles = makeStyles((theme) => ({
  grid: {
    backgroundImage: `url(${img8})`,
    backgroundSize: "cover",
    height: "1300px",
  },
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    backgroundColor: "rgb(245, 245, 245, 0.8)",
    border: "3px solid",
    borderRadius: "15px",
    borderColor: "#c59c00",
    marginTop: "100px",
  },
  searchContainer: {
    marginBottom: theme.spacing(3),
  },
  eventCard: {
    marginBottom: theme.spacing(3),
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  noResultsText: {
    textAlign: "center",
    color: "black",
    marginTop: theme.spacing(2),
  },
  optionPointer: {
    cursor: "pointer",
  },
  avatar: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));
function CardDetails() {
  const classes = useStyles();
  const { eventData } = useEventContext();
  const navigate = useNavigate();

  if (!eventData) {
    return (
      <Grid className={classes.grid}>
        <Container className={classes.root} maxWidth="md">
          <Typography variant="h4" sx={{ color: "black", background: "none" }}>
            No hay ningun evento seleccionado.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/searchCard2")}
          >
            Volver a eventos
          </Button>
        </Container>
      </Grid>
    );
  }

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

  return (
    <>
      <Grid className={classes.grid}>
        <Container className={classes.root} maxWidth="xl">
          <Grid>
            <Typography
              variant="h2"
              sx={{ color: "black", background: "none" }}
            >
              {eventData.name}
            </Typography>
            <Grid sx={{ marginLeft: "30px" }}>
              <Typography variant="h5" sx={{ color: "black" }}>
                Evento creado por:
              </Typography>
              <Grid
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "10px",
                  alignItems: "center",
                }}
              >
                <Avatar
                  className={classes.avatar}
                  src={perfil}
                  style={{ backgroundColor: "#bdbdbd" }}
                />
                <Typography variant="h6" sx={{ color: "black" }}>
                  {eventData.creator || "Usuario desconocido"}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            sx={{
              display: "flex",
              justifyContent: "space-around",
              padding: "20px",
            }}
          >
            <Grid
              sx={{
                display: "flex",
                gap: "40px",
                maxWidth: "50%",
                flexDirection: "column",
              }}
            >
              <Grid
                sx={{ display: "flex", flexDirection: "column", gap: "20px" }}
              >
                <strong>Detalles: </strong>
                {eventData.description}
              </Grid>
              <Grid>
                <strong>
                  Participantes({eventData.participantsList?.length || 0}/
                  {eventData.participants})
                </strong>
                <Grid
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "30px",
                  }}
                >
                  {(eventData.participantsList || []).length === 0 ? (
                    <Typography variant="body1" sx={{ color: "black" }}>
                      Todavia no hay participantes.
                    </Typography>
                  ) : (
                    eventData.participantsList.map((participant) => (
                      <Grid
                        key={participant}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Avatar
                          className={classes.avatar}
                          src={perfil}
                          style={{ backgroundColor: "#bdbdbd" }}
                        />
                        <Typography variant="h6" sx={{ color: "black" }}>
                          {participant}
                        </Typography>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Grid>
            </Grid>

            <Grid
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "30px",
              }}
            >
              <Grid
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <AccessTimeOutlinedIcon />
                {formatDate(eventData.date)}
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <LocationOnOutlinedIcon />
                <a
                  href={eventData.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#344b6c", textDecoration: "none" }}
                >
                  {eventData.locationName}
                </a>
              </Grid>
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate(-1)}
          >
            Cerrar
          </Button>
        </Container>
      </Grid>
    </>
  );
}

export default CardDetails;
