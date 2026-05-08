const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

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

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/sportlife";

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(18, 30, 0, 0);
  return date;
}

function requireUser(usersByName, userName) {
  const user = usersByName[userName];
  if (!user) {
    throw new Error(`Falta el usuario demo ${userName}. Crea usuarios dev, alex y marta antes de ejecutar este seed.`);
  }
  return user;
}

function buildDemoEvents(usersByName) {
  const dev = requireUser(usersByName, "dev");
  const alex = requireUser(usersByName, "alex");
  const marta = requireUser(usersByName, "marta");

  return [
    {
      name: "Open demo - Padel en Valencia",
      description: "Evento abierto con plazas libres para probar el flujo de unirse.",
      sport: "Padel",
      date: addDays(7),
      locationName: "Pistas municipales de Valencia",
      location: "Valencia",
      city: "Valencia",
      participants: 4,
      participantsList: [alex._id],
      creator: dev._id,
      status: "open",
      dismissedBy: [],
    },
    {
      name: "Full demo - Futbol 5 completo",
      description: "Evento abierto pero sin plazas libres; debe verse como full y bloquear nuevas inscripciones.",
      sport: "Futbol",
      date: addDays(10),
      locationName: "Campo demo norte",
      location: "Madrid",
      city: "Madrid",
      participants: 2,
      participantsList: [dev._id, alex._id],
      creator: marta._id,
      status: "open",
      dismissedBy: [],
    },
    {
      name: "Cancelled demo - Baloncesto cancelado",
      description: "Evento cancelado que solo aparece en perfiles vinculados hasta que cada usuario lo quite.",
      sport: "Baloncesto",
      date: addDays(12),
      locationName: "Pabellon demo",
      location: "Barcelona",
      city: "Barcelona",
      participants: 6,
      participantsList: [dev._id, alex._id],
      creator: marta._id,
      status: "cancelled",
      dismissedBy: [],
    },
    {
      name: "Past demo - Tenis con fecha pasada",
      description: "Evento pasado; el creador puede cambiar la fecha para reactivarlo.",
      sport: "Tenis",
      date: addDays(-5),
      locationName: "Club demo central",
      location: "Valencia",
      city: "Valencia",
      participants: 2,
      participantsList: [marta._id],
      creator: dev._id,
      status: "open",
      dismissedBy: [],
    },
  ];
}

async function seedDevEvents() {
  await mongoose.connect(MONGO_URI);
  const usersCollection = mongoose.connection.db.collection("users");
  const eventsCollection = mongoose.connection.db.collection("events");

  const users = await usersCollection.find({ userName: { $in: ["dev", "alex", "marta"] } }).toArray();
  const usersByName = Object.fromEntries(users.map((user) => [user.userName, user]));
  const events = buildDemoEvents(usersByName);

  await Promise.all(events.map((event) =>
    eventsCollection.updateOne(
      { name: event.name },
      { $set: event },
      { upsert: true }
    )
  ));

  const storedEvents = await eventsCollection.find({ name: { $in: events.map((event) => event.name) } }).toArray();
  const eventsByName = Object.fromEntries(storedEvents.map((event) => [event.name, event]));

  await usersCollection.updateOne(
    { userName: "dev" },
    { $set: { joinedEvents: [eventsByName["Full demo - Futbol 5 completo"]._id, eventsByName["Cancelled demo - Baloncesto cancelado"]._id] } }
  );
  await usersCollection.updateOne(
    { userName: "alex" },
    { $set: { joinedEvents: [eventsByName["Open demo - Padel en Valencia"]._id, eventsByName["Full demo - Futbol 5 completo"]._id, eventsByName["Cancelled demo - Baloncesto cancelado"]._id] } }
  );
  await usersCollection.updateOne(
    { userName: "marta" },
    { $set: { joinedEvents: [eventsByName["Past demo - Tenis con fecha pasada"]._id] } }
  );

  console.log("Eventos demo actualizados: open, full, cancelled y past.");
  await mongoose.disconnect();
}

seedDevEvents().catch(async (error) => {
  console.error("No se pudieron crear los eventos demo:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
