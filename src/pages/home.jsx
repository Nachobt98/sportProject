import React from "react";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SportsSoccerOutlinedIcon from "@mui/icons-material/SportsSoccerOutlined";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { StatCard, SurfaceSection } from "../components/SurfacePanel";

const sports = ["Futbol", "Padel", "Running", "Baloncesto", "Ciclismo"];
const weeklyPlan = [
  ["L", "Running urbano", "Valencia · 19:00"],
  ["M", "Baloncesto 3x3", "Madrid · 20:30"],
  ["V", "Padel mixto", "Valencia · 18:30"],
  ["D", "Ciclismo suave", "Valencia · 10:00"],
];

const metrics = [
  { value: "42", label: "Eventos disponibles", helper: "Actividades abiertas esta semana", icon: <SportsSoccerOutlinedIcon /> },
  { value: "6", label: "Participaciones", helper: "Planes a los que te has unido", icon: <GroupsOutlinedIcon /> },
  { value: "4", label: "Proximos planes", helper: "Vista rapida de calendario", icon: <CalendarMonthOutlinedIcon /> },
];

export function Home() {
  const navigate = useNavigate();

  return (
    <AppShell maxWidth="xl">
      <Box sx={{ borderRadius: { xs: 4, md: 6 }, p: { xs: 3, md: 5 }, bgcolor: "primary.dark", color: "common.white", boxShadow: "0 28px 70px rgba(18, 58, 159, 0.26)" }}>
        <Stack spacing={2.25} sx={{ maxWidth: 760 }}>
          <Typography variant="overline" sx={{ color: "#bfdbfe", letterSpacing: 1.4 }}>Comunidad deportiva local</Typography>
          <Typography variant="h1" color="inherit">Encuentra gente para moverte sin depender de grupos dispersos.</Typography>
          <Typography variant="h6" sx={{ color: "#dbeafe", fontWeight: 500, lineHeight: 1.55 }}>
            Busca eventos deportivos cerca de ti, unete a actividades con plazas disponibles y organiza planes de forma sencilla.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="contained" color="secondary" size="large" startIcon={<SearchOutlinedIcon />} onClick={() => navigate("/events")}>Buscar eventos</Button>
            <Button variant="outlined" color="inherit" size="large" startIcon={<AddCircleOutlineIcon />} onClick={() => navigate("/events/new")}>Crear evento</Button>
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        {metrics.map((metric) => (
          <Grid item xs={12} md={4} key={metric.label}>
            <StatCard {...metric} valueVariant="h3" />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <SurfaceSection title="Deportes populares" description="Accesos rapidos para descubrir planes por tipo de actividad.">
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              {sports.map((sport) => <Button key={sport} variant="outlined" onClick={() => navigate("/events")}>{sport}</Button>)}
            </Stack>
          </SurfaceSection>
        </Grid>
        <Grid item xs={12} lg={5}>
          <SurfaceSection title="Actividad semanal">
            {weeklyPlan.map(([day, title, meta]) => (
              <Stack key={`${day}-${title}`} direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 46, height: 46, display: "grid", placeItems: "center", borderRadius: "16px", bgcolor: "primary.soft", color: "primary.main", fontWeight: 900 }}>{day}</Box>
                <Stack spacing={0.25}>
                  <Typography variant="subtitle1">{title}</Typography>
                  <Typography variant="body2" color="text.secondary">{meta}</Typography>
                </Stack>
              </Stack>
            ))}
          </SurfaceSection>
        </Grid>
      </Grid>
    </AppShell>
  );
}
