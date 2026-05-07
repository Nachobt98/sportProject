import React, { useState } from "react";
import {
  Alert,
  Button,
  Link as MuiLink,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import avatar from "../img/avatar.png";
import { AuthLayout } from "../components/AuthLayout";
import { useUser } from "../context/userContext";
import { useAuth } from "../context/authContext";
import { registerUser } from "../api/authApi";

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("Nombre requerido"),
  lastName: Yup.string().required("Apellidos requeridos"),
  userName: Yup.string()
    .required("Usuario requerido")
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .max(20, "El usuario no debe tener mas de 20 caracteres"),
  city: Yup.string().required("Ciudad requerida"),
  email: Yup.string().email("Email no valido").required("Email requerido"),
  password: Yup.string()
    .required("Contrasena requerida")
    .min(6, "La contrasena debe tener al menos 6 caracteres")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Debe contener una minuscula, una mayuscula y un numero"
    ),
  birthdate: Yup.date().required("Fecha de nacimiento requerida"),
});

export function RegisterPage() {
  const { addUser } = useUser();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [profileImage, setProfileImage] = useState(avatar);

  const handleSubmit = async (values, { setSubmitting }) => {
    setSubmitError("");
    const formData = { ...values, profileImage };
    try {
      const data = await registerUser(formData);
      addUser(data.user);
      login(data.user.userName, data.token);
      setOpenSnackbar(true);
      setTimeout(() => navigate("/homepage"), 1200);
    } catch (error) {
      setSubmitError(error.message || "No se pudo conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Registra tus datos para crear y unirte a eventos deportivos."
    >
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
          <Form>
            <Stack spacing={2}>
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FieldControl name="firstName" label="Nombre" formik={formikProps} />
                <FieldControl name="lastName" label="Apellidos" formik={formikProps} />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FieldControl name="userName" label="Usuario" formik={formikProps} />
                <FieldControl name="city" label="Ciudad" formik={formikProps} />
              </Stack>
              <FieldControl name="email" label="Email" formik={formikProps} />
              <FieldControl
                name="password"
                label="Contrasena"
                type="password"
                formik={formikProps}
              />
              <FieldControl
                name="birthdate"
                label="Fecha de nacimiento"
                type="date"
                formik={formikProps}
                inputLabelProps={{ shrink: true }}
              />
              <Stack spacing={0.75}>
                <Typography variant="subtitle2">Foto de perfil</Typography>
                <Button variant="outlined" component="label">
                  Seleccionar imagen
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) => setProfileImage(event.target.files[0] || avatar)}
                  />
                </Button>
              </Stack>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={formikProps.isSubmitting}
              >
                Registrarse
              </Button>
              <Typography variant="body2" color="text.secondary">
                Ya tienes una cuenta?{" "}
                <MuiLink component={RouterLink} to="/">
                  Inicia sesion
                </MuiLink>
              </Typography>
            </Stack>
          </Form>
        )}
      </Formik>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Registro exitoso"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </AuthLayout>
  );
}

function FieldControl({ name, label, type = "text", formik, inputLabelProps }) {
  return (
    <Stack spacing={0.75} sx={{ flex: 1 }}>
      <Typography variant="subtitle2">{label}</Typography>
      <Field
        name={name}
        as={TextField}
        type={type}
        fullWidth
        autoComplete="off"
        InputLabelProps={inputLabelProps}
        error={Boolean(formik.touched[name] && formik.errors[name])}
        helperText={formik.touched[name] && formik.errors[name]}
      />
    </Stack>
  );
}
