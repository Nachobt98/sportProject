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
        bgcolor: "rgba(255, 255, 255, 0.92)",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(12px)",
      }}
    >
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          <Button
            component={Link}
            to="/home"
            color="inherit"
            sx={{
              px: 0,
              minWidth: "auto",
              "&:hover": { bgcolor: "transparent" },
            }}
          >
            <Typography variant="h5" color="primary" fontWeight={800}>
              SportLife
            </Typography>
          </Button>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              display: { xs: "none", md: "flex" },
              flex: 1,
              ml: 3,
            }}
          >
            {navItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  color={active ? "primary" : "inherit"}
                  sx={{
                    px: 1.5,
                    bgcolor: active ? "rgba(29, 78, 216, 0.08)" : "transparent",
                    color: active ? "primary.main" : "text.secondary",
                    "&:hover": {
                      bgcolor: "rgba(29, 78, 216, 0.08)",
                      color: "primary.main",
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>

          <Box sx={{ flex: { xs: 1, md: 0 } }} />

          {!isAuthenticated ? (
            <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
              <Button component={Link} to="/login" variant="outlined">
                Login
              </Button>
              <Button component={Link} to="/register" variant="contained">
                Registro
              </Button>
            </Stack>
          ) : (
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center" }}>
              <DropdownMenu navItems={navItems} />
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
