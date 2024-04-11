// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
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
  userName: String,
  city: String,
  email: String,
  birthdate: Date,
  password: String,
});
const Event = mongoose.model("Event", {
  name: String,
  description: String,
  sport: String,
  date: Date,
  location: String,
  city: String,
  participants: Number,
});
app.use(bodyParser.json());

app.use(cors());
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

// Ruta para manejar el inicio de sesión
app.post("/api/login", async (req, res) => {
  const { userName, password } = req.body;
  try {
    const user = await User.findOne({ userName, password }).exec();
    if (user) {
      res
        .status(200)
        .json({ message: "Inicio de sesión exitoso", username: user.userName });
    } else {
      res.status(401).json({ message: "Credenciales no válidas" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

// Ruta para buscar un usuario por su nombre de usuario
app.get("/api/user/:userName", async (req, res) => {
  const userName = req.params.userName;
  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar el usuario" });
  }
});

// Ruta para manejar la creación de eventos
app.post("/api/events", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    console.log("Evento creado exitosamente:", newEvent); // Imprime el objeto completo del evento en la consola del servidor
    res
      .status(201)
      .json({ message: "Evento creado exitosamente", event: newEvent }); // Aquí se incluye el objeto del evento en la respuesta
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el evento" });
  }
});

// Ruta para obtener la lista de eventos
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().exec();
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la lista de eventos" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
