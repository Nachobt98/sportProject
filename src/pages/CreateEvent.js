import React, { useState } from "react";
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AppShell } from "../components/AppShell";
import { useUser } from "../context/userContext";
import { apiFetch } from "../api/client";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Nombre es requerido"),
  description: Yup.string().required("Descripcion es requerida"),
  sport: Yup.string().required("Deporte es requerido"),
  city: Yup.string().required("Ciudad es requerida"),
  location: Yup.string().required("Ubicacion es requerida"),
  locationName: Yup.string().required("Direccion es requerida"),
  date: Yup.date().required("Fecha de evento es requerida"),
  participants: Yup.string().required("Participantes es requerido"),
});

const participantOptions = Array.from({ length: 20 }, (_, index) => index + 1);

export function CreateEvent() {
  const { users } = useUser();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <AppShell
      title="Crear evento"
      subtitle="Define la actividad, plazas disponibles y punto de encuentro para que otras personas puedan unirse."
      maxWidth="md"
    >
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Formik
          initialValues={{
            name: "",
            description: "",
            sport: "",
            date: "",
            location: "",
            locationName: "",
            city: "",
            participants: "",
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const eventData = {
                ...values,
                participants: Number(values.participants),
                creator: users.userName,
              };
              const response = await apiFetch("/api/events", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(eventData),
              });

              if (response.ok) {
                setOpenSnackbar(true);
                setTimeout(() => {
                  navigate("/searchCard2");
                }, 900);
              } else {
                console.error("Error al crear evento:", response.statusText);
              }
            } catch (error) {
              console.error(error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {(formikProps) => (
            <Form>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Nombre del evento</Typography>
                    <Field
                      name="name"
                      as={TextField}
                      fullWidth
                      autoComplete="off"
                    />
                    <ErrorMessage name="name" component={Alert} severity="error" />
                  </Stack>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Deporte</Typography>
                    <Field
                      name="sport"
                      as={TextField}
                      fullWidth
                      autoComplete="off"
                    />
                    <ErrorMessage name="sport" component={Alert} severity="error" />
                  </Stack>
                </Stack>

                <Stack spacing={0.75}>
                  <Typography variant="subtitle2">Descripcion</Typography>
                  <Field
                    name="description"
                    as={TextField}
                    fullWidth
                    multiline
                    rows={4}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="description"
                    component={Alert}
                    severity="error"
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Ciudad</Typography>
                    <Field name="city" as={TextField} fullWidth autoComplete="off" />
                    <ErrorMessage name="city" component={Alert} severity="error" />
                  </Stack>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Fecha</Typography>
                    <Field
                      name="date"
                      as={TextField}
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                    <ErrorMessage name="date" component={Alert} severity="error" />
                  </Stack>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Ubicacion</Typography>
                    <Field
                      name="location"
                      as={TextField}
                      fullWidth
                      autoComplete="off"
                    />
                    <ErrorMessage
                      name="location"
                      component={Alert}
                      severity="error"
                    />
                  </Stack>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Direccion</Typography>
                    <Field
                      name="locationName"
                      as={TextField}
                      fullWidth
                      autoComplete="off"
                    />
                    <ErrorMessage
                      name="locationName"
                      component={Alert}
                      severity="error"
                    />
                  </Stack>
                </Stack>

                <Stack spacing={0.75}>
                  <Typography variant="subtitle2">Numero de participantes</Typography>
                  <Field name="participants" as={TextField} select fullWidth>
                    {participantOptions.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="participants"
                    component={Alert}
                    severity="error"
                  />
                </Stack>

                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    disabled={formikProps.isSubmitting}
                  >
                    Crear evento
                  </Button>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Evento creado correctamente"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AppShell>
  );
}
