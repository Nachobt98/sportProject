import PropTypes from "prop-types";
import { Box, Paper } from "@mui/material";

const panelSx = {
  border: "1px solid",
  borderColor: "divider",
};

export function SurfacePanel({ children, sx }) {
  return <Paper sx={{ ...panelSx, ...sx }}>{children}</Paper>;
}

SurfacePanel.propTypes = {
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
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
