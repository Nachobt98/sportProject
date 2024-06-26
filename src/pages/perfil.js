import React, { useState, useRef, useEffect } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useUser } from "../context/userContext";
import img3 from "../img/img3.jpg";
import perfil from "../img/pexels-stefan-stefancik-91227.jpg";
import { CardEvent } from "../components/cardEvent";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundImage: `url(${img3})`,
    backgroundSize: "cover",
    marginTop: "60px",
    width: "100%",
    height: "2000px",
    borderRadius: theme.spacing(2),
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dialog: {
    backdropFilter: "blur(10px)",
  },
  avatar: {
    width: 150,
    height: 150,
    marginBottom: theme.spacing(2),
  },
  userData: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  button: {
    marginTop: theme.spacing(2),
  },
  editButton: {
    marginTop: theme.spacing(1),
  },
  divider: {
    margin: theme.spacing(2, 0),
    backgroundColor: "#262626",
  },
  blurredBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    filter: "blur(5px)",
    zIndex: -1,
  },
  profileContainer: {
    height: "150vh",
    backgroundImage: img3,
    backgroundSize: "cover",
    display: "flex",
  },
}));

export function Perfil() {
  const [events, setEvents] = useState([]);
  const { users, setUsers, updateUserData, getUserData } = useUser();
  const [joinedEvents, setJoinedEvents] = useState([]);
  useEffect(() => {
    setEditedData({ ...users });
  }, [users]);
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/user/${users.userName}/events`
        );
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error("Error fetching user events:", error);
      }
    };

    const fetchJoinedEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/user/${users.userName}/joinedEvents`
        );
        if (response.ok) {
          const data = await response.json();
          setJoinedEvents(data);
        } else {
          console.error(
            "Error al obtener los eventos unidos del usuario:",
            response.statusText
          );
        }
      } catch (error) {
        console.error(
          "Error al obtener los eventos unidos del usuario:",
          error
        );
      }
    };

    fetchJoinedEvents();
    fetchUserEvents();
  }, [joinedEvents]);

  const classes = useStyles();

  const [editable, setEditable] = useState(false);
  const [editedData, setEditedData] = useState({ ...users });

  const handleEdit = () => {
    setEditable(true);
  };

  const handleSave = () => {
    // Actualiza los datos editados en el contexto de usuario
    console.log(editedData);
    setUsers(editedData);
    console.log(users);
    setEditable(false);
  };
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedData((prevData) => ({
          ...prevData,
          profileImage: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formattedDate = new Date(users.birthdate).toLocaleDateString();

  const handleEditPhoto = () => {
    // Abrir el explorador de archivos al hacer clic en "Editar Foto"
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  return (
    <Grid className={classes.profileContainer}>
      <Grid className={classes.root}>
        <Grid align="center" style={{ marginTop: "30px" }}>
          <Avatar
            className={classes.avatar}
            src={editedData.profileImage || perfil}
            style={
              !editedData.profileImage ? { backgroundColor: "#bdbdbd" } : {}
            }
            sx={{ width: 100, height: 100 }}
          />

          <Button
            variant="contained"
            color="secondary"
            className={classes.editButton}
            onClick={handleEditPhoto}
          >
            Editar Foto
          </Button>

          {/* Input para seleccionar el archivo */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </Grid>

        <Grid style={{ margin: "50px" }}>
          <Divider className={classes.divider} />
          <Typography variant="h4" color="secondary" gutterBottom>
            Datos Personales
          </Typography>
          <Grid className={classes.userData}>
            <div>
              <Typography
                color="secondary"
                style={{ marginBottom: "5px", background: "none" }}
              >
                <strong>Nombre:</strong> {users.firstName}
              </Typography>
              <Typography
                color="secondary"
                style={{ marginBottom: "5px", background: "none" }}
              >
                <strong>Apellidos:</strong> {users.lastName}
              </Typography>
              <Typography
                color="secondary"
                style={{ marginBottom: "5px", background: "none" }}
              >
                <strong>Nombre de Usuario:</strong> {users.userName}
              </Typography>
            </div>
            <div>
              <Typography
                color="secondary"
                style={{ marginBottom: "5px", background: "none" }}
              >
                <strong>Ciudad:</strong> {users.city}
              </Typography>
              <Typography
                color="secondary"
                style={{ marginBottom: "5px", background: "none" }}
              >
                <strong>Email:</strong> {users.email}
              </Typography>
              <Typography
                color="secondary"
                style={{ marginBottom: "5px", background: "none" }}
              >
                <strong>Fecha de Nacimiento:</strong> {formattedDate}
              </Typography>
            </div>
          </Grid>

          {!editable && (
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={handleEdit}
            >
              Editar
            </Button>
          )}
        </Grid>

        <Grid style={{ margin: "50px" }}>
          <Divider className={classes.divider} />
          <Typography variant="h4" color="secondary" gutterBottom>
            Eventos creados
          </Typography>
          <Grid refstyle={{ maxHeight: "500px", overflowY: "scroll" }}>
            {events.length === 0 ? (
              <Typography
                variant="body1"
                color="secondary"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                Aún no has creado ningún evento
              </Typography>
            ) : (
              events.map((event) => <CardEvent event={event} />)
            )}
          </Grid>
        </Grid>
        <Grid style={{ margin: "50px" }}>
          <Divider className={classes.divider} />
          <Typography variant="h4" color="secondary" gutterBottom>
            Mis eventos
          </Typography>
          <Grid style={{ maxHeight: "500px", overflowY: "scroll" }}>
            {joinedEvents.length === 0 ? (
              <Typography
                variant="body1"
                color="secondary"
                sx={{ display: "flex", justifyContent: "center" }}
              >
                No te has unido a ningun evento
              </Typography>
            ) : (
              joinedEvents.map((event) => <CardEvent event={event} />)
            )}
          </Grid>
        </Grid>
      </Grid>

      <Dialog
        open={editable}
        onClose={() => setEditable(false)}
        className={classes.dialog}
      >
        <DialogTitle>Editar Datos Personales</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nombre"
            name="firstName"
            value={editedData.firstName}
            onChange={handleChange}
            style={{ marginTop: "5px", marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Apellidos"
            name="lastName"
            value={editedData.lastName}
            onChange={handleChange}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Nombre de Usuario"
            name="userName"
            value={editedData.userName}
            onChange={handleChange}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Ciudad"
            name="city"
            value={editedData.city}
            onChange={handleChange}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={editedData.email}
            onChange={handleChange}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            fullWidth
            label="Fecha de Nacimiento"
            name="birthdate"
            value={formattedDate}
            onChange={handleChange}
            style={{ marginBottom: "10px" }}
          />
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={handleSave}
          >
            Guardar
          </Button>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
