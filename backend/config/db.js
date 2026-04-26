const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");

loadEnvFile(path.resolve(__dirname, "..", ".env"));

const databaseConfig = {
  host: getRequiredEnv("DB_HOST"),
  port: Number(process.env.DB_PORT || "3306"),
  user: getRequiredEnv("DB_USER"),
  password: process.env.DB_PASSWORD || "",
  database: getRequiredEnv("DB_NAME"),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || "10"),
  queueLimit: 0,
};

const pool = mysql.createPool(databaseConfig);

module.exports = pool;

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to backend/.env before starting the backend.`,
    );
  }

  return value;
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) {
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
