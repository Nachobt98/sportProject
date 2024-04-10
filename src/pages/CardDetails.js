import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Typography,
  Grid,
  Container,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import img8 from "../img/img8.jpg";
import { useEventContext } from "../context/eventContext";
const useStyles = makeStyles((theme) => ({
  grid: {
    backgroundImage: `url(${img8})`,
    backgroundSize: "cover",
    height: "2300px",
  },
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: "2300px",
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
  // Agrega más clases de estilo según sea necesario para CardDetails
}));
function CardDetails() {
  const classes = useStyles();
  const { eventData } = useEventContext();

  return (
    <>
      <Grid className={classes.grid}>
        <Container
          className={classes.root}
          maxWidth="md"
          sx={{ marginTop: "40px" }}
        >
          <Typography variant="h2"> {eventData.name}</Typography>
          <DialogTitle>{eventData.city}</DialogTitle>
          <DialogContent>
            <DialogContentText>{eventData.description}</DialogContentText>
            <Typography variant="body2">Fecha: {eventData.date}</Typography>
            <Typography variant="body2">
              Participantes:{eventData.participants}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={console.log("cerrrar")}>Cerrar</Button>
          </DialogActions>
        </Container>
      </Grid>
    </>
  );
}

export default CardDetails;
