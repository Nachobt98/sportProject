import PropTypes from "prop-types";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

const severityColor = {
  warning: "warning",
  error: "error",
  info: "primary",
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Volver",
  severity = "warning",
  isConfirming = false,
  onCancel,
  onConfirm,
}) {
  const confirmColor = severityColor[severity] || "warning";

  return (
    <Dialog open={open} onClose={isConfirming ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <WarningAmberOutlinedIcon color={confirmColor} />
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Alert severity={severity} variant="outlined" sx={{ mt: 0.5 }}>
          {description}
        </Alert>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} disabled={isConfirming}>
          {cancelLabel}
        </Button>
        <Button variant="contained" color={confirmColor} onClick={onConfirm} disabled={isConfirming}>
          {isConfirming ? "Procesando..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  severity: PropTypes.oneOf(["warning", "error", "info"]),
  isConfirming: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};
