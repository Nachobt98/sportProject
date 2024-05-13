import React, { useState, useEffect } from "react";
import { Button, Container, Grid, TextField, Typography } from "@mui/material";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@mui/styles";
import img8 from "../img/img8.jpg";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { BorderColor } from "@mui/icons-material";
const useStyles = makeStyles((theme) => ({
  background: {
    backgroundImage: `url(${img8})`,
    backgroundSize: "cover",
    height: "2300px",
  },
  root: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: "2300px",
  },
  grid: {
    marginLeft: "20rem",
    marginRight: "20rem",
    marginBottom: "10rem",
  },

  gridDetails: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  gridemail: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    gap: "20px",
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c59c00",
  },
}));
export function Contact() {
  const classes = useStyles();
  const [contactData, setConactData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Nombre es requerido"),
    email: Yup.string().required("Correo es requerido"),
    message: Yup.string().required("Mensaje es requerido"),
  });
  return (
    <Grid className={classes.background}>
      <Container
        className={classes.root}
        maxWidth="100%"
        sx={{ marginTop: "40px" }}
      >
        <Typography
          variant="h2"
          color="secondary"
          align="center"
          gutterBottom
          sx={{ background: "none" }}
        >
          CONTACTANOS
        </Typography>
        <Grid className={classes.grid}>
          <Formik
            initialValues={{
              name: contactData.name,
              email: contactData.emal,
              message: contactData.message,
            }}
            validationSchema={validationSchema}
            onSubmit={console.log("asdasd")}
          >
            {(formikProps) => (
              <Form className={classes.form}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h5">Nombre</Typography>
                    <Field
                      type="text"
                      name="name"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                      id="name"
                      autoComplete="off"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5">Correo electronico</Typography>
                    <Field
                      type="email"
                      name="email"
                      as={TextField}
                      variant="outlined"
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5">Mensaje</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      style={{ marginBottom: "10px" }}
                    />
                  </Grid>
                </Grid>
                <Grid sx={{ marginTop: "2rem" }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    className={classes.submit}
                  >
                    Enviar
                  </Button>
                </Grid>
              </Form>
            )}
          </Formik>
        </Grid>
        <Grid className={classes.gridemail}>
          <div className={classes.iconBackground}>
            <LocalPhoneRoundedIcon sx={{ width: 80, height: 80 }} />
          </div>
          <Typography variant="h5" color="secondary">
            93 767 786 7867
          </Typography>
        </Grid>
      </Container>
    </Grid>
  );
}
