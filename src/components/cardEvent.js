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
  const navigate = useNavigate();
  const handleInfoClick = (event) => {
    setEvent(event);
    navigate("/cardDetails");
  };

  const { setEvent } = useEventContext();
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
  );
}
