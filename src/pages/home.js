import { Header } from "../components/header";
import { Carousel } from "../components/carousel";
import { Grid, Avatar, Typography } from "@mui/material";
import avatar2 from "../img/avatar2.jpeg";
import avatar from "../img/avatar.png";
import avatar3 from "../img/avatar3.jpg";
import avatar4 from "../img/pexels-stefan-stefancik-91227.jpg";
import { makeStyles } from "@mui/styles";
const useStyles = makeStyles((theme) => ({
  grid: {
    display: "flex",
    flexDirection: "row",
  },
  testimonio: {
    textAlign: "center",
    padding: theme.spacing(2),
    width: "30%",
  },
  avatar: {
    width: theme.spacing(10),
    height: theme.spacing(10),
    margin: "auto",
  },
}));
export function Home() {
  const classes = useStyles();

  return (
    <Grid>
      <Carousel />
      <Grid className={classes.grid}>
        <Grid item xs={12} sm={6} md={3} className={classes.testimonio}>
          <Typography variant="body1" color="secondary">
            <Grid marginBottom={4}>
              {
                "¡Saludos, equipo deportivo! No puedo expresar con palabras cuánto ha cambiado mi vida desde que me uní a esta plataforma. Antes solía luchar con la motivación para mantenerme activo, pero ahora, gracias a los eventos deportivos que encuentro aquí, ¡no puedo esperar para salir y moverme! He conocido a personas increíbles, he mejorado mi estado físico y mental, y he descubierto una pasión por el deporte que nunca supe que tenía. ¡Estoy agradecido todos los días por esta comunidad que me ha ayudado a transformar mi vida!"
              }
            </Grid>
            <Avatar
              alt={"Nacho Bru Tarin"}
              src={avatar2}
              className={classes.avatar}
            />
            <Typography variant="h6" color={"black"}>
              {" Nacho Bru Tarin"}
            </Typography>
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={3} className={classes.testimonio}>
          <Typography variant="body1" color="secondary">
            <Grid marginBottom={4}>
              {
                " Antes, solía ser bastante sedentario, pero desde que empecé a unirme a eventos deportivos aquí, ¡mi vida ha dado un giro de 180 grados! Ahora, cada fin de semana estoy participando en carreras, partidos de fútbol y otros eventos emocionantes. Me siento más saludable, más enérgico y más conectado con mi comunidad. ¡Gracias a todos los organizadores y participantes por hacer de esto una experiencia tan increíble!"
              }
            </Grid>

            <Avatar
              alt={"Adrian Perez Lopez"}
              src={avatar4}
              className={classes.avatar}
            />
            <Typography variant="h6" color={"black"}>
              {" Adrian Perez Lopez"}
            </Typography>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={3} className={classes.testimonio}>
          <Typography variant="body1" color="secondary">
            <Grid marginBottom={4}>
              {
                "¡Hola, amigos deportistas! Quiero compartirles cómo este sitio web ha tenido un impacto tan positivo en mi vida. Antes, estaba atrapado en una rutina monótona y poco saludable, pero desde que me sumergí en los eventos deportivos aquí, ¡mi vida ha tomado un giro totalmente nuevo! Ahora, cada semana estoy emocionado de participar en diferentes actividades, desde partidos de baloncesto hasta sesiones de yoga al aire libre. Me siento más fuerte, más feliz y más conectado con mi cuerpo y mi entorno. ¡Gracias a esta comunidad por inspirarme a vivir una vida más activa y vibrante!"
              }
            </Grid>
            <Avatar
              alt={"Raul Fernandez Iglesias"}
              src={avatar3}
              className={classes.avatar}
            />
            <Typography variant="h6" color={"black"}>
              {"Raul Fernandez Iglesias"}
            </Typography>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}
