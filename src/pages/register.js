import React from "react";
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
  const classes = useStyles();

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
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h5" color="textSecondary" gutterBottom>
                  Ciudad
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="city"
                  name="city"
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
                  autoComplete="email"
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
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              className={classes.submit}
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
