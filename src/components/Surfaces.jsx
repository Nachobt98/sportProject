import PropTypes from "prop-types";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

export function SectionCard({ children, sx, contentSx }) {
  return (
    <Card sx={{ height: "100%", ...sx }}>
      <CardContent sx={{ p: { xs: 2.25, md: 3 }, "&:last-child": { pb: { xs: 2.25, md: 3 } }, ...contentSx }}>
        {children}
      </CardContent>
    </Card>
  );
}

SectionCard.propTypes = {
  children: PropTypes.node.isRequired,
  sx: PropTypes.object,
  contentSx: PropTypes.object,
};

export function FormSection({ title, description, children }) {
  return (
    <Stack spacing={2.25}>
      <Box>
        <Typography variant="h6">{title}</Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 720 }}>
            {description}
          </Typography>
        )}
      </Box>
      {children}
    </Stack>
  );
}

FormSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export function MetricCard({ label, value, helper, icon }) {
  return (
    <SectionCard contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h3" color="text.primary">
            {value}
          </Typography>
          {icon && (
            <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", color: "primary.main", bgcolor: "primary.soft", borderRadius: "16px" }}>
              {icon}
            </Box>
          )}
        </Stack>
        <Box>
          <Typography variant="subtitle2">{label}</Typography>
          {helper && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {helper}
            </Typography>
          )}
        </Box>
      </Stack>
    </SectionCard>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  helper: PropTypes.string,
  icon: PropTypes.node,
};

export function HeroPanel({ eyebrow, title, description, children, sx }) {
  return (
    <Box sx={{ borderRadius: { xs: 4, md: 6 }, p: { xs: 3, md: 5 }, bgcolor: "primary.dark", color: "common.white", boxShadow: "0 28px 70px rgba(18, 58, 159, 0.26)", ...sx }}>
      <Stack spacing={2.25} sx={{ maxWidth: 720 }}>
        {eyebrow && (
          <Typography variant="overline" sx={{ color: "#bfdbfe", letterSpacing: 1.4 }}>
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h1" color="inherit">
          {title}
        </Typography>
        {description && (
          <Typography variant="h6" sx={{ color: "#dbeafe", fontWeight: 500, lineHeight: 1.55 }}>
            {description}
          </Typography>
        )}
        {children}
      </Stack>
    </Box>
  );
}

HeroPanel.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  sx: PropTypes.object,
};
