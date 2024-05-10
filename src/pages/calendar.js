import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { makeStyles } from "@mui/styles";
import { Grid, Container, Typography } from "@mui/material";
import img8 from "../img/img8.jpg";
import { CardEvent } from "../components/cardEvent";
import dayjs, { Dayjs } from "dayjs";
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
  divCalendar: {
    backgroundColor: "rgba(250, 250, 250, 0.8)",
    border: "2px solid black",
    width: "fit-content",
    height: "fit-content",
  },
  eventMarker: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "red",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  divCalToday: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
}));

export function Calendar() {
  const classes = useStyles();

  const [events, setEvents] = useState([]);
  const [value, setValue] = useState(dayjs());
  useEffect(() => {
    console.log("values", value);
  }, [value]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const groupEventsByDate = () => {
    const groupedEvents = {};
    events.forEach((event) => {
      const date = new Date(event.date).toLocaleDateString("en-EN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      if (!groupedEvents[date]) {
        groupedEvents[date] = [];
      }
      groupedEvents[date].push(event);
    });
    return groupedEvents;
  };

  const renderEventsByDate = () => {
    const groupedEvents = groupEventsByDate();

    return Object.entries(groupedEvents).map(([date, events]) => {
      const eventDate = dayjs(date);

      if (eventDate.isAfter(value)) {
        return (
          <div key={date}>
            <Typography
              variant="h5"
              sx={{ color: "black", marginBottom: "10px" }}
            >
              {date}
            </Typography>
            {events.map((event, index) => (
              <CardEvent key={index} event={event} />
            ))}
          </div>
        );
      }
      return console.log("va antes");
    });
  };
  const renderTodaysEvents = () => {
    const selectedEvents = events.filter((event) => {
      const eventDate = dayjs(event.date);
      return eventDate.isSame(value, "day");
    });

    if (selectedEvents.length === 0) {
      return (
        <Typography variant="h5">No hay eventos para este día.</Typography>
      );
    }

    return (
      <div className={classes.divEventSelected}>
        <Typography variant="h5" sx={{ marginBottom: "10px" }}>
          Eventos para el día seleccionado:
        </Typography>
        {selectedEvents.map((event, index) => (
          <CardEvent key={index} event={event} />
        ))}
      </div>
    );
  };
  return (
    <Grid className={classes.grid}>
      <Container
        className={classes.root}
        sx={{ marginTop: "40px" }}
        maxWidth="100%"
      >
        <Grid className={classes.divCalToday}>
          <Grid className={classes.divCalendar} sx={{ marginTop: "20px" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                components={{
                  Day: ({ children, day }) => (
                    <div style={{ position: "relative" }}>
                      {children}
                      {events.map((event, index) => {
                        const eventDate = new Date(event.date);
                        if (
                          eventDate.getDate() === day &&
                          eventDate.getMonth() === day &&
                          eventDate.getFullYear() === day
                        ) {
                          return (
                            <div
                              key={index}
                              className={classes.eventMarker}
                              title={event.name}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  ),
                }}
                sx={{
                  "& .MuiPickersDay-root": {
                    "&:not(.Mui-selected)": {
                      color: "black",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#c59c00",
                      color: "black",
                    },
                  },
                  "& .MuiPickersDay-today": {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    border: "0px solid transparent",
                  },
                  "& .MuiDayCalendar-weekDayLabel": {
                    color: "black",
                  },
                }}
                onChange={(newValue) => setValue(newValue)}
              />
            </LocalizationProvider>
          </Grid>
          <Grid sx={{ width: "50%", marginTop: "50px" }}>
            {renderTodaysEvents()}
          </Grid>
        </Grid>

        <Grid marginTop={10} sx={{ maxHeight: "1000px" }}>
          <Typography variant="h4" sx={{ marginBottom: "30px" }}>
            Proximos eventos:
          </Typography>
          {renderEventsByDate()}
        </Grid>
      </Container>
    </Grid>
  );
}
