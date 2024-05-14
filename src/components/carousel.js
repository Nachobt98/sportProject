import React, { useState, useEffect } from "react";
import "../styles/Carousel.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { makeStyles } from "@mui/styles";
import img1 from "../img/img1.jpg";
import img2 from "../img/img2.jpg";
import img3 from "../img/img4.jpg";

import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";
const useStyles = makeStyles((theme) => ({}));
export function Carousel() {
  const classes = useStyles();
  const [currImg, setCurrImg] = useState(0);

  const images = [
    {
      title: "A SUDAR!",
      subtitle:
        "Te recomendamos hacer ejercicio al menos 5 dias a la semana. Tu cuerpo te lo agradecerá",
      img: img2,
    },
    {
      title: "EMPIEZA TU VIDA SANA!",
      subtitle: "Una buena dieta equilibrada es la base de todo.",
      img: img1,
    },
    {
      title: "MENTE SANA, CUERPO SANO",
      subtitle:
        "El ejercicio no solo fortalece tu cuerpo, sino que también alimenta tu mente y espíritu.",
      img: img3,
    },
  ];

  const nextImage = () => {
    setCurrImg((prevImg) => (prevImg < images.length - 1 ? prevImg + 1 : 0));
  };

  const prevImage = () => {
    setCurrImg((prevImg) => (prevImg > 0 ? prevImg - 1 : images.length - 1));
  };

  useEffect(() => {
    // Cambiar automáticamente de imagen cada 5 segundos (ajusta según tus necesidades)
    const interval = setInterval(() => {
      nextImage();
    }, 5000);

    // Limpieza del intervalo al desmontar el componente
    return () => clearInterval(interval);
  }, [currImg]); // Dependencia para que el efecto se vuelva a ejecutar cuando cambia currImg

  return (
    <Grid className="carousel">
      <Grid
        className="carouselInner"
        style={{ backgroundImage: `url(${images[currImg].img})` }}
      >
        <Grid className="left" onClick={prevImage}>
          <ArrowBackIcon style={{ fontSize: 40, marginTop: 60 }} />
        </Grid>
        <Grid className="center">
          <Typography variant="h3" fontWeight={600} color="white">
            {images[currImg].title}
          </Typography>

          <Typography variant="h4" fontWeight={500} color="white">
            {images[currImg].subtitle}
          </Typography>
        </Grid>
        <Grid className="right" onClick={nextImage}>
          <ArrowForwardIcon style={{ fontSize: 40, marginTop: 60 }} />
        </Grid>
      </Grid>
    </Grid>
  );
}
