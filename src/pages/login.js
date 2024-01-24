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

export function LoginPage() {
  const classes = useStyles();

  return (
    <Grid container component="main" className={classes.root}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className={classes.paper}>
          <Typography variant="h2" color="secondary" align="center">
            SportLife
          </Typography>
          <form className={classes.form} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" color="textSecondary">
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
                <Typography variant="h5" color="textSecondary">
                  Contraseña
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
              </Grid>
              <Grid item xs={12}>
                <Link>
                  <Typography variant="body2" color="secondary" align="center">
                    ¿Olvidaste tu contraseña?
                  </Typography>
                </Link>
              </Grid>
              <Grid item xs={12}>
                <Link to="/registerpage">
                  <Typography variant="body2" color="secondary" align="center">
                    Registrate aquí
                  </Typography>
                </Link>
              </Grid>
            </Grid>

            <Link to="/">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="secondary"
                className={classes.submit}
              >
                LogIn
              </Button>
            </Link>
          </form>
        </Paper>
      </Container>
    </Grid>
  );
}
