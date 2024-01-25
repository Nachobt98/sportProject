// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 5000;

// Conéctate a MongoDB (asegúrate de tener un servidor MongoDB en ejecución)
mongoose.connect("mongodb://localhost:27017/sportlife", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el modelo de Usuario
const User = mongoose.model("User", {
  firstName: String,
  lastName: String,
  city: String,
  email: String,
  birthdate: Date,
});

app.use(bodyParser.json());

// Ruta para manejar el registro de usuarios
app.post("/api/register", async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
