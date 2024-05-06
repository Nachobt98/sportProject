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
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});
const Event = mongoose.model("Event", {
  name: String,
  description: String,
  sport: String,
  date: Date,
  location: String,
  city: String,
  participants: Number,
  participantsList: [
    {
      type: mongoose.Schema.Types.String,
      ref: "User",
    },
  ],
  creator: {
    type: mongoose.Schema.Types.String,
    ref: "User",
  },
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
// Ruta para obtener la lista de eventos de un usuario específico
app.get("/api/user/:userName/events", async (req, res) => {
  const userName = req.params.userName;
  try {
    // Busca al usuario por su nombre de usuario
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Busca todos los eventos creados por ese usuario
    const userEvents = await Event.find({ creator: userName }).exec();
    res.status(200).json(userEvents);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener la lista de eventos del usuario" });
  }
});
app.post("/api/events/:eventId/participants/:userName", async (req, res) => {
  const eventId = req.params.eventId;
  const userName = req.params.userName;
  try {
    const event = await Event.findById(eventId).exec();
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }
    // Asegúrate de que el usuario no esté ya en la lista de participantes
    if (event.participantsList.includes(userName)) {
      return res
        .status(400)
        .json({ message: "El usuario ya está participando en este evento" });
    }
    // Agregar el usuario a la lista de participantes
    event.participantsList.push(userName);
    await event.save();
    res
      .status(200)
      .json({ message: "Usuario añadido correctamente al evento" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al agregar usuario al evento" });
  }
});

// Ruta para que un usuario se una a un evento
app.post("/api/user/:userName/joinEvent/:eventId", async (req, res) => {
  const { userName, eventId } = req.params;
  try {
    // Buscar al usuario por su nombre de usuario
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Añadir el ID del evento a la lista de eventos unidos del usuario
    user.joinedEvents.push(eventId);
    await user.save();
    res.status(200).json({ message: "Usuario unido al evento exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al unir al usuario al evento" });
  }
});
// Ruta para obtener todos los eventos a los que el usuario está unido
app.get("/api/user/:userName/joinedEvents", async (req, res) => {
  const userName = req.params.userName;
  try {
    // Buscar al usuario por su nombre de usuario
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Buscar todos los eventos a los que el usuario está unido
    const joinedEvents = await Event.find({
      _id: { $in: user.joinedEvents },
    }).exec();
    res.status(200).json(joinedEvents);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener los eventos unidos del usuario" });
  }
});

app.delete("/api/events/:eventId/participants/:userName", async (req, res) => {
  const eventId = req.params.eventId;
  const userName = req.params.userName;
  try {
    const event = await Event.findById(eventId).exec();
    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    // Remover el usuario de la lista de participantes
    event.participantsList = event.participantsList.filter(
      (participant) => participant !== userName
    );
    await event.save();

    res
      .status(200)
      .json({ message: "Usuario eliminado correctamente del evento" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar usuario del evento" });
  }
});

app.delete("/api/events/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  try {
    // Buscar el evento por su ID y eliminarlo de la base de datos
    await Event.findByIdAndDelete(eventId).exec();
    res.status(200).json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el evento" });
  }
});

app.delete("/api/user/:userName/events/:eventId", async (req, res) => {
  const eventId = req.params.eventId;
  const userName = req.params.userName;
  try {
    // Buscar al usuario por su nombre de usuario
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Remover el evento de la lista de eventos del usuario
    user.joinedEvents = user.joinedEvents.filter(
      (event) => event.toString() !== eventId
    );
    await user.save();

    res
      .status(200)
      .json({ message: "Evento eliminado correctamente del usuario" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar evento del usuario" });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {});
