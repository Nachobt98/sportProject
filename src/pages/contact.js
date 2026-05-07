import React from "react";
import { Alert, Button, Grid, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { AppShell } from "../components/AppShell";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Nombre requerido"),
  email: Yup.string().email("Correo no valido").required("Correo requerido"),
  message: Yup.string().required("Mensaje requerido"),
});

export function Contact() {
  return (
    <AppShell
      title="Contacto"
      subtitle="Envia una consulta o avisanos si necesitas ayuda con un evento."
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
            <Formik
              initialValues={{ name: "", email: "", message: "" }}
              validationSchema={validationSchema}
              onSubmit={(_values, { resetForm, setStatus }) => {
                setStatus("Mensaje preparado correctamente.");
                resetForm();
              }}
            >
              {({ errors, touched, status }) => (
                <Form>
                  <Stack spacing={2.5}>
                    {status && <Alert severity="success">{status}</Alert>}
                    <Field
                      as={TextField}
                      fullWidth
                      label="Nombre"
                      name="name"
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineRoundedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Field
                      as={TextField}
                      fullWidth
                      label="Correo electronico"
                      name="email"
                      type="email"
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineRoundedIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Field
                      as={TextField}
                      fullWidth
                      multiline
                      rows={5}
                      label="Mensaje"
                      name="message"
                      error={Boolean(touched.message && errors.message)}
                      helperText={touched.message && errors.message}
                    />
                    <Button type="submit" variant="contained" size="large">
                      Enviar mensaje
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
            <Stack spacing={2}>
              <Typography variant="h5">Soporte</Typography>
              <Typography variant="body2" color="text.secondary">
                Para dudas rapidas sobre eventos, participantes o acceso, usa el formulario y revisaremos el caso.
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LocalPhoneRoundedIcon color="primary" />
                <Typography variant="subtitle1">93 767 786 7867</Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </AppShell>
  );
}
