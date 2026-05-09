import React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ContactSupportOutlinedIcon from "@mui/icons-material/ContactSupportOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { DropdownMenu } from "./dropDownMenu";

const navItems = [
  { label: "Calendario", path: "/calendar", icon: <CalendarMonthOutlinedIcon /> },
  { label: "Eventos", path: "/events", icon: <SearchOutlinedIcon /> },
  { label: "Crear", path: "/events/new", icon: <AddCircleOutlineIcon /> },
  { label: "Contacto", path: "/contact", icon: <ContactSupportOutlinedIcon /> },
];

function isActivePath(currentPath, itemPath) {
  if (itemPath === "/events") return currentPath === "/events" || currentPath.startsWith("/events/");
  return currentPath === itemPath;
}

export function Header() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "rgba(255, 255, 255, 0.88)",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(18px)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 }, gap: 2 }}>
          <Button component={Link} to="/home" color="inherit" sx={{ px: 0, minWidth: "auto", "&:hover": { bgcolor: "transparent" } }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 34, height: 34, borderRadius: "12px", display: "grid", placeItems: "center", bgcolor: "primary.main", color: "common.white", fontWeight: 900 }}>
                S
              </Box>
              <Typography variant="h5" color="primary" fontWeight={900}>
                SportLife
              </Typography>
            </Stack>
          </Button>

          <Stack direction="row" spacing={0.5} sx={{ display: { xs: "none", md: "flex" }, flex: 1, ml: 4 }}>
            {navItems.map((item) => {
              const active = isActivePath(location.pathname, item.path);
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  color={active ? "primary" : "inherit"}
                  sx={{
                    px: 1.75,
                    borderRadius: 999,
                    bgcolor: active ? "primary.soft" : "transparent",
                    color: active ? "primary.main" : "text.secondary",
                    "&:hover": { bgcolor: "primary.soft", color: "primary.main" },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Box sx={{ flex: { xs: 1, md: 0 } }} />

          {isAuthenticated ? (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
              <DropdownMenu navItems={navItems} />
            </Box>
          ) : (
            <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
              <Button component={Link} to="/login" variant="outlined">Login</Button>
              <Button component={Link} to="/register" variant="contained">Registro</Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
