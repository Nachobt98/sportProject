import React from "react";
import { Accordion, AccordionDetails, AccordionSummary, Paper, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AppShell } from "../components/AppShell";

const faqData = [
  {
    question: "Como puedo registrarme en SportLife?",
    answer: "Entra en la pagina de registro, completa tus datos personales y confirma el formulario.",
  },
  {
    question: "Como puedo crear un nuevo evento?",
    answer:
      "Inicia sesion, abre Crear evento y rellena deporte, ciudad, fecha, participantes y descripcion. El evento quedara publicado al enviarlo.",
  },
  {
    question: "Como puedo unirme a un evento existente?",
    answer:
      "Busca el evento desde la pantalla de eventos, abre el detalle y usa la accion de unirte si quedan plazas disponibles.",
  },
  {
    question: "Donde veo mis eventos?",
    answer:
      "En Perfil puedes ver los eventos que has creado y los eventos a los que te has unido. Tambien puedes revisarlos desde Calendario.",
  },
  {
    question: "Que hago si no recuerdo mi usuario?",
    answer:
      "En entorno local puedes usar el usuario de desarrollo creado por el seed. Para produccion habria que implementar recuperacion de cuenta.",
  },
  {
    question: "Como contacto con el organizador?",
    answer:
      "Abre el detalle del evento para revisar los datos disponibles. Si falta informacion, contacta con soporte desde la pagina de contacto.",
  },
];

export function FaqPage() {
  return (
    <AppShell
      title="Preguntas frecuentes"
      subtitle="Respuestas rapidas sobre acceso, eventos y uso basico de la plataforma."
    >
      <Paper variant="outlined" sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack spacing={1.5}>
          {faqData.map((item) => (
            <Accordion
              key={item.question}
              disableGutters
              variant="outlined"
              sx={{
                "&:before": { display: "none" },
              }}
            >
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
    </AppShell>
  );
}
