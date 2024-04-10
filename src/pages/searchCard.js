import React, { useState } from "react";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import img8 from "../img/img8.jpg";
import "../styles/styles.css";
const cities = [
  "Madrid",
  "Barcelona",
  "Valencia",
  "Sevilla",
  "Zaragoza",
  "Málaga",
  "Murcia",
  "Palma",
  "Las Palmas",
  "Bilbao",
];
const sports = [
  "Fútbol",
  "Baloncesto",
  "Tenis",
  "Atletismo",
  "Natación",
  "Ciclismo",
  "Voleibol",
  "Golf",
  "Balonmano",
  "Pádel",
];

const eventsData = [
  {
    id: 1,
    city: "Madrid",
    description: "Partido amistoso de fútbol",
    sport: "Fútbol",
  },
  {
    id: 2,
    city: "Barcelona",
    description: "Torneo de Tenis",
    sport: "Tenis",
  },
  {
    id: 3,
    city: "Valencia",
    description: "Torneo de Fútbol",
    sport: "Fútbol",
  },
  {
    id: 4,
    city: "Barcelona",
    description: "Torneo de Golf",
    sport: "Golf",
  },
  {
    id: 5,
    city: "Barcelona",
    description: "Torneo de baloncesto",
    sport: "Baloncesto",
  },
  {
    id: 6,
    city: "Valencia",
    description: "Torneo de baloncesto",
    sport: "Baloncesto",
  },
  {
    id: 7,
    city: "Las Palmas",
    description: "Torneo de Pádel",
    sport: "Pádel",
  },
  {
    id: 8,
    city: "Barcelona",
    description: "Torneo de baloncesto",
    sport: "Baloncesto",
  },
  {
    id: 9,
    city: "Las Palmas",
    description: "Torneo de baloncesto",
    sport: "Baloncesto",
  },
  {
    id: 10,
    city: "Málaga",
    description: "Torneo de Pádel",
    sport: "Pádel",
  },
];

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
  dialog: {
    color: "black",
  },
}));

export function SearchCard() {
  const classes = useStyles();
  const [searchCriteria, setSearchCriteria] = React.useState({
    city: "",
    sport: "",
    date: "",
  });
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [maxParticipants, setMaxParticipants] = useState(5); // Número máximo de participantes
  const [isFull, setIsFull] = useState(false); // Bandera para verificar si se ha alcanzado el límite de participantes
  const [events, setEvents] = React.useState(eventsData);
  const [filteredEvents, setFilteredEvents] = React.useState(events); // Inicializar con todos los eventos
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    // Filtrar eventos cuando cambien los criterios de búsqueda
    if (isSearching) {
      const filtered = eventsData.filter((event) => {
        return (
          (!searchCriteria.city ||
            event.city.toLowerCase() === searchCriteria.city.toLowerCase()) &&
          (!searchCriteria.sport ||
            event.sport.toLowerCase() === searchCriteria.sport.toLowerCase()) &&
          (!searchCriteria.date || /* Lógica de comparación de fechas */ true) // Implementa la lógica de comparación de fechas
        );
      });

      setFilteredEvents(filtered);
      setIsSearching(false); // Restablecer la bandera después de la búsqueda
    }
  }, [events, searchCriteria, isSearching]);

  const handleSearch = () => {
    // Actualizar la lista de eventos simulados
    setEvents(eventsData);
    setIsSearching(true); // Establecer la bandera de búsqueda al iniciar la búsqueda
  };
  const handleDialogOpen = (event) => {
    setSelectedEvent(event);
    setOpenDialog(true);
    // Verifica si participants es undefined y, de ser así, inicialízalo como un array vacío
    setParticipants(event.participants || []);
    setIsFull((event.participants || []).length >= maxParticipants);
  };
  const handleSignUp = () => {
    // Aquí podrías implementar la lógica para registrar al usuario en el evento
    // Actualiza la lista de participantes y verifica si se ha alcanzado el límite máximo
    setParticipants([...participants, "Nachobt98"]);
    setIsFull(participants.length + 1 >= maxParticipants);
  };
  return (
    <Grid className={classes.grid}>
      <Container
        className={classes.root}
        maxWidth="md"
        sx={{ marginTop: "40px" }}
      >
        <Typography variant="h2" color="secondary" align="center" gutterBottom>
          Buscar Eventos
        </Typography>

        <Grid container spacing={2} className={classes.searchContainer}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Ciudad"
              variant="outlined"
              select
              value={searchCriteria.city}
              onChange={(e) =>
                setSearchCriteria({ ...searchCriteria, city: e.target.value })
              }
              InputLabelProps={{ shrink: true, style: { color: "#FFD700" } }}
              InputProps={{
                style: { color: "#FFD700" },
              }}
              className={classes.optionPointer}
            >
              {cities.map((city) => (
                <MenuItem key={city} value={city}>
                  {city}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Deporte"
              variant="outlined"
              select
              value={searchCriteria.sport}
              onChange={(e) =>
                setSearchCriteria({ ...searchCriteria, sport: e.target.value })
              }
              InputLabelProps={{ shrink: true, style: { color: "#FFD700" } }}
              InputProps={{
                style: { color: "#FFD700" },
              }}
              className={classes.optionPointer}
            >
              {sports.map((sport) => (
                <MenuItem key={sport} value={sport}>
                  {sport}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Fecha"
              type="date"
              variant="outlined"
              value={searchCriteria.date}
              onChange={(e) =>
                setSearchCriteria({ ...searchCriteria, date: e.target.value })
              }
              InputLabelProps={{ shrink: true, style: { color: "#FFD700" } }}
              InputProps={{
                style: { color: "#FFD700" },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              onClick={handleSearch}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>
        <Grid
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px", // Ajusta el margen superior según sea necesario
          }}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/createEvent")}
          >
            Crear evento
          </Button>
        </Grid>
        <Grid marginTop={10} sx={{ maxHeight: "1600px", overflow: "auto" }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className={classes.eventCard}>
                <CardHeader title={event.city} subheader={event.sport} />
                <CardContent>
                  <Typography variant="body1">{event.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDialogOpen(event)}
                  >
                    INFO
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body1" className={classes.noResultsText}>
              No se encontraron eventos.
            </Typography>
          )}
        </Grid>
        {/* <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <Grid>
            <DialogTitle>{selectedEvent?.city}</DialogTitle>
            <DialogContent sx={{ backgroundColor: "grey" }}>
              <DialogContentText sx={{ color: "black" }}>
                {selectedEvent?.description}
              </DialogContentText>
              <Typography variant="body2">
                Fecha: {selectedEvent?.date}
              </Typography>
              <Typography variant="body2">Participantes:</Typography>
              <ul>
                {participants.map((participant, index) => (
                  <li key={index}>{participant}</li>
                ))}
              </ul>
              <Typography variant="body2">
                {participants.length}/{maxParticipants}
              </Typography>
            </DialogContent>
            <DialogActions>
              {!isFull && (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSignUp}
                >
                  APUNTARSE
                </Button>
              )}
              <Button onClick={() => setOpenDialog(false)}>Cerrar</Button>
            </DialogActions>
          </Grid>
        </Dialog> */}
      </Container>
    </Grid>
  );
}
