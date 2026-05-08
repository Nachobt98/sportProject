import { Avatar, Grid, Stack, Typography } from "@mui/material";

export function Testimonio({ foto, nombre, mensaje }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Stack spacing={1.5} alignItems="center" textAlign="center" sx={{ p: 2 }}>
        <Avatar alt={nombre} src={foto} sx={{ width: 80, height: 80 }} />
        <Typography variant="h6">{nombre}</Typography>
        <Typography variant="body2" color="text.secondary">
          {mensaje}
        </Typography>
      </Stack>
    </Grid>
  );
}
