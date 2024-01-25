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
import { Link, useNavigate } from "react-router-dom";
import img3 from "../img/img3.jpg";
import { useUser } from "../context/userContext";
import { useAuth } from "../context/authContext";

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
const handleSubmit = (event) => {
  event.preventDefault();
  console.log("submiiit");
};
export function LoginPage() {
  const { users } = useUser();
  const { login, username } = useAuth();
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    userName: "",
    password: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };
  const handleLogin = (e) => {
    e.preventDefault();
    // Comprobar si las credenciales están registradas
    const isUserRegistered = users.some(
      (user) => user.userName === loginData.userName
    );

    if (isUserRegistered) {
      console.log("Usuario autenticado");
      navigate("/");
      login(loginData.userName);
      console.log(login(loginData.userName));
      console.log(username);
      // Puedes redirigir o hacer otras acciones después de la autenticación
    } else {
      console.error("Credenciales no válidas");
    }
  };

  const classes = useStyles();
  return (
    <Grid container component="main" className={classes.root}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className={classes.paper}>
          <Typography variant="h2" color="secondary" align="center">
            SportLife
          </Typography>
          <form className={classes.form}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h5" color="textSecondary">
                  Username
                </Typography>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="userName"
                  name="userName"
                  autoComplete="off"
                  value={loginData.userName}
                  onChange={handleInputChange}
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
                  value={loginData.password}
                  onChange={handleInputChange}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              className={classes.submit}
              onClick={handleLogin}
            >
              LogIn
            </Button>
          </form>
        </Paper>
      </Container>
    </Grid>
  );
}
