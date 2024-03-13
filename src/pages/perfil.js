import React, { useState, useRef } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useUser } from "../context/userContext";
import img3 from "../img/img3.jpg";
import perfil from "../img/pexels-stefan-stefancik-91227.jpg";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "100px",
    width: "100%",
    borderRadius: theme.spacing(2),
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  dialog: {
    backdropFilter: "blur(10px)",
  },
  avatar: {
    width: theme.spacing(18),
    height: theme.spacing(18),
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
  const classes = useStyles();
  const { users, updateUserData } = useUser();
  const [loggedInUser, setLoggedInUser] = useState(users[0] || {});

  console.log(loggedInUser);
  const [editable, setEditable] = useState(false);
  const [editedData, setEditedData] = useState({ ...loggedInUser });

  const handleEdit = () => {
    setEditable(true);
  };

  const handleSave = () => {
    updateUserData(loggedInUser.id, editedData);
    setEditable(false);
  };
  const [bio, setBio] = useState(loggedInUser?.bio || "");
  const inputRef = useRef(null);
  const [isBioEditing, setIsBioEditing] = useState(false);

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleEditBio = () => {
    setIsBioEditing(true);
  };

  const handleAcceptBio = () => {
    updateUserData(loggedInUser.id, { ...loggedInUser, bio });
    setIsBioEditing(false);
    setLoggedInUser((prevUser) => ({ ...prevUser, bio })); // Actualiza localmente la biografía
  };

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

  const handleEditPhoto = () => {
    // Abrir el explorador de archivos al hacer clic en "Editar Foto"
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <Paper className={classes.profileContainer}>
      <Grid className={classes.root}>
        <Grid item xs={12} align="center" style={{ margin: "10px" }}>
          <Avatar
            className={classes.avatar}
            src={editedData.profileImage || perfil}
            style={
              !editedData.profileImage ? { backgroundColor: "#bdbdbd" } : {}
            }
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
          <Typography variant="h4" gutterBottom>
            Biografía
          </Typography>

          {isBioEditing ? (
            <Box display="flex" alignItems="center">
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Biografía"
                name="bio"
                value={bio}
                onChange={handleBioChange}
                style={{ marginBottom: "10px" }}
              />

              <IconButton style={{ color: "black" }} onClick={handleAcceptBio}>
                <CheckIcon />
              </IconButton>
            </Box>
          ) : (
            <Typography color="secondary" style={{ marginBottom: "10px" }}>
              {loggedInUser?.bio || ""}
              <IconButton
                style={{ color: "black", marginLeft: "20px" }}
                onClick={handleEditBio}
              >
                <EditIcon />
              </IconButton>
            </Typography>
          )}
        </Grid>
        <Grid style={{ margin: "50px" }}>
          <Divider className={classes.divider} />
          <Typography variant="h4" gutterBottom>
            Datos Personales
          </Typography>
          <Grid className={classes.userData}>
            <div>
              <Typography color="secondary" style={{ marginBottom: "5px" }}>
                <strong>Nombre:</strong> {loggedInUser.firstName}
              </Typography>
              <Typography color="secondary" style={{ marginBottom: "5px" }}>
                <strong>Apellidos:</strong> {loggedInUser.lastName}
              </Typography>
              <Typography color="secondary" style={{ marginBottom: "5px" }}>
                <strong>Nombre de Usuario:</strong> {loggedInUser.userName}
              </Typography>
            </div>
            <div>
              <Typography color="secondary" style={{ marginBottom: "5px" }}>
                <strong>Ciudad:</strong> {loggedInUser.city}
              </Typography>
              <Typography color="secondary" style={{ marginBottom: "5px" }}>
                <strong>Email:</strong> {loggedInUser.email}
              </Typography>
              <Typography color="secondary" style={{ marginBottom: "5px" }}>
                <strong>Fecha de Nacimiento:</strong> {loggedInUser.birthdate}
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
          <Divider className={classes.divider} />
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
            value={editedData.birthdate}
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
    </Paper>
  );
}
