const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
const DEMO_PASSWORD = "Dev123";
const PASSWORD_HASH_ROUNDS = 10;

const DEMO_USERS = [
  {
    firstName: "Dev",
    lastName: "User",
    userName: "dev",
    city: "Madrid",
    email: "dev@sportlife.local",
    birthdate: new Date("1990-01-01"),
  },
  {
    firstName: "Alex",
    lastName: "Runner",
    userName: "alex",
    city: "Valencia",
    email: "alex@sportlife.local",
    birthdate: new Date("1993-04-12"),
  },
  {
    firstName: "Marta",
    lastName: "Padel",
    userName: "marta",
    city: "Barcelona",
    email: "marta@sportlife.local",
    birthdate: new Date("1995-08-22"),
  },
];

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(18, 30, 0, 0);
  return date;
}

function buildDemoEvents(usersByName) {
  const dev = usersByName.dev;
  const alex = usersByName.alex;
  const marta = usersByName.marta;

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
      description: "Evento cancelado que solo aparece en perfiles vinculados hasta que cada usuario lo borre de su perfil.",
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

async function upsertDemoUsers(usersCollection) {
  const password = await bcrypt.hash(DEMO_PASSWORD, PASSWORD_HASH_ROUNDS);

  await Promise.all(
    DEMO_USERS.map((user) =>
      usersCollection.updateOne(
        { userName: user.userName },
        {
          $set: {
            ...user,
            password,
          },
          $setOnInsert: {
            joinedEvents: [],
          },
        },
        { upsert: true }
      )
    )
  );

  const users = await usersCollection
    .find({ userName: { $in: DEMO_USERS.map((user) => user.userName) } })
    .toArray();

  return Object.fromEntries(users.map((user) => [user.userName, user]));
}

async function seedDevEvents() {
  await mongoose.connect(MONGO_URI);
  const usersCollection = mongoose.connection.db.collection("users");
  const eventsCollection = mongoose.connection.db.collection("events");

  const usersByName = await upsertDemoUsers(usersCollection);
  const events = buildDemoEvents(usersByName);

  await Promise.all(
    events.map((event) =>
      eventsCollection.updateOne(
        { name: event.name },
        { $set: event },
        { upsert: true }
      )
    )
  );

  const storedEvents = await eventsCollection
    .find({ name: { $in: events.map((event) => event.name) } })
    .toArray();
  const eventsByName = Object.fromEntries(storedEvents.map((event) => [event.name, event]));

  await usersCollection.updateOne(
    { userName: "dev" },
    {
      $set: {
        joinedEvents: [
          eventsByName["Full demo - Futbol 5 completo"]._id,
          eventsByName["Cancelled demo - Baloncesto cancelado"]._id,
        ],
      },
    }
  );
  await usersCollection.updateOne(
    { userName: "alex" },
    {
      $set: {
        joinedEvents: [
          eventsByName["Open demo - Padel en Valencia"]._id,
          eventsByName["Full demo - Futbol 5 completo"]._id,
          eventsByName["Cancelled demo - Baloncesto cancelado"]._id,
        ],
      },
    }
  );
  await usersCollection.updateOne(
    { userName: "marta" },
    {
      $set: {
        joinedEvents: [eventsByName["Past demo - Tenis con fecha pasada"]._id],
      },
    }
  );

  console.log("Demo local actualizada.");
  console.log("Usuarios: dev, alex, marta.");
  console.log(`Password: ${DEMO_PASSWORD}`);
  console.log("Eventos: open, full, cancelled y past.");
  await mongoose.disconnect();
}

seedDevEvents().catch(async (error) => {
  console.error("No se pudo crear la demo local:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
