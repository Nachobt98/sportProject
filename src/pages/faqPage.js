import React from "react";
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { makeStyles } from "@mui/styles";
import img3 from "../img/img3.jpg";
const useStyles = makeStyles((theme) => ({
  accordion: {
    marginBottom: theme.spacing(2),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: theme.spacing(2),
  },
  accordionTitle: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: theme.palette.secondary.main,
  },
  accordionContent: {
    fontSize: "1rem",
    color: "#fff",
  },
  profileContainer: {
    height: "150vh",
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
    // Agrega más preguntas y respuestas aquí...
  ];

  return (
    <Paper className={classes.profileContainer}>
      <Grid className={classes.root}>
        <Typography variant="h3" color="secondary" gutterBottom>
          Preguntas Frecuentes
        </Typography>

        <Grid container spacing={3}>
          {faqData.map((item, index) => (
            <Grid item xs={12} key={index} marginLeft={10} marginRight={10}>
              <Accordion className={classes.accordion}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${index + 1}a-content`}
                  id={`panel${index + 1}a-header`}
                >
                  <Typography className={classes.accordionTitle}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography className={classes.accordionContent}>
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
