import PropTypes from "prop-types";
import { Box, Container, Stack, Typography } from "@mui/material";

export function AppShell({ title, subtitle, actions, maxWidth = "lg", children }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pt: { xs: 10, md: 12 },
        pb: { xs: 5, md: 8 },
      }}
    >
      <Container maxWidth={maxWidth}>
        <Stack spacing={{ xs: 3, md: 4 }}>
          {(title || subtitle || actions) && (
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2.5}
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
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 1, maxWidth: 760, fontWeight: 500, lineHeight: 1.55 }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
              {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
            </Stack>
          )}
          {children}
        </Stack>
      </Container>
    </Box>
  );
}

AppShell.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  children: PropTypes.node,
};
