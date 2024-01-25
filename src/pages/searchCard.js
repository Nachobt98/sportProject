import React from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardHeader,
  MenuItem,
} from "@mui/material";
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
    description: "Torneo de baloncesto",
    sport: "Baloncesto",
  },
];

const getRandomCity = () => {
  const randomIndex = Math.floor(Math.random() * cities.length);
  return cities[randomIndex];
};

const getRandomSport = () => {
  const randomIndex = Math.floor(Math.random() * sports.length);
  return sports[randomIndex];
};

const generateRandomEvents = () => {
  return Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    city: getRandomCity(),
    description: `Evento ${index + 1}`,
    sport: getRandomSport(),
  }));
};

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
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Fondo tenue para las cards
  },
  noResultsText: {
    textAlign: "center",
    color: "rgba(0, 0, 0, 0.4)", // Texto en color tenue
    marginTop: theme.spacing(2),
  },
  optionPointer: {
    cursor: "pointer",
  },
}));

export function SearchCard() {
  const classes = useStyles();
  const [searchCriteria, setSearchCriteria] = React.useState({
    city: "",
    sport: "",
    date: "",
  });

  const [events, setEvents] = React.useState(generateRandomEvents());
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
    setEvents(generateRandomEvents());
    setIsSearching(true); // Establecer la bandera de búsqueda al iniciar la búsqueda
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
              InputLabelProps={{ shrink: true }}
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
              InputLabelProps={{ shrink: true }}
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
              InputLabelProps={{ shrink: true }}
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
        <Grid marginTop={10} sx={{ maxHeight: "1600px", overflow: "auto" }}>
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id} className={classes.eventCard}>
                <CardHeader title={event.city} subheader={event.sport} />
                <CardContent>
                  <Typography variant="body1">{event.description}</Typography>
                </CardContent>
                <CardActions>
                  <Button variant="contained" color="secondary">
                    Unirse
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
      </Container>
    </Grid>
  );
}
