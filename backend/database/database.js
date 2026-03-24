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

const initialEvents = [
  {
    title: "DEAwakening Valencia",
    slug: "deawakening-valencia",
    date: "2026-05-10",
    location: "Valencia",
    description:
      "A guided live experience focused on personal growth, emotional presence and grounded inner transformation."
  },
  {
    title: "DEAwakening Madrid",
    slug: "deawakening-madrid",
    date: "2026-06-14",
    location: "Madrid",
    description:
      "An immersive event for people seeking clarity, embodied awareness and more conscious relationships."
  },
  {
    title: "DEAwakening Barcelona",
    slug: "deawakening-barcelona",
    date: "2026-07-05",
    location: "Barcelona",
    description:
      "A transformational gathering designed to help participants reconnect with themselves and move beyond limiting patterns."
  },
  {
    title: "DEAwakening Malaga",
    slug: "deawakening-malaga",
    date: "2026-09-20",
    location: "Malaga",
    description:
      "A community-centered event that brings together therapeutic depth, practical tools and lasting integration."
  }
];

export function run(query, params = []) {
  return new Promise((resolve, reject) => {
    database.run(query, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes
      });
    });
  });
}

export function get(query, params = []) {
  return new Promise((resolve, reject) => {
    database.get(query, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row ?? null);
    });
  });
}

export function all(query, params = []) {
  return new Promise((resolve, reject) => {
    database.all(query, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows ?? []);
    });
  });
}

export async function initializeDatabase() {
  await run("PRAGMA foreign_keys = ON");

  await run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      event_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  const eventCount = await get("SELECT COUNT(*) AS count FROM events");

  if ((eventCount?.count ?? 0) === 0) {
    for (const event of initialEvents) {
      await run(
        `
          INSERT INTO events (title, slug, date, location, description)
          VALUES (?, ?, ?, ?, ?)
        `,
        [event.title, event.slug, event.date, event.location, event.description]
      );
    }
  }
}

export default database;
