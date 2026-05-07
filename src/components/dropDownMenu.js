import React, { useState } from "react";
import {
  Avatar,
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
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useUser } from "../context/userContext";

function getInitials(userName = "") {
  return userName.slice(0, 2).toUpperCase();
}

export function DropdownMenu({ navItems = [] }) {
  const { logout } = useAuth();
  const { users, deleteUser } = useUser();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Abrir menu de usuario">
        <IconButton
          aria-label="Abrir menu de usuario"
          onClick={handleMenuOpen}
          sx={{
            p: 0.4,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            "&:hover": { bgcolor: "background.paper", borderColor: "primary.light" },
          }}
        >
          <Avatar
            src={users.profileImage || ""}
            alt={users.userName || "Usuario"}
            sx={{ width: 40, height: 40, fontSize: 14, fontWeight: 700 }}
          >
            {getInitials(users.userName)}
          </Avatar>
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
        <MenuItem onClick={handleMenuClose} component={Link} to="/profile">
          <ListItemIcon>
            <AccountCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>
        <MenuItem onClick={handleMenuClose} component={Link} to="/faq">
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
