import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { makeStyles } from "@mui/styles";
import { Grid, Container, Typography, Tabs, Tab } from "@mui/material";
import img8 from "../img/img8.jpg";
import { CardEvent } from "../components/cardEvent";
import dayjs from "dayjs";
import { useUser } from "../context/userContext";
import "dayjs/locale/es";
dayjs.locale("es");
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
  div: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  divEventSelected: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  divCalToday: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  today: {
    width: "50%",
    justifyContent: "center",
    marginRight: "10%",
  },
}));

export function Calendar() {
  const classes = useStyles();
  const { users } = useUser();
  const [events, setEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [value, setValue] = useState(dayjs());
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    console.log("values", value);
  }, [value]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchJoinedEvents = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user/${users.userName}/joinedEvents`
      );
      if (response.ok) {
        const data = await response.json();
        setUserEvents(data);
      } else {
        console.error(
          "Error al obtener los eventos unidos del usuario:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error al obtener los eventos unidos del usuario:", error);
    }
  };

  useEffect(() => {
    fetchJoinedEvents();
    fetchEvents();
  }, []);

  const groupEventsByDate = (e) => {
    const groupedEvents = {};
    e.forEach((event) => {
      const date = dayjs(event.date).locale("es");
      if (!groupedEvents[date]) {
        groupedEvents[date] = [];
      }
      groupedEvents[date].push(event);
    });
    return groupedEvents;
  };

  const renderEventsByDate = () => {
    const groupedEvents = groupEventsByDate(events);
    console.log("groupedEvents", groupedEvents);
    return Object.entries(groupedEvents).map(([date, events]) => {
      const eventDate = dayjs(date);
      console.log("events", events);
      if (eventDate.isAfter(value)) {
        return (
          <div key={date}>
            <Typography
              variant="h5"
              sx={{ color: "black", marginBottom: "10px" }}
            >
              {eventDate.format("dddd, D [de] MMMM [de] YYYY")}
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
  const renderMyEventsByDate = () => {
    const groupedEvents = groupEventsByDate(userEvents);

    return Object.entries(groupedEvents).map(([date, userEvents]) => {
      const eventDate = dayjs(date);

      if (eventDate.isAfter(value)) {
        return (
          <div key={date}>
            <Typography
              variant="h5"
              sx={{ color: "black", marginBottom: "10px" }}
            >
              {eventDate.format("dddd, D [de] MMMM [de] YYYY")}
            </Typography>
            {userEvents.map((event, index) => (
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
      <div>
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
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DateCalendar
                sx={{
                  "& .MuiPickersDay-root": {
                    "&:not(.Mui-selected)": {
                      color: "black",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#c59c00",
                      color: "black",
                    },
                    "& .MuiPickersDay-dayWithMargin": {
                      backgroundColor: "#c59c00",
                    },
                  },
                  "& .MuiPickersDay-today": {
                    backgroundColor: "rgba(0, 0, 0, 0.2)",
                    border: "0px solid rgba(0, 0, 0, 0.2)",
                  },

                  "& .MuiDayCalendar-weekDayLabel": {
                    color: "black",
                  },
                }}
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
                onChange={(newValue) => setValue(newValue)}
              />
            </LocalizationProvider>
          </Grid>
          <Grid className={classes.today} sx={{ marginTop: "50px" }}>
            {renderTodaysEvents()}
          </Grid>
        </Grid>
        <Grid sx={{ marginTop: "50px" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="secondary"
            centered
          >
            <Tab
              label="Todos los Eventos"
              sx={{
                "&.Mui-selected": {
                  color: "#c59c00",
                },
                color: "black",
              }}
            />
            <Tab
              label="Mis Eventos"
              sx={{
                "&.Mui-selected": {
                  color: "#c59c00",
                },
                color: "black",
              }}
            />
          </Tabs>
          {activeTab === 0 && (
            <div>
              <Typography variant="h4" sx={{ marginBottom: "30px" }}>
                Todos los eventos:
              </Typography>
              {renderEventsByDate()}
            </div>
          )}
          {activeTab === 1 && (
            <div>
              <Typography variant="h4" sx={{ marginBottom: "30px" }}>
                Mis eventos:
              </Typography>
              {renderMyEventsByDate()}
            </div>
          )}
        </Grid>
      </Container>
    </Grid>
  );
}
