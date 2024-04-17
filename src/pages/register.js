import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  Grid,
  TextField,
  Typography,
  Paper,
  Container,
  Link as MuiLink,
  Snackbar,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import img3 from "../img/img3.jpg";
import { useUser } from "../context/userContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import avatar from "../img/avatar.png";
const useStyles = makeStyles((theme) => ({
  root: {
    height: "110vh",
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
  error: {
    color: "#a93131",
  },
  snackbar: {
    [theme.breakpoints.down("sm")]: {
      bottom: 90,
    },
  },
}));

export function RegisterPage() {
  const { addUser } = useUser();
  const classes = useStyles();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    city: "",
    email: "",
    birthdate: "",
    password: "",
    profileImage: avatar,
  });
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      profileImage: file,
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("Nombre es requerido"),
    lastName: Yup.string().required("Apellidos son requeridos"),
    userName: Yup.string()
      .required("Nombre de Usuario es requerido")
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(20, "El nombre de usuario no debe tener más de 20 caracteres"),
    city: Yup.string().required("Ciudad es requerida"),
    email: Yup.string()
      .email("Correo electrónico no válido")
      .required("Email es requerido"),
    password: Yup.string()
      .required("Contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una minúscula, una mayúscula y un número"
      ),
    birthdate: Yup.date().required("Fecha de Nacimiento es requerida"),
  });
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Usuario registrado exitosamente");
        addUser(formData);
        setOpenSnackbar(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        console.error("Error de registro:", data.message);
      }
    } catch (error) {
      console.error("Error al enviar el formulario de registro:", error);
    }
  };
  const handleSubmite = (e) => {
    //e.preventDefault();
    addUser(formData);
    console.log(formData);
    setOpenSnackbar(true);
    setTimeout(() => {
      navigate("/");
    }, 3000);
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
          <Formik
            initialValues={{
              firstName: "",
              lastName: "",
              userName: "",
              city: "",
              email: "",
              birthdate: "",
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <Form className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Nombre
                    </Typography>
                    <Field
                      type="text"
                      name="firstName"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="firstName"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, firstName: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Apellidos
                    </Typography>
                    <Field
                      type="text"
                      name="lastName"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="lastName"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, lastName: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Nombre de Usuario
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
                        setFormData({ ...formData, userName: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="userName"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Ciudad
                    </Typography>
                    <Field
                      type="text"
                      name="city"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="city"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, city: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="city"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Email
                    </Typography>
                    <Field
                      type="text"
                      name="email"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="email"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, email: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Contraseña
                    </Typography>
                    <Field
                      type="password"
                      name="password"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="password"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, password: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="password"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Fecha de Nacimiento
                    </Typography>
                    <Field
                      type="date"
                      name="birthdate"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="birthdate"
                      autoComplete="off"
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, birthdate: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="birthdate"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Foto de Perfil
                    </Typography>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
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
                <MuiLink
                  component={RouterLink}
                  to="/"
                  variant="body2"
                  color="secondary"
                >
                  ¿Ya tienes una cuenta? Inicia sesión
                </MuiLink>
              </Form>
            )}
          </Formik>
        </Paper>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Registro exitoso. ¡Bienvenido a SportLife!"
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        className={classes.snackbar}
      />
    </Grid>
  );
}
