import PropTypes from "prop-types";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";

export function AuthLayout({ title, subtitle, children }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        bgcolor: "background.default",
        py: { xs: 4, md: 7 },
      }}
    >
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 4, md: 8 }} alignItems="center">
          <Stack spacing={3} sx={{ flex: 1, maxWidth: 620 }}>
            <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.4 }}>
              SportLife
            </Typography>
            <Typography variant="h1" color="text.primary">
              Conecta con gente para hacer deporte cerca de ti.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.55 }}>
              Encuentra eventos deportivos locales, unete a planes activos y organiza quedadas con una experiencia clara y ordenada.
            </Typography>
          </Stack>

          <Paper
            sx={{
              width: "100%",
              maxWidth: 480,
              p: { xs: 2.5, md: 4 },
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.12)",
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Typography variant="h3" color="primary">
                  SportLife
                </Typography>
                <Typography variant="h5">{title}</Typography>
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Stack>
              {children}
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  children: PropTypes.node.isRequired,
};
