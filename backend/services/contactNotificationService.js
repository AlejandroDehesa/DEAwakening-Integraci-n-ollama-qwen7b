import nodemailer from "nodemailer";

const DEFAULT_CONTACT_RECEIVER = "resosense@gmail.com";
const TRUE_ENV_VALUES = new Set(["1", "true", "yes", "on"]);

function createContactEmailError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw createContactEmailError(
      "CONTACT_EMAIL_CONFIG_MISSING",
      `Missing required environment variable: ${name}`
    );
  }

  return value.trim();
}

function isContactEmailRequired() {
  const rawValue = process.env.CONTACT_EMAIL_REQUIRED;

  if (typeof rawValue === "string" && rawValue.trim()) {
    return TRUE_ENV_VALUES.has(rawValue.trim().toLowerCase());
  }

  return String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

function getMailerConfig() {
  const host = getRequiredEnv("SMTP_HOST");
  const portRaw = getRequiredEnv("SMTP_PORT");
  const receiver = (process.env.CONTACT_RECEIVER || DEFAULT_CONTACT_RECEIVER).trim();
  const user = (process.env.SMTP_USER || receiver).trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  const port = Number(portRaw);

  if (!Number.isInteger(port) || port <= 0) {
    throw createContactEmailError(
      "CONTACT_EMAIL_CONFIG_MISSING",
      "SMTP_PORT must be a valid positive integer"
    );
  }

  if (!user) {
    throw createContactEmailError(
      "CONTACT_EMAIL_CONFIG_MISSING",
      "Missing required environment variable: SMTP_USER or CONTACT_RECEIVER"
    );
  }

  if (!pass) {
    throw createContactEmailError(
      "CONTACT_EMAIL_CONFIG_MISSING",
      "Missing required environment variable: SMTP_PASS"
    );
  }

  return {
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: {
      user,
      pass
    },
    from: (process.env.CONTACT_FROM || user).trim(),
    to: receiver
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendContactNotification(payload) {
  let config;

  try {
    config = getMailerConfig();
  } catch (error) {
    if (
      error?.code === "CONTACT_EMAIL_CONFIG_MISSING" &&
      !isContactEmailRequired()
    ) {
      console.warn(`[contact-email] Skipping email notification: ${error.message}`);
      return {
        delivered: false,
        skipped: true,
        reason: error.message
      };
    }

    throw error;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  const submittedAt = payload.createdAt || new Date().toISOString();
  const subject = `Nuevo contacto DEAwakening - ${payload.name}`;
  const text = [
    "Nuevo mensaje de contacto",
    "",
    `Nombre: ${payload.name}`,
    `Email: ${payload.email}`,
    `Fecha: ${submittedAt}`,
    "",
    "Mensaje:",
    payload.message
  ].join("\n");

  const html = `
    <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin: 0 0 12px;">Nuevo mensaje de contacto</h2>
      <p style="margin: 0 0 8px;"><strong>Nombre:</strong> ${escapeHtml(payload.name)}</p>
      <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
      <p style="margin: 0 0 16px;"><strong>Fecha:</strong> ${escapeHtml(submittedAt)}</p>
      <p style="margin: 0 0 8px;"><strong>Mensaje:</strong></p>
      <div style="white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px;">
        ${escapeHtml(payload.message)}
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: config.from,
      to: config.to,
      replyTo: payload.email,
      subject,
      text,
      html
    });

    return {
      delivered: true,
      skipped: false
    };
  } catch (error) {
    throw createContactEmailError(
      "CONTACT_EMAIL_SEND_FAILED",
      `Failed to send contact notification: ${error?.message || "unknown_error"}`
    );
  }
}
