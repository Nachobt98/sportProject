import React, { useEffect, useState } from "react";
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
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { AppShell } from "../components/AppShell";
import { ErrorState, LoadingState } from "../components/FeedbackState";
import { useUser } from "../context/userContext";
import { createEvent, getEventById, updateEvent } from "../api/eventsApi";

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
const emptyEventValues = {
  name: "",
  description: "",
  sport: "",
  date: "",
  location: "",
  locationName: "",
  city: "",
  participants: "",
};

function toDateInputValue(date) {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().slice(0, 10);
}

function toEventFormValues(event) {
  return {
    name: event.name || "",
    description: event.description || "",
    sport: event.sport || "",
    date: toDateInputValue(event.date),
    location: event.location || "",
    locationName: event.locationName || "",
    city: event.city || "",
    participants: event.participants ? String(event.participants) : "",
  };
}

export function CreateEvent() {
  const { eventId } = useParams();
  const isEditMode = Boolean(eventId);
  const { users } = useUser();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [initialValues, setInitialValues] = useState(emptyEventValues);

  useEffect(() => {
    let isMounted = true;

    async function fetchEditableEvent() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await getEventById(eventId);
        if (!isMounted) {
          return;
        }

        if (data.event?.creator !== users.userName) {
          setLoadError("Solo el creador puede editar este evento.");
          return;
        }

        setInitialValues(toEventFormValues(data.event));
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || "No se pudo cargar el evento.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (isEditMode) {
      fetchEditableEvent();
    }

    return () => {
      isMounted = false;
    };
  }, [eventId, isEditMode, users.userName]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const pageTitle = isEditMode ? "Editar evento" : "Crear evento";
  const pageSubtitle = isEditMode
    ? "Actualiza la actividad, plazas disponibles y punto de encuentro del evento."
    : "Define la actividad, plazas disponibles y punto de encuentro para que otras personas puedan unirse.";
  const successMessage = isEditMode ? "Evento actualizado correctamente" : "Evento creado correctamente";
  const detailPath = `/events/${eventId}`;

  if (isLoading) {
    return (
      <AppShell title={pageTitle} maxWidth="md">
        <LoadingState title="Cargando evento" description="Preparando el formulario con los datos actuales." />
      </AppShell>
    );
  }

  if (loadError) {
    return (
      <AppShell title={pageTitle} maxWidth="md">
        <ErrorState
          title="No se puede editar el evento"
          message={loadError}
          actionLabel="Volver a eventos"
          onAction={() => navigate("/events")}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={pageTitle}
      subtitle={pageSubtitle}
      maxWidth="md"
      actions={
        isEditMode ? (
          <Button
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => navigate(detailPath, { replace: true })}
          >
            Volver
          </Button>
        ) : undefined
      }
    >
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitError("");
            try {
              const eventData = {
                ...values,
                participants: Number(values.participants),
                creator: users.userName,
              };

              if (isEditMode) {
                await updateEvent(eventId, eventData);
              } else {
                await createEvent(eventData);
              }

              setOpenSnackbar(true);
              setTimeout(() => {
                if (isEditMode) {
                  navigate(detailPath, { replace: true });
                } else {
                  navigate("/events");
                }
              }, 900);
            } catch (error) {
              setSubmitError(error.message || (isEditMode ? "No se pudo editar el evento" : "No se pudo crear el evento"));
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {(formikProps) => (
            <Form>
              <Stack spacing={2.5}>
                {submitError && <Alert severity="error">{submitError}</Alert>}
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Nombre del evento</Typography>
                    <Field
                      name="name"
                      as={TextField}
                      label="Nombre del evento"
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
                      label="Deporte"
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
                    label="Descripcion"
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
                    <Field name="city" as={TextField} label="Ciudad" fullWidth autoComplete="off" />
                    <ErrorMessage name="city" component={Alert} severity="error" />
                  </Stack>
                  <Stack spacing={0.75} sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">Fecha</Typography>
                    <Field
                      name="date"
                      as={TextField}
                      label="Fecha"
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
                      label="Ubicacion"
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
                      label="Direccion"
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
                  <Field name="participants" as={TextField} label="Numero de participantes" select fullWidth>
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

                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    disabled={formikProps.isSubmitting}
                  >
                    {isEditMode ? "Guardar cambios" : "Crear evento"}
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
        message={successMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AppShell>
  );
}
