import React from "react";
import { Alert, Box, Button, Grid, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { AppShell } from "../components/AppShell";
import { IconTile, SurfacePanel } from "../components/SurfacePanel";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Nombre requerido"),
  email: Yup.string().email("Correo no valido").required("Correo requerido"),
  message: Yup.string().required("Mensaje requerido"),
});

const supportTips = [
  "Indica el nombre del evento si tu duda va sobre una actividad concreta.",
  "Incluye ciudad y fecha para que sea mas facil localizar el problema.",
  "Describe que esperabas que pasara y que ha pasado realmente.",
];

export function handleContactSubmit(_values, { resetForm, setStatus }) {
  setStatus("Mensaje preparado correctamente.");
  resetForm();
}

export function Contact() {
  return (
    <AppShell title="Contacto" subtitle="Envia una consulta o avisanos si necesitas ayuda con un evento." maxWidth="lg">
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={7}>
          <SurfacePanel sx={{ p: { xs: 2.25, md: 3 }, height: "100%" }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5">Cuéntanos qué ocurre</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  Usa este formulario para dudas de cuenta, eventos, participantes o incidencias visuales.
                </Typography>
              </Box>
              <Formik initialValues={{ name: "", email: "", message: "" }} validationSchema={validationSchema} onSubmit={handleContactSubmit}>
                {({ errors, handleBlur, handleChange, status, touched, values }) => (
                  <Form>
                    <Stack spacing={2.5}>
                      {status && <Alert severity="success">{status}</Alert>}
                      <TextField
                        fullWidth
                        label="Nombre"
                        name="name"
                        value={values.name}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(touched.name && errors.name)}
                        helperText={touched.name && errors.name}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineRoundedIcon fontSize="small" /></InputAdornment> }}
                      />
                      <TextField
                        fullWidth
                        label="Correo electronico"
                        name="email"
                        type="email"
                        value={values.email}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                        InputProps={{ startAdornment: <InputAdornment position="start"><MailOutlineRoundedIcon fontSize="small" /></InputAdornment> }}
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label="Mensaje"
                        name="message"
                        value={values.message}
                        onBlur={handleBlur}
                        onChange={handleChange}
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
            </Stack>
          </SurfacePanel>
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            <SurfacePanel sx={{ p: { xs: 2.25, md: 3 } }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <IconTile>
                    <SupportAgentRoundedIcon />
                  </IconTile>
                  <Box>
                    <Typography variant="h5">Soporte</Typography>
                    <Typography variant="body2" color="text.secondary">Respuesta orientativa en 24-48h.</Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Para dudas rapidas sobre eventos, participantes o acceso, usa el formulario y revisaremos el caso.
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LocalPhoneRoundedIcon color="primary" />
                  <Typography variant="subtitle1">93 767 786 7867</Typography>
                </Stack>
              </Stack>
            </SurfacePanel>

            <SurfacePanel sx={{ p: { xs: 2.25, md: 3 }, flex: 1 }}>
              <Stack spacing={2}>
                <Typography variant="h5">Para ayudarte antes</Typography>
                {supportTips.map((tip) => (
                  <Stack key={tip} direction="row" spacing={1.25} alignItems="flex-start">
                    <TaskAltRoundedIcon color="secondary" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">{tip}</Typography>
                  </Stack>
                ))}
              </Stack>
            </SurfacePanel>
          </Stack>
        </Grid>
      </Grid>
    </AppShell>
  );
}
