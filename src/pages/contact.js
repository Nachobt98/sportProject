import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Grid,
  MenuItem,
  TextField,
  Typography,
  TextareaAutosize,
} from "@mui/material";
import AddIcCallTwoToneIcon from "@mui/icons-material/AddIcCallTwoTone";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    margin: "2rem",
  },
  gridOnline: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
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
        <Typography variant="h2" color="secondary" align="center" gutterBottom>
          CONTACTANOS
        </Typography>
        <Grid className={classes.grid}>
          <Grid className="gridOnline">
            <Typography
              variant="h2"
              color="secondary"
              align="center"
              gutterBottom
              sx={{ background: "none" }}
            >
              Contacta online
            </Typography>
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
                      <Typography variant="h5" color="textSecondary">
                        Nombre
                      </Typography>
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
                      <Typography variant="h5" color="textSecondary">
                        Correo electronico
                      </Typography>
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
                      <Typography variant="h5" color="textSecondary">
                        Mensaje
                      </Typography>
                      <Field
                        type="message"
                        name="message"
                        as={TextareaAutosize}
                        rowsMin={3}
                        style={{
                          width: "100%",
                          resize: "vertical",
                          backgroundColor: "transparent",
                        }}
                        required
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
          <Grid className="gridDetails">
            <Typography
              variant="h2"
              color="secondary"
              align="center"
              gutterBottom
              sx={{ background: "none" }}
            >
              Detalles de contacto
            </Typography>
            <Grid className="gridemail">
              <AddIcCallTwoToneIcon color="secondary" />
              <div>93 767 786 7867</div>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  );
}
