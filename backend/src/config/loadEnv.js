const fs = require("fs");
const path = require("path");

function loadLocalEnv() {
  const envPath = path.resolve(__dirname, "..", "..", "..", ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

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

module.exports = { loadLocalEnv };
