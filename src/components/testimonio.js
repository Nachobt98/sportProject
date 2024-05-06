import { Grid, Avatar, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  testimonio: {
    textAlign: "center",
    padding: theme.spacing(2),
  },
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    margin: "auto",
  },
}));

export function Testimonio({ foto, nombre, mensaje }) {
  const classes = useStyles();

  return (
    <Grid item xs={12} sm={6} md={3} className={classes.testimonio}>
      <Avatar alt={nombre} src={foto} className={classes.avatar} />
      <Typography variant="h6">{nombre}</Typography>
      <Typography variant="body1">{mensaje}</Typography>
    </Grid>
  );
}
