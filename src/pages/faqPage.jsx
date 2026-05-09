import React from "react";
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Grid, Paper, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import SportsSoccerRoundedIcon from "@mui/icons-material/SportsSoccerRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import { AppShell } from "../components/AppShell";

const faqData = [
  { question: "Como puedo registrarme en SportLife?", answer: "Entra en la pagina de registro, completa tus datos personales y confirma el formulario." },
  { question: "Como puedo crear un nuevo evento?", answer: "Inicia sesion, abre Crear evento y rellena deporte, ciudad, fecha, participantes y descripcion. El evento quedara publicado al enviarlo." },
  { question: "Como puedo unirme a un evento existente?", answer: "Busca el evento desde la pantalla de eventos, abre el detalle y usa la accion de unirte si quedan plazas disponibles." },
  { question: "Donde veo mis eventos?", answer: "En Perfil puedes ver los eventos que has creado y los eventos a los que te has unido. Tambien puedes revisarlos desde Calendario." },
  { question: "Que hago si no recuerdo mi usuario?", answer: "En entorno local puedes usar el usuario de desarrollo creado por el seed. Para produccion habria que implementar recuperacion de cuenta." },
  { question: "Como contacto con el organizador?", answer: "Abre el detalle del evento para revisar los datos disponibles. Si falta informacion, contacta con soporte desde la pagina de contacto." },
];

const helpCards = [
  [<LoginRoundedIcon key="login" />, "Acceso", "Registro, login y datos de cuenta."],
  [<SportsSoccerRoundedIcon key="sport" />, "Eventos", "Creacion, participacion y estados."],
  [<SupportAgentRoundedIcon key="support" />, "Soporte", "Contacto y dudas sobre incidencias."],
];

export function FaqPage() {
  return (
    <AppShell title="Preguntas frecuentes" subtitle="Respuestas rapidas sobre acceso, eventos y uso basico de la plataforma." maxWidth="lg">
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Stack spacing={2.5}>
            <Paper sx={{ p: { xs: 2.25, md: 3 }, border: "1px solid", borderColor: "divider" }}>
              <Stack spacing={2}>
                <Box sx={{ width: 54, height: 54, display: "grid", placeItems: "center", borderRadius: "18px", bgcolor: "primary.soft", color: "primary.main" }}>
                  <HelpOutlineRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="h5">Centro de ayuda</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Consulta las dudas mas habituales antes de contactar con soporte.
                  </Typography>
                </Box>
                <Alert severity="info">Si no encuentras respuesta, usa la pagina de contacto y describe el evento afectado.</Alert>
              </Stack>
            </Paper>

            {helpCards.map(([icon, title, description]) => (
              <Paper key={title} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 40, height: 40, display: "grid", placeItems: "center", borderRadius: "14px", bgcolor: "secondary.soft", color: "secondary.main" }}>
                    {icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{description}</Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: { xs: 1.5, md: 2 }, border: "1px solid", borderColor: "divider" }}>
            <Stack spacing={1.5}>
              {faqData.map((item) => (
                <Accordion key={item.question} disableGutters variant="outlined" sx={{ borderRadius: "16px !important", overflow: "hidden", "&:before": { display: "none" } }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">{item.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography color="text.secondary">{item.answer}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </AppShell>
  );
}
