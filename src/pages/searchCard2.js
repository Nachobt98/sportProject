import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import img8 from "../img/img8.jpg";
import "../styles/styles.css";
import { useEventContext } from "../context/eventContext";
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
  "Futbol",
  "Baloncesto",
  "Tenis",
  "Atletismo",
  "Natación",
  "Ciclismo",
  "Voleibol",
  "Golf",
  "Balonmano",
  "Padel",
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
}));

export function SearchCard2() {
  const { eventData, setEvent } = useEventContext();
  const classes = useStyles();
  const [searchCriteria, setSearchCriteria] = useState({
    city: "",
    sport: "",
    date: "",
  });
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/events");
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    if (isSearching) {
      fetchEvents();
      setIsSearching(false);
    }
  }, [isSearching]);

  useEffect(() => {
    const filtered = events.filter((event) => {
      return (
        (!searchCriteria.city ||
          event.city.toLowerCase() === searchCriteria.city.toLowerCase()) &&
        (!searchCriteria.sport ||
          event.sport.toLowerCase() === searchCriteria.sport.toLowerCase()) &&
        (!searchCriteria.date || /* Lógica de comparación de fechas */ true)
      );
    });

    setFilteredEvents(filtered);
  }, [events, searchCriteria]);

  const handleSearch = () => {
    setIsSearching(true);
  };
  const handleInfoClick = (event) => {
    console.log(event);
    setEvent(event);
    console.log("evento", eventData);
    navigate("/cardDetails");
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
        </Grid>

        {/* Botón de búsqueda */}
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

        {/* Botón para crear evento */}
        <Grid
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
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

        {/* Resultados de la búsqueda */}
        <Grid marginTop={10} sx={{ maxHeight: "1600px", overflow: "auto" }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className={classes.eventCard}>
                <CardHeader title={event.city} subheader={event.sport} />
                <CardContent>
                  <Typography variant="body1">{event.description}</Typography>
                </CardContent>
                <CardActions>
                  {/* Botón de información del evento */}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleInfoClick(event)}
                  >
                    INFO
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            // Mensaje si no se encuentran resultados
            <Typography variant="body1" className={classes.noResultsText}>
              No se encontraron eventos.
            </Typography>
          )}
        </Grid>

        {/* Diálogo de información del evento */}
        {/* Código del diálogo eliminado por brevedad */}
      </Container>
    </Grid>
  );
}
