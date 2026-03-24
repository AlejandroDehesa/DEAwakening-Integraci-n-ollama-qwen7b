import path from "path";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

sqlite3.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const databasePath = path.join(__dirname, "deawakening.sqlite");

const database = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("SQLite connection error:", error.message);
    return;
  }

  console.log("SQLite connected");
});

export default database;
