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
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 2.5, md: 4 },
            border: "1px solid",
            borderColor: "divider",
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
      </Container>
    </Box>
  );
}

