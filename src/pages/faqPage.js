import React from "react";
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@mui/styles";
import img3 from "../img/img3.jpg";
const useStyles = makeStyles((theme) => ({
  accordion: {
    marginBottom: theme.spacing(2),
    backgroundColor: "black",
    borderRadius: theme.spacing(2),
  },
  accordionSummary: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  accordionTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "black",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  accordionContent: {
    fontSize: "1rem",
    color: "#c59c00",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    height: "2700px",
    backgroundImage: `url(${img3})`,
    backgroundSize: "cover",
    display: "flex",
  },
  root: {
    margin: "100px",
    width: "100%",
    borderRadius: theme.spacing(2),
    backdropFilter: "blur(10px)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  title: {
    display: "flex",
    justifyContent: "center",
  },
  gridDetails: {
    display: "flex",
    flexDirection: "row",
  },
}));

export function FaqPage() {
  const classes = useStyles();

  const faqData = [
    {
      question: "¿Cómo puedo registrarme en SportLife?",
      answer:
        "Para registrarte en SportLife, ve a la página de registro y completa el formulario con tus detalles personales.",
    },
    {
      question: "¿Puedo cambiar mi contraseña?",
      answer:
        "Sí, puedes cambiar tu contraseña en la sección de configuración de tu perfil. Haz clic en 'Editar perfil' y encontrarás la opción para cambiar la contraseña.",
    },

    {
      question: "¿Cómo puedo crear un nuevo evento en SportLife?",
      answer:
        "Para crear un nuevo evento, inicia sesión en tu cuenta y ve a la sección 'Crear Evento'. Llena el formulario con los detalles del evento, como título, fecha, ubicación y descripción, y luego haz clic en 'Crear' para publicar el evento.",
    },
    {
      question: "¿Cómo puedo unirme a un evento existente?",
      answer:
        "Para unirte a un evento existente, busca el evento en la página de 'Buscar Eventos' y haz clic en él para ver los detalles. Si el evento permite inscripciones, verás un botón de 'Unirse'. Haz clic en ese botón y sigue las instrucciones para confirmar tu participación.",
    },
    {
      question: "¿Cómo puedo eliminar un evento que he creado?",
      answer:
        "Si necesitas eliminar un evento que has creado, ve a tu perfil y busca la sección 'Mis Eventos'. Allí encontrarás una lista de todos los eventos que has creado. Haz clic en el evento que deseas eliminar y encontrarás la opción para eliminarlo.",
    },
    {
      question:
        "¿Qué debo hacer si tengo problemas técnicos con la aplicación?",
      answer:
        "Si encuentras algún problema técnico mientras usas SportLife, por favor contáctanos a través de nuestro formulario de soporte en la sección de 'Ayuda'. Describe el problema detalladamente para que podamos ayudarte de la mejor manera posible.",
    },
    {
      question: "¿Cómo puedo contactar al organizador de un evento?",
      answer:
        "Si necesitas contactar al organizador de un evento, ve a la página del evento y busca la sección de 'Contacto' o 'Información del Organizador'. Allí encontrarás la información de contacto del organizador, como su correo electrónico o número de teléfono.",
    },
  ];

  return (
    <Paper className={classes.profileContainer}>
      <Grid className={classes.root}>
        <Typography
          variant="h2"
          color="secondary"
          gutterBottom
          sx={{ marginTop: 10, marginBottom: 10, background: "none" }}
          className={classes.title}
        >
          Preguntas Frecuentes
        </Typography>

        <Grid container spacing={3}>
          {faqData.map((item, index) => (
            <Grid
              item
              key={index}
              marginLeft={10}
              marginRight={10}
              className={classes.grid}
            >
              <Accordion className={classes.accordion}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index + 1}a-content`}
                  id={`panel${index + 1}a-header`}
                  className={classes.accordionSummary}
                  sx={{ borderLeft: "4px solid black" }}
                >
                  <Typography
                    variant="h2"
                    sx={{ background: "none" }}
                    className={classes.accordionTitle}
                  >
                    P.
                  </Typography>
                  <Typography
                    variant="h6"
                    className={classes.accordionTitle}
                    sx={{ marginTop: 4 }}
                  >
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  className={classes.gridDetails}
                  sx={{ borderLeft: "4px solid #c59c00" }}
                >
                  <Typography
                    variant="h2"
                    sx={{ background: "none", color: "#c59c00" }}
                    className={classes.accordionTitle}
                  >
                    R.
                  </Typography>
                  <Typography
                    className={classes.accordionContent}
                    sx={{ background: "none" }}
                  >
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
}
