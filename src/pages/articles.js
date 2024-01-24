import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";
import React from "react";
export function Article() {
  return (
    <Grid marginTop={10}>
      <Typography variant="h3" fontWeight={600} color="secondary">
        Esto es articulo
      </Typography>
    </Grid>
  );
}
