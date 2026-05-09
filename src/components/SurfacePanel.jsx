import PropTypes from "prop-types";
import { Box, Paper, Stack, Typography } from "@mui/material";

const panelSx = {
  border: "1px solid",
  borderColor: "divider",
};

export function SurfacePanel({ children, sx, variant = "elevation" }) {
  return <Paper variant={variant} sx={{ ...panelSx, ...sx }}>{children}</Paper>;
}

SurfacePanel.propTypes = {
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
  variant: PropTypes.oneOf(["elevation", "outlined"]),
};

export function SurfaceSection({ title, description, children, sx, headerSx }) {
  return (
    <SurfacePanel sx={{ p: { xs: 2, md: 3 }, height: "100%", ...sx }}>
      <Stack spacing={2}>
        <Box sx={headerSx}>
          <Typography variant="h5">{title}</Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {children}
      </Stack>
    </SurfacePanel>
  );
}

SurfaceSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  sx: PropTypes.object,
  headerSx: PropTypes.object,
};

export function IconTile({ children, color = "primary", size = 46, radius = "16px" }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        borderRadius: radius,
        bgcolor: `${color}.soft`,
        color: `${color}.main`,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}

IconTile.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(["primary", "secondary"]),
  size: PropTypes.number,
  radius: PropTypes.string,
};

export function StatCard({ icon, label, value, helper, valueVariant = "h5" }) {
  return (
    <SurfacePanel variant="outlined" sx={{ p: 2, height: "100%", bgcolor: "background.paper" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <IconTile size={42} radius="15px">
          {icon}
        </IconTile>
        <Box>
          <Typography variant={valueVariant}>{value}</Typography>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {helper && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
              {helper}
            </Typography>
          )}
        </Box>
      </Stack>
    </SurfacePanel>
  );
}

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helper: PropTypes.string,
  valueVariant: PropTypes.string,
};
