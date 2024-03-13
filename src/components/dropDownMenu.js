import React, { useState } from "react";
import { Menu, MenuItem, IconButton, Divider } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

export function DropdownMenu() {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleMenuOpen} sx={{ color: "#c59c00" }}>
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose} component={Link} to="/Perfil">
          Mi Perfil
        </MenuItem>
        <MenuItem onClick={handleMenuClose} component={Link} to="/faqPage">
          FAQ
        </MenuItem>
        <Divider sx={{ margin: "5px", backgroundColor: "#262626" }} />
        <MenuItem
          onClick={() => {
            logout();
            handleMenuClose();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
