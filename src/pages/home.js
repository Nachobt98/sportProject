import React from "react";
import { Avatar, Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { Carousel } from "../components/carousel";
import { AppShell } from "../components/AppShell";
import avatar2 from "../img/avatar2.jpeg";
import avatar3 from "../img/avatar3.jpg";
import avatar4 from "../img/pexels-stefan-stefancik-91227.jpg";

const testimonials = [
  {
    name: "Nacho Bru Tarin",
    image: avatar2,
    text: "Desde que encontre eventos deportivos aqui, entrenar dejo de depender solo de la motivacion. He conocido gente nueva y mantengo una rutina mucho mas activa.",
  },
  {
    name: "Adrian Perez Lopez",
    image: avatar4,
    text: "Ahora cada fin de semana encuentro partidos, carreras o actividades cerca. La comunidad hace que sea mucho mas facil seguir moviendose.",
  },
  {
    name: "Raul Fernandez Iglesias",
    image: avatar3,
    text: "La plataforma me ayudo a descubrir actividades distintas y a conectar con personas que tambien quieren vivir de forma mas activa.",
  },
];

export function Home() {
  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Carousel />
      <AppShell
        title="Comunidad deportiva local"
        subtitle="Encuentra planes activos, conoce participantes y organiza eventos con una experiencia mas ordenada."
      >
        <Grid container spacing={2.5}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={4} key={testimonial.name}>
              <Card sx={{ height: "100%", border: "1px solid", borderColor: "divider" }}>
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Avatar src={testimonial.image} sx={{ width: 64, height: 64 }} />
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.text}
                    </Typography>
                    <Typography variant="subtitle1">{testimonial.name}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </AppShell>
    </Box>
  );
}
