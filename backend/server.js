const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const envPath = path.resolve(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.trim().startsWith("#"))
    .forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      if (key && process.env[key] === undefined) {
        process.env[key] = valueParts.join("=");
      }
    });
}

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sportlife";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`MongoDB conectado: ${MONGO_URI}`);
  })
  .catch((error) => {
    console.error("Error conectando con MongoDB:", error.message);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  userName: { type: String, required: true, unique: true, trim: true },
  city: String,
  email: { type: String, required: true, unique: true, trim: true },
  birthdate: Date,
  password: { type: String, required: true },
  joinedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
});

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  sport: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  locationName: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  participants: { type: Number, required: true, min: 1 },
  participantsList: [{ type: String, ref: "User" }],
  creator: { type: String, ref: "User", required: true },
});

const User = mongoose.model("User", userSchema);
const Event = mongoose.model("Event", eventSchema);

app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGIN }));

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRequiredFields(payload, fields) {
  return fields.filter((field) => !normalizeString(payload[field]));
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  const userObject = user.toObject ? user.toObject() : user;
  const { password, ...publicUser } = userObject;
  return publicUser;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function buildEventPayload(payload) {
  const missingFields = validateRequiredFields(payload, [
    "name",
    "description",
    "sport",
    "date",
    "locationName",
    "location",
    "city",
    "creator",
  ]);

  if (missingFields.length > 0) {
    return { error: `Faltan campos obligatorios: ${missingFields.join(", ")}` };
  }

  const eventDate = new Date(payload.date);
  if (Number.isNaN(eventDate.getTime())) {
    return { error: "La fecha del evento no es valida" };
  }

  const participants = Number(payload.participants);
  if (!Number.isInteger(participants) || participants < 1) {
    return { error: "El numero de participantes debe ser mayor que cero" };
  }

  return {
    value: {
      name: normalizeString(payload.name),
      description: normalizeString(payload.description),
      sport: normalizeString(payload.sport),
      date: eventDate,
      locationName: normalizeString(payload.locationName),
      location: normalizeString(payload.location),
      city: normalizeString(payload.city),
      participants,
      creator: normalizeString(payload.creator),
      participantsList: [],
    },
  };
}

async function joinUserToEvent(eventId, userName) {
  if (!isValidObjectId(eventId)) {
    return { status: 400, body: { message: "El identificador del evento no es valido" } };
  }

  const normalizedUserName = normalizeString(userName);
  if (!normalizedUserName) {
    return { status: 400, body: { message: "El nombre de usuario es requerido" } };
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId).exec(),
    User.findOne({ userName: normalizedUserName }).exec(),
  ]);

  if (!event) {
    return { status: 404, body: { message: "Evento no encontrado" } };
  }
  if (!user) {
    return { status: 404, body: { message: "Usuario no encontrado" } };
  }
  if (event.creator === normalizedUserName) {
    return { status: 400, body: { message: "El creador no puede unirse a su propio evento" } };
  }
  if (event.participantsList.includes(normalizedUserName)) {
    return { status: 409, body: { message: "El usuario ya participa en este evento" } };
  }
  if (event.participantsList.length >= event.participants) {
    return { status: 409, body: { message: "El evento ya no tiene plazas disponibles" } };
  }

  event.participantsList.push(normalizedUserName);
  user.joinedEvents.addToSet(event._id);

  await Promise.all([event.save(), user.save()]);
  return { status: 200, body: { message: "Usuario unido al evento exitosamente", event } };
}

async function cancelUserEvent(eventId, userName) {
  if (!isValidObjectId(eventId)) {
    return { status: 400, body: { message: "El identificador del evento no es valido" } };
  }

  const normalizedUserName = normalizeString(userName);
  if (!normalizedUserName) {
    return { status: 400, body: { message: "El nombre de usuario es requerido" } };
  }

  const [event, user] = await Promise.all([
    Event.findById(eventId).exec(),
    User.findOne({ userName: normalizedUserName }).exec(),
  ]);

  if (!event) {
    return { status: 404, body: { message: "Evento no encontrado" } };
  }
  if (!user) {
    return { status: 404, body: { message: "Usuario no encontrado" } };
  }

  event.participantsList = event.participantsList.filter(
    (participant) => participant !== normalizedUserName
  );
  user.joinedEvents = user.joinedEvents.filter(
    (joinedEventId) => joinedEventId.toString() !== eventId
  );

  await Promise.all([event.save(), user.save()]);
  return { status: 200, body: { message: "Usuario eliminado del evento exitosamente", event } };
}

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/api/register", async (req, res) => {
  try {
    const missingFields = validateRequiredFields(req.body, [
      "firstName",
      "lastName",
      "userName",
      "email",
      "password",
    ]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Faltan campos obligatorios: ${missingFields.join(", ")}`,
      });
    }

    const userName = normalizeString(req.body.userName);
    const email = normalizeString(req.body.email);
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] }).exec();

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Ya existe un usuario con ese usuario o email" });
    }

    const newUser = new User({
      firstName: normalizeString(req.body.firstName),
      lastName: normalizeString(req.body.lastName),
      userName,
      city: normalizeString(req.body.city),
      email,
      birthdate: req.body.birthdate || undefined,
      password: req.body.password,
      joinedEvents: [],
    });

    await newUser.save();
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: toPublicUser(newUser),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar el usuario" });
  }
});

app.post("/api/login", async (req, res) => {
  const userName = normalizeString(req.body.userName);
  const { password } = req.body;

  if (!userName || !password) {
    return res.status(400).json({ message: "Usuario y password son requeridos" });
  }

  try {
    const user = await User.findOne({ userName, password }).exec();
    if (!user) {
      return res.status(401).json({ message: "Credenciales no validas" });
    }

    res.status(200).json({
      message: "Inicio de sesion exitoso",
      username: user.userName,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al iniciar sesion" });
  }
});

app.get("/api/user/:userName", async (req, res) => {
  const userName = normalizeString(req.params.userName);
  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(toPublicUser(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al buscar el usuario" });
  }
});

app.post("/api/events", async (req, res) => {
  try {
    const { value, error } = buildEventPayload(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const creator = await User.findOne({ userName: value.creator }).exec();
    if (!creator) {
      return res.status(404).json({ message: "Usuario creador no encontrado" });
    }

    const newEvent = new Event(value);
    await newEvent.save();
    res.status(201).json({ message: "Evento creado exitosamente", event: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el evento" });
  }
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, _id: 1 }).exec();
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la lista de eventos" });
  }
});

app.get("/api/user/:userName/events", async (req, res) => {
  const userName = normalizeString(req.params.userName);
  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userEvents = await Event.find({ creator: userName }).sort({ date: 1, _id: 1 }).exec();
    res.status(200).json(userEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la lista de eventos del usuario" });
  }
});

app.post("/api/events/:eventId/participants/:userName", async (req, res) => {
  try {
    const result = await joinUserToEvent(req.params.eventId, req.params.userName);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al agregar usuario al evento" });
  }
});

app.post("/api/user/:userName/joinEvent/:eventId", async (req, res) => {
  try {
    const result = await joinUserToEvent(req.params.eventId, req.params.userName);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al unir al usuario al evento" });
  }
});

app.post("/api/events/:eventId/join", async (req, res) => {
  try {
    const result = await joinUserToEvent(req.params.eventId, req.body.userName);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al unir al usuario al evento" });
  }
});

app.delete("/api/events/:eventId/join/:userName", async (req, res) => {
  try {
    const result = await cancelUserEvent(req.params.eventId, req.params.userName);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al cancelar la participacion" });
  }
});

app.get("/api/user/:userName/joinedEvents", async (req, res) => {
  const userName = normalizeString(req.params.userName);
  try {
    const user = await User.findOne({ userName }).exec();
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const joinedEvents = await Event.find({ _id: { $in: user.joinedEvents } })
      .sort({ date: 1, _id: 1 })
      .exec();
    res.status(200).json(joinedEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los eventos unidos del usuario" });
  }
});

app.delete("/api/events/:eventId/participants/:userName", async (req, res) => {
  try {
    const result = await cancelUserEvent(req.params.eventId, req.params.userName);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar usuario del evento" });
  }
});

app.delete("/api/events/:eventId", async (req, res) => {
  const { eventId } = req.params;

  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ message: "El identificador del evento no es valido" });
  }

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId).exec();
    if (!deletedEvent) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    await User.updateMany(
      { joinedEvents: deletedEvent._id },
      { $pull: { joinedEvents: deletedEvent._id } }
    ).exec();

    res.status(200).json({ message: "Evento eliminado correctamente", eventId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el evento" });
  }
});

app.delete("/api/user/:userName/events/:eventId", async (req, res) => {
  try {
    const result = await cancelUserEvent(req.params.eventId, req.params.userName);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar evento del usuario" });
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});
