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
  },
  {
    title: "DEAwakening Sevilla",
    slug: "deawakening-sevilla",
    date: "2026-10-04",
    location: "Sevilla",
    description:
      "A spacious and grounded gathering to support emotional release, nervous system balance and conscious embodiment."
  },
  {
    title: "DEAwakening Bilbao",
    slug: "deawakening-bilbao",
    date: "2026-10-25",
    location: "Bilbao",
    description:
      "An intensive group experience focused on clarity, resilience and practical integration in daily life."
  },
  {
    title: "DEAwakening Zaragoza",
    slug: "deawakening-zaragoza",
    date: "2026-11-08",
    location: "Zaragoza",
    description:
      "A guided process that combines therapeutic precision, spiritual openness and warm human connection."
  },
  {
    title: "DEAwakening Alicante",
    slug: "deawakening-alicante",
    date: "2026-11-22",
    location: "Alicante",
    description:
      "A transformational event for participants who want to reconnect with purpose, body awareness and emotional depth."
  },
  {
    title: "DEAwakening Granada",
    slug: "deawakening-granada",
    date: "2026-12-06",
    location: "Granada",
    description:
      "A premium community space where inner work, presence and collective support create sustainable change."
  },
  {
    title: "DEAwakening Palma",
    slug: "deawakening-palma",
    date: "2027-01-17",
    location: "Palma",
    description:
      "A restorative and insightful gathering designed to help people soften, listen and realign with what matters."
  },
  {
    title: "DEAwakening San Sebastian",
    slug: "deawakening-san-sebastian",
    date: "2027-02-07",
    location: "San Sebastian",
    description:
      "A live experience where body intelligence and therapeutic depth support lasting personal transformation."
  },
  {
    title: "DEAwakening Murcia",
    slug: "deawakening-murcia",
    date: "2027-02-28",
    location: "Murcia",
    description:
      "A focused event for people ready to move through emotional blocks with clarity, safety and embodied awareness."
  },
  {
    title: "DEAwakening Santiago de Compostela",
    slug: "deawakening-santiago-compostela",
    date: "2027-03-21",
    location: "Santiago de Compostela",
    description:
      "A deeply human gathering that invites participants into honest reflection, healing contact and renewed vitality."
  },
  {
    title: "DEAwakening Las Palmas",
    slug: "deawakening-las-palmas",
    date: "2027-04-18",
    location: "Las Palmas",
    description:
      "A conscious group journey blending therapeutic support, collective presence and practical tools for integration."
  }
];

const initialEventSpanishTranslations = {
  "deawakening-valencia": {
    title: "DEAwakening Valencia",
    location: "Valencia",
    description:
      "Una experiencia presencial guiada para crecimiento personal, presencia emocional y una transformacion interior con los pies en la tierra."
  },
  "deawakening-madrid": {
    title: "DEAwakening Madrid",
    location: "Madrid",
    description:
      "Un encuentro inmersivo para personas que buscan claridad, conciencia corporal y relaciones mas conscientes."
  },
  "deawakening-barcelona": {
    title: "DEAwakening Barcelona",
    location: "Barcelona",
    description:
      "Un encuentro transformador disenado para reconectar con uno mismo y soltar patrones que ya no sostienen la vida."
  },
  "deawakening-malaga": {
    title: "DEAwakening Malaga",
    location: "Malaga",
    description:
      "Un evento centrado en comunidad, profundidad terapeutica y herramientas practicas para integrar el cambio."
  },
  "deawakening-sevilla": {
    title: "DEAwakening Sevilla",
    location: "Sevilla",
    description:
      "Un encuentro amplio y con arraigo para facilitar liberacion emocional, regulacion del sistema nervioso y presencia corporal."
  },
  "deawakening-bilbao": {
    title: "DEAwakening Bilbao",
    location: "Bilbao",
    description:
      "Una experiencia intensiva de grupo enfocada en claridad, resiliencia e integracion practica en la vida diaria."
  },
  "deawakening-zaragoza": {
    title: "DEAwakening Zaragoza",
    location: "Zaragoza",
    description:
      "Un proceso guiado que une precision terapeutica, apertura espiritual y una conexion humana calida."
  },
  "deawakening-alicante": {
    title: "DEAwakening Alicante",
    location: "Alicante",
    description:
      "Un evento transformador para personas que desean reconectar con su proposito, su cuerpo y su profundidad emocional."
  },
  "deawakening-granada": {
    title: "DEAwakening Granada",
    location: "Granada",
    description:
      "Un espacio premium de comunidad donde trabajo interior, presencia y apoyo colectivo generan cambios sostenibles."
  },
  "deawakening-palma": {
    title: "DEAwakening Palma",
    location: "Palma",
    description:
      "Un encuentro restaurativo y revelador para soltar tension, escuchar el cuerpo y realinearse con lo esencial."
  },
  "deawakening-san-sebastian": {
    title: "DEAwakening San Sebastian",
    location: "San Sebastian",
    description:
      "Una experiencia en vivo donde inteligencia corporal y profundidad terapeutica impulsan una transformacion real."
  },
  "deawakening-murcia": {
    title: "DEAwakening Murcia",
    location: "Murcia",
    description:
      "Un evento enfocado en atravesar bloqueos emocionales con claridad, seguridad y conciencia corporal."
  },
  "deawakening-santiago-compostela": {
    title: "DEAwakening Santiago de Compostela",
    location: "Santiago de Compostela",
    description:
      "Un encuentro profundamente humano que abre espacio para reflexion honesta, contacto terapeutico y nueva vitalidad."
  },
  "deawakening-las-palmas": {
    title: "DEAwakening Las Palmas",
    location: "Las Palmas",
    description:
      "Un viaje consciente en grupo que combina soporte terapeutico, presencia colectiva y herramientas para integrar."
  }
};

const initialSiteSections = {
  "home.hero": {
    en: {
      title:
        "Awaken through live experiences that feel grounded, intimate and transformational.",
      subtitle: "DEAwakening with David Biddle",
      body:
        "A premium space for personal growth, therapeutic depth and conscious community, created for people ready to meet themselves more honestly."
    },
    es: {
      title:
        "Despierta a traves de experiencias en vivo intimas, profundas y transformadoras.",
      subtitle: "DEAwakening con David Biddle",
      body:
        "Un espacio premium para crecimiento personal, profundidad terapeutica y comunidad consciente, creado para personas listas para encontrarse con mas verdad."
    }
  },
  "home.value": {
    en: {
      title: "DEAwakening is built on presence, depth and human connection.",
      subtitle:
        "Each gathering is designed to create a felt experience rather than surface inspiration.",
      body:
        "Community: Honest spaces where people can connect with warmth and presence.\nEvents: Guided gatherings that blend insight, embodiment and human depth.\nExperiences: Transformational moments designed for lasting integration."
    },
    es: {
      title: "DEAwakening se construye sobre presencia, profundidad y conexion humana.",
      subtitle:
        "Cada encuentro esta disenado para generar una experiencia vivida, no solo inspiracion superficial.",
      body:
        "Comunidad: Espacios honestos donde las personas pueden encontrarse con calidez y presencia.\nEventos: Encuentros guiados que unen claridad, cuerpo y profundidad humana.\nExperiencias: Momentos transformadores pensados para una integracion real."
    }
  },
  "about.main": {
    en: {
      title:
        "DEAwakening is a space for honest transformation led by David Biddle.",
      subtitle:
        "The work brings together personal growth, therapeutic depth and spiritual openness without losing warmth or humanity.",
      body:
        "What DEAwakening is: In-person experiences where people can slow down, reconnect and move through change with real support.\nMission: Help people access deeper presence, emotional honesty and meaningful transformation.\nExperiences: Guided events that combine reflection, embodied practice and conscious community.\nWho it is for: People ready for growth that feels grounded, safe and deeply human."
    },
    es: {
      title:
        "DEAwakening es un espacio para la transformacion honesta guiado por David Biddle.",
      subtitle:
        "Este trabajo une crecimiento personal, profundidad terapeutica y apertura espiritual sin perder calidez ni humanidad.",
      body:
        "Que es DEAwakening: Experiencias presenciales donde las personas pueden parar, reconectar y atravesar cambios con apoyo real.\nMision: Ayudar a las personas a acceder a mas presencia, honestidad emocional y transformacion con sentido.\nExperiencias: Eventos guiados que combinan reflexion, practica corporal y comunidad consciente.\nPara quien es: Personas listas para un crecimiento con profundidad, seguridad y humanidad."
    }
  },
  "host.main": {
    en: {
      title: "Bring DEAwakening to your venue, retreat or community.",
      subtitle:
        "We collaborate with aligned hosts who want to offer a premium and transformational experience.",
      body:
        "What collaboration looks like: We shape each event with care so it fits the audience, venue and intention while preserving the DEAwakening experience.\nIdeal partners: Retreat centers, conscious communities, studios and facilitators who value depth, professionalism and human connection."
    },
    es: {
      title: "Lleva DEAwakening a tu espacio, retiro o comunidad.",
      subtitle:
        "Colaboramos con anfitriones alineados que desean ofrecer una experiencia premium y transformadora.",
      body:
        "Como es la colaboracion: Damos forma a cada evento con cuidado para que encaje con la audiencia, el espacio y la intencion sin perder la esencia DEAwakening.\nSocios ideales: Centros de retiro, comunidades conscientes, estudios y facilitadores que valoran profundidad, profesionalidad y conexion humana."
    }
  },
  "contact.main": {
    en: {
      title: "Get in touch",
      subtitle:
        "Use this space for event enquiries, collaboration ideas or general questions about DEAwakening.",
      body:
        "We read every message with care and aim to respond with clarity, warmth and professionalism."
    },
    es: {
      title: "Ponte en contacto",
      subtitle:
        "Usa este espacio para preguntas sobre eventos, ideas de colaboracion o consultas generales sobre DEAwakening.",
      body:
        "Leemos cada mensaje con atencion y buscamos responder con claridad, calidez y profesionalidad."
    }
  }
};

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

async function insertSiteSectionTranslation(sectionId, languageCode, content) {
  const timestamp = new Date().toISOString();

  await run(
    `
      INSERT INTO site_section_translations (
        section_id,
        language_code,
        title,
        subtitle,
        body,
        extra_json,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      sectionId,
      languageCode,
      content.title,
      content.subtitle,
      content.body,
      "{}",
      timestamp,
      timestamp
    ]
  );
}

async function insertEventTranslation(eventId, languageCode, translation) {
  const timestamp = new Date().toISOString();

  await run(
    `
      INSERT INTO event_translations (
        event_id,
        language_code,
        title,
        location,
        description,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      eventId,
      languageCode,
      translation.title,
      translation.location,
      translation.description,
      timestamp,
      timestamp
    ]
  );
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

  await run(`
    CREATE TABLE IF NOT EXISTS site_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS site_section_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      language_code TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      body TEXT,
      extra_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (section_id, language_code),
      FOREIGN KEY (section_id) REFERENCES site_sections(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS event_translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      language_code TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (event_id, language_code),
      FOREIGN KEY (event_id) REFERENCES events(id)
    )
  `);

  for (const event of initialEvents) {
    const existingEvent = await get(
      `
        SELECT id
        FROM events
        WHERE slug = ?
      `,
      [event.slug]
    );

    if (!existingEvent) {
      await run(
        `
          INSERT INTO events (title, slug, date, location, description)
          VALUES (?, ?, ?, ?, ?)
        `,
        [event.title, event.slug, event.date, event.location, event.description]
      );
    }
  }

  const events = await all(
    `
      SELECT id, slug, title, location, description
      FROM events
    `
  );

  for (const event of events) {
    const enTranslation = await get(
      `
        SELECT id
        FROM event_translations
        WHERE event_id = ? AND language_code = ?
      `,
      [event.id, "en"]
    );

    if (!enTranslation) {
      await insertEventTranslation(event.id, "en", {
        title: event.title,
        location: event.location,
        description: event.description
      });
    }

    const esTranslation = await get(
      `
        SELECT id
        FROM event_translations
        WHERE event_id = ? AND language_code = ?
      `,
      [event.id, "es"]
    );

    if (!esTranslation) {
      await insertEventTranslation(
        event.id,
        "es",
        initialEventSpanishTranslations[event.slug] || {
          title: event.title,
          location: event.location,
          description: event.description
        }
      );
    }
  }

  for (const [sectionKey, translations] of Object.entries(initialSiteSections)) {
    let section = await get(
      `
        SELECT id
        FROM site_sections
        WHERE section_key = ?
      `,
      [sectionKey]
    );

    if (!section) {
      const timestamp = new Date().toISOString();
      const insertResult = await run(
        `
          INSERT INTO site_sections (section_key, created_at, updated_at)
          VALUES (?, ?, ?)
        `,
        [sectionKey, timestamp, timestamp]
      );

      section = {
        id: insertResult.lastID
      };
    }

    for (const languageCode of ["en", "es"]) {
      const translation = await get(
        `
          SELECT id
          FROM site_section_translations
          WHERE section_id = ? AND language_code = ?
        `,
        [section.id, languageCode]
      );

      if (!translation) {
        await insertSiteSectionTranslation(
          section.id,
          languageCode,
          translations[languageCode]
        );
      }
    }
  }
}

export default database;
