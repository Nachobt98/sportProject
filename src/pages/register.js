import React, { useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link } from "react-router-dom";
import img3 from "../img/img3.jpg";
import { useUser } from "../context/userContext";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    backgroundImage: `url(${img3})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(3),
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Fondo tenue
    borderRadius: theme.spacing(2), // Bordes redondeados
  },
  form: {
    width: "100%", // Fix IE11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export function RegisterPage() {
  const { addUser } = useUser();
  const classes = useStyles();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    city: "",
    email: "",
    birthdate: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(formData);

    // try {
    //   const response = await fetch("/registeredUser", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     console.log("Usuario registrado exitosamente");
    //     // Puedes redirigir o hacer otras acciones después del registro
    //   } else {
    //     console.error("Error de registro:", data.message);
    //   }
    // } catch (error) {
    //   console.error("Error al enviar el formulario de registro:", error);
    // }
  };

  return (
    <Grid container component="main" className={classes.root}>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} className={classes.paper}>
          <Typography
            variant="h2"
            color="secondary"
            align="center"
            gutterBottom
          >
            SportLife
          </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Nombre
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="firstName"
                  name="firstName"
                  autoComplete="off"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Apellidos
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="lastName"
                  name="lastName"
                  autoComplete="off"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Nombre de Usuario
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="userName"
                  name="userName"
                  autoComplete="off"
                  value={formData.userName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Ciudad
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="city"
                  name="city"
                  autoComplete="off"
                  value={formData.city}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Email
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  name="email"
                  autoComplete="off"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Contraseña
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Fecha de Nacimiento
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Foto de Perfil
                </Typography>
                {/* Aquí puedes añadir el componente para subir la foto */}
                <input type="file" accept="image/*" />
              </Grid>
            </Grid>

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              className={classes.submit}
              onClick={handleSubmit}
            >
              Registrarse
            </Button>
            <Link to="/loginpage">
              <Typography variant="body2" color="secondary" align="center">
                ¿Ya tienes una cuenta? Inicia sesión
              </Typography>
            </Link>
          </form>
        </Paper>
      </Container>
    </Grid>
  );
}
