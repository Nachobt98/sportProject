import PropTypes from "prop-types";
import { Avatar } from "@mui/material";
import { API_BASE_URL } from "../api/client";

export function getUserInitials(userName = "") {
  const normalizedUserName = String(userName || "").trim();
  if (!normalizedUserName) {
    return "?";
  }

  return normalizedUserName.slice(0, 2).toUpperCase();
}

export function resolveProfileImageUrl(profileImage = "") {
  if (!profileImage) {
    return "";
  }

  if (/^(https?:|data:)/.test(profileImage)) {
    return profileImage;
  }

  if (profileImage.startsWith("/")) {
    return `${API_BASE_URL}${profileImage}`;
  }

  return profileImage;
}

export function UserAvatar({ userName, profileImage = "", size = 40, sx = {} }) {
  return (
    <Avatar
      src={resolveProfileImageUrl(profileImage)}
      alt={userName || "Usuario"}
      sx={{ width: size, height: size, fontSize: Math.max(size * 0.35, 12), fontWeight: 700, ...sx }}
    >
      {getUserInitials(userName)}
    </Avatar>
  );
}

UserAvatar.propTypes = {
  userName: PropTypes.string,
  profileImage: PropTypes.string,
  size: PropTypes.number,
  sx: PropTypes.object,
};
