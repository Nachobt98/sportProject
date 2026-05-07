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
const PASSWORD_HASH_ROUNDS = 10;
const DEV_PASSWORD = "Dev123";
const DEV_USER = {
  firstName: "Dev",
  lastName: "User",
  userName: "dev",
  city: "Madrid",
  email: "dev@sportlife.local",
  birthdate: new Date("1990-01-01"),
  joinedEvents: [],
};

async function seedDevUser() {
  await mongoose.connect(MONGO_URI);

  const users = mongoose.connection.db.collection("users");
  const existingUser = await users.findOne({ userName: DEV_USER.userName });
  const password = await bcrypt.hash(DEV_PASSWORD, PASSWORD_HASH_ROUNDS);

  if (existingUser) {
    await users.updateOne(
      { userName: DEV_USER.userName },
      {
        $set: {
          ...DEV_USER,
          password,
          joinedEvents: existingUser.joinedEvents || [],
        },
      }
    );
    console.log("Usuario dev actualizado.");
  } else {
    await users.insertOne({ ...DEV_USER, password });
    console.log("Usuario dev creado.");
  }

  console.log("Credenciales locales:");
  console.log("  Usuario: dev");
  console.log(`  Password: ${DEV_PASSWORD}`);

  await mongoose.disconnect();
}

seedDevUser().catch(async (error) => {
  console.error("No se pudo crear el usuario dev:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
