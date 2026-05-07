import React, { useState } from "react";
import {
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useUser } from "../context/userContext";

export function DropdownMenu({ navItems = [] }) {
  const { logout } = useAuth();
  const { deleteUser } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Menu">
        <IconButton
          onClick={handleMenuOpen}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            color: "text.secondary",
          }}
        >
          <MenuIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {navItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={handleMenuClose}
            component={Link}
            to={item.path}
            sx={{ display: { xs: "flex", md: "none" } }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
        {navItems.length > 0 && (
          <Divider sx={{ display: { xs: "block", md: "none" } }} />
        )}
        <MenuItem onClick={handleMenuClose} component={Link} to="/Perfil">
          <ListItemIcon>
            <AccountCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>
        <MenuItem onClick={handleMenuClose} component={Link} to="/faqPage">
          <ListItemIcon>
            <HelpOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          FAQ
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            deleteUser();
            logout();
            handleMenuClose();
          }}
        >
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </>
  );
}
