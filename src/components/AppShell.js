import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";

export function AppShell({ title, subtitle, actions, maxWidth = "lg", children }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: { xs: 10, md: 11 },
        pb: { xs: 4, md: 7 },
      }}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          {(title || subtitle || actions) && (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "flex-end" }}
              justifyContent="space-between"
            >
              <Box>
                {title && (
                  <Typography variant="h3" color="text.primary">
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mt: 0.75, maxWidth: 680 }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {actions}
            </Stack>
          )}
          {children}
        </Stack>
      </Container>
    </Box>
  );
}

