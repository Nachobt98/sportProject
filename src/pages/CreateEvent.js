import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { MenuItem } from "@mui/material";
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

export function CreateEvent() {
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
    name: "",
    description: "",
    sport: "",
    date: "",
    city: "",
    participants: "",
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Nombre es requerido"),
    description: Yup.string().required("Descripcion es requerida"),
    sport: Yup.string().required("Deporte es requerido"),
    city: Yup.string().required("Ciudad es requerido"),
    date: Yup.date().required("Fecha de Nacimiento es requerida"),
    participants: Yup.string().required("Participantes es requerido"),
  });

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
              name: "",
              description: "",
              sport: "",
              date: "",
              city: "",
              participants: "",
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const response = await fetch(
                  "http://localhost:5000/api/events",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(values),
                  }
                );
                if (response.ok) {
                  const responseData = await response.json();
                  console.log("response", values); // Maneja la respuesta del servidor si es necesario
                  setOpenSnackbar(true); // Abre el Snackbar si el evento se creó correctamente
                } else {
                  // Maneja errores si la respuesta no es OK
                  console.error("Error al crear evento:", response.statusText);
                }
                setSubmitting(false);
              } catch (error) {
                console.error(error);
                // Maneja errores si la solicitud falla
              }
            }}
          >
            {(formikProps) => (
              <Form className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Nombre del evento
                    </Typography>
                    <Field
                      type="text"
                      name="name"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="name"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, name: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Descripcion
                    </Typography>
                    <Field
                      type="text"
                      name="description"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="description"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        });
                      }}
                    />
                    <ErrorMessage
                      name="description"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" color="textSecondary" gutterBottom>
                      Deporte
                    </Typography>
                    <Field
                      type="text"
                      name="sport"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="sport"
                      autoComplete="off"
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, sport: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="sport"
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
                      Fecha del evento
                    </Typography>
                    <Field
                      type="date"
                      name="date"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="date"
                      autoComplete="off"
                      InputLabelProps={{ shrink: true }}
                      onChange={(e) => {
                        formikProps.handleChange(e);
                        setFormData({ ...formData, date: e.target.value });
                      }}
                    />
                    <ErrorMessage
                      name="date"
                      component="div"
                      className={classes.error}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h5" color="textSecondary" gutterBottom>
                    Número de Participantes
                  </Typography>
                  <Field
                    type="select"
                    name="participants"
                    as={TextField}
                    select
                    variant="outlined"
                    required
                    fullWidth
                    id="participants"
                    autoComplete="off"
                    onChange={(e) => {
                      formikProps.handleChange(e);
                      setFormData({
                        ...formData,
                        participants: e.target.value,
                      });
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="participants"
                    component="div"
                    className={classes.error}
                  />
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="secondary"
                  className={classes.submit}
                >
                  Crear Evento
                </Button>
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
