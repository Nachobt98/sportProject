import React, { useState } from "react";
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AuthLayout } from "../components/AuthLayout";
import { useUser } from "../context/userContext";
import { useAuth } from "../context/authContext";
import { apiFetch } from "../api/client";

const validationSchema = Yup.object().shape({
  userName: Yup.string().required("Usuario requerido"),
  password: Yup.string().required("Contrasena requerida"),
});

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const { addUser } = useUser();
  const { login } = useAuth();
  const navigate = useNavigate();

  const fetchUserByUsername = async (username) => {
    const response = await apiFetch(`/api/user/${username}`);
    return response.ok ? response.json() : null;
  };

  const handleLogin = async (values, { setSubmitting }) => {
    setLoginError("");
    try {
      const response = await apiFetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await response.json();

      if (response.ok) {
        const user = await fetchUserByUsername(values.userName);
        login(data.username);
        addUser(user);
        navigate("/homepage");
      } else {
        setLoginError(data.message || "Credenciales no validas");
      }
    } catch (error) {
      console.error("Error al iniciar sesion:", error);
      setLoginError("No se pudo conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Inicia sesion"
      subtitle="Accede a tus eventos, calendario y perfil deportivo."
    >
      <Formik
        initialValues={{ userName: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {(formikProps) => (
          <Form>
            <Stack spacing={2.5}>
              {loginError && <Alert severity="error">{loginError}</Alert>}
              <Stack spacing={0.75}>
                <Typography variant="subtitle2">Usuario</Typography>
                <Field
                  name="userName"
                  as={TextField}
                  fullWidth
                  autoComplete="username"
                  error={Boolean(formikProps.touched.userName && formikProps.errors.userName)}
                  helperText={formikProps.touched.userName && formikProps.errors.userName}
                />
              </Stack>
              <Stack spacing={0.75}>
                <Typography variant="subtitle2">Contrasena</Typography>
                <Field
                  name="password"
                  as={TextField}
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  autoComplete="current-password"
                  error={Boolean(formikProps.touched.password && formikProps.errors.password)}
                  helperText={formikProps.touched.password && formikProps.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((value) => !value)}
                          onMouseDown={(event) => event.preventDefault()}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={formikProps.isSubmitting}
              >
                Entrar
              </Button>
              <Typography variant="body2" color="text.secondary">
                No tienes cuenta?{" "}
                <MuiLink component={RouterLink} to="/registerpage">
                  Registrate aqui
                </MuiLink>
              </Typography>
            </Stack>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
