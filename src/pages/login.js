import React, { useState } from "react";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  Container,
  IconButton,
  InputAdornment,
  Link as MuiLink,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import img3 from "../img/img3.jpg";
import { useUser } from "../context/userContext";
import { useAuth } from "../context/authContext";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
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
const validationSchema = Yup.object().shape({
  userName: Yup.string().required("Username es requerido"),
  password: Yup.string().required("Contraseña es requerida"),
});

const handleSubmit = (event) => {
  event.preventDefault();
};
export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { users, addUser } = useUser();
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
  const handleLogine = async (e) => {
    // Comprobar si las credenciales están registradas
    const isUserRegistered = users.some(
      (user) => user.userName === loginData.userName
    );

    if (isUserRegistered) {
      navigate("/homepage");
      login(loginData.userName);

      // Puedes redirigir o hacer otras acciones después de la autenticación
    } else {
      console.error("Credenciales no válidas");
    }
  };
  const fetchUserByUsername = async (username) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/user/${username}` // Aquí se debe utilizar el nombre de usuario real
      );

      if (response.ok) {
        const user = await response.json();

        return user;
      } else {
        console.error("Usuario no encontrado");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      return null;
    }
  };

  const handleLogin = async (values) => {
    try {
      // Envía los datos de inicio de sesión al backend
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();
      const user = await fetchUserByUsername(loginData.userName);

      if (response.ok) {
        login(data.username); // Almacena el nombre de usuario autenticado en el contexto de autenticación
        addUser(user);
        navigate("/homepage"); // Redirige al usuario a la página principal
      } else {
        console.error("Credenciales no válidas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
    }
  };
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const classes = useStyles();
  return (
    <Grid container component="main" className={classes.root}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} className={classes.paper}>
          <Typography
            variant="h2"
            color="secondary"
            align="center"
            sx={{ background: "none" }}
          >
            SportLife
          </Typography>
          <Formik
            initialValues={{
              userName: loginData.userName,
              password: loginData.password,
            }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {(formikProps) => (
              <Form className={classes.form}>
                <Grid container spacing={2} sx={{ marginBottom: "20px" }}>
                  <Grid item xs={12}>
                    <Typography variant="h5" color="textSecondary">
                      Username
                    </Typography>
                    <Field
                      type="text"
                      name="userName"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="userName"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setLoginData({
                          ...loginData,
                          userName: e.target.value,
                        });
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" color="textSecondary">
                      Contraseña
                    </Typography>
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      autoComplete="current-password"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        });
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MuiLink
                      component={RouterLink}
                      to="/forgotpassword"
                      variant="body2"
                      color="secondary"
                    >
                      ¿Olvidaste tu contraseña?
                    </MuiLink>
                  </Grid>
                  <Grid item xs={12}>
                    <MuiLink
                      component={RouterLink}
                      to="/registerpage"
                      variant="body2"
                      color="secondary"
                    >
                      Regístrate aquí
                    </MuiLink>
                  </Grid>
                </Grid>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  className={classes.submit}
                >
                  LogIn
                </Button>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Grid>
  );
}
