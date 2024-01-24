import React, { useState, useEffect } from "react";
import "../styles/Carousel.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import img1 from "../img/img1.jpg";
import img2 from "../img/img2.jpg";
import img3 from "../img/img4.jpg";

import { Grid } from "@mui/material";
import Typography from "@mui/material/Typography";

export function Carousel() {
  const [currImg, setCurrImg] = useState(0);

  const images = [
    {
      title: "A SUDAR!",
      subtitle: "Rutinas faciles y rapidas que puedes hacer en tu casa.",
      img: img1,
    },
    {
      title: "EMPIEZA TU VIDA SANA!",
      subtitle:
        "Te ofrecemos algunos consejos para llevar una alimentacion sana.",
      img: img2,
    },
    {
      title: "CON EL EJERCICIO NO SOLO AYUDAS A TU CUERPO",
      subtitle: "Lee este articulo sobre como el deporte beneficia a la mente.",
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
          <ArrowBackIcon style={{ fontSize: 30 }} />
        </Grid>
        <Grid className="center">
          <Typography variant="h3" fontWeight={600} color="secondary">
            {images[currImg].title}
          </Typography>

          <Typography variant="h4" fontWeight={500} color="secondary">
            {images[currImg].subtitle}
          </Typography>
        </Grid>
        <Grid className="right" onClick={nextImage}>
          <ArrowForwardIcon style={{ fontSize: 30 }} />
        </Grid>
      </Grid>
    </Grid>
  );
}
