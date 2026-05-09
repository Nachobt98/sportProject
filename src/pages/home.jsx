import React from "react";
import { Button, Grid, Stack, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { HeroPanel, MetricCard, SectionCard } from "../components/Surfaces";

const weeklyPlan = [
  ["Lunes", "Running urbano", "Valencia · 19:00"],
  ["Miércoles", "Baloncesto 3x3", "Madrid · 20:30"],
  ["Viernes", "Pádel mixto", "Valencia · 18:30"],
  ["Domingo", "Ciclismo suave", "Valencia · 10:00"],
];

const sportTags = ["Fútbol", "Pádel", "Running", "Baloncesto", "Ciclismo"];

export function Home() {
  const navigate = useNavigate();

  return (
    <AppShell maxWidth="xl">
      <HeroPanel
        eyebrow="Comunidad deportiva local"
        title="Encuentra gente para moverte sin depender de grupos dispersos."
        description="Busca eventos deportivos cerca de ti, únete a actividades con plazas disponibles y organiza planes de forma sencilla."
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button variant="contained" color="secondary" size="large" startIcon={<SearchOutlinedIcon />} onClick={() => navigate("/events")}>
            Buscar eventos
          </Button>
          <Button variant="outlined" color="inherit" size="large" startIcon={<AddCircleOutlineIcon />} onClick={() => navigate("/events/new")}>
            Crear evento
          </Button>
        </Stack>
      </HeroPanel>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <MetricCard label="Eventos disponibles" value="42" helper="Actividades abiertas esta semana" icon={<SportsSoccerOutlinedIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard label="Participaciones" value="6" helper="Planes a los que te has unido" icon={<GroupsOutlinedIcon />} />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricCard label="Próximos planes" value="4" helper="Vista rápida de calendario" icon={<CalendarMonthOutlinedIcon />} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <SectionCard>
            <Stack spacing={2.5}>
              <Stack spacing={0.75}>
                <Typography variant="h5">Deportes populares</Typography>
                <Typography color="text.secondary">Accesos rápidos para descubrir planes por tipo de actividad.</Typography>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {sportTags.map((tag) => (
                  <Button key={tag} variant="outlined" onClick={() => navigate("/events")}>
                    {tag}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <SectionCard>
            <Stack spacing={2.25}>
              <Typography variant="h5">Actividad semanal</Typography>
              {weeklyPlan.map(([day, title, meta]) => (
                <Stack key={`${day}-${title}`} direction="row" spacing={2} alignItems="center">
                  <Stack alignItems="center" justifyContent="center" sx={{ width: 46, height: 46, borderRadius: "16px", bgcolor: "primary.soft", color: "primary.main", fontWeight: 900 }}>
                    {day.slice(0, 1)}
                  </Stack>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle1">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">{day} · {meta}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </AppShell>
  );
}
