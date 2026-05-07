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
const DEV_USER = {
  firstName: "Dev",
  lastName: "User",
  userName: "dev",
  city: "Madrid",
  email: "dev@sportlife.local",
  birthdate: new Date("1990-01-01"),
  password: "Dev123",
  joinedEvents: [],
};

async function seedDevUser() {
  await mongoose.connect(MONGO_URI);

  const users = mongoose.connection.db.collection("users");
  const existingUser = await users.findOne({ userName: DEV_USER.userName });

  if (existingUser) {
    await users.updateOne(
      { userName: DEV_USER.userName },
      { $set: { ...DEV_USER, joinedEvents: existingUser.joinedEvents || [] } }
    );
    console.log("Usuario dev actualizado.");
  } else {
    await users.insertOne(DEV_USER);
    console.log("Usuario dev creado.");
  }

  console.log("Credenciales locales:");
  console.log("  Usuario: dev");
  console.log("  Password: Dev123");

  await mongoose.disconnect();
}

seedDevUser().catch(async (error) => {
  console.error("No se pudo crear el usuario dev:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
