import PropTypes from "prop-types";
import { Alert, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

function StateSurface({ children, compact = false }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: compact ? 2 : { xs: 2, md: 3 },
        bgcolor: "background.paper",
      }}
    >
      {children}
    </Paper>
  );
}

StateSurface.propTypes = {
  children: PropTypes.node.isRequired,
  compact: PropTypes.bool,
};

export function LoadingState({ title = "Cargando...", description = "Estamos preparando la informacion.", compact = false }) {
  return (
    <StateSurface compact={compact}>
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={compact ? 22 : 28} />
        <Stack spacing={0.25}>
          <Typography variant={compact ? "subtitle2" : "h6"}>{title}</Typography>
          {description && <Typography color="text.secondary">{description}</Typography>}
        </Stack>
      </Stack>
    </StateSurface>
  );
}

LoadingState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  compact: PropTypes.bool,
};

export function EmptyState({ title, description, action = null, compact = false }) {
  return (
    <StateSurface compact={compact}>
      <Stack spacing={1.5} alignItems="flex-start">
        <InboxOutlinedIcon color="disabled" />
        <Stack spacing={0.5}>
          <Typography variant={compact ? "subtitle1" : "h6"}>{title}</Typography>
          {description && <Typography color="text.secondary">{description}</Typography>}
        </Stack>
        {action}
      </Stack>
    </StateSurface>
  );
}

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  compact: PropTypes.bool,
};

export function ErrorState({ title = "Ha ocurrido un error", message, actionLabel, onAction, compact = false }) {
  return (
    <StateSurface compact={compact}>
      <Stack spacing={1.5}>
        <Alert icon={<ErrorOutlineRoundedIcon />} severity="error" variant="outlined">
          <Typography variant="subtitle2">{title}</Typography>
          <Typography variant="body2">{message}</Typography>
        </Alert>
        {actionLabel && onAction && (
          <Button variant="outlined" color="inherit" onClick={onAction} sx={{ alignSelf: "flex-start" }}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </StateSurface>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  compact: PropTypes.bool,
};
