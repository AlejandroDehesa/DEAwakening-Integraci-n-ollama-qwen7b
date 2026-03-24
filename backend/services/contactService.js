export function fetchContactInfo() {
  return {
    email: "hello@deawakening.com",
    message:
      "Use this endpoint to send collaboration requests, event questions or general enquiries."
  };
}

export function validateContactPayload(payload) {
  const name = payload?.name?.trim();
  const email = payload?.email?.trim();
  const message = payload?.message?.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || name.length < 2) {
    return "Name must be at least 2 characters long";
  }

  if (!email || !emailPattern.test(email)) {
    return "A valid email is required";
  }

  if (!message || message.length < 10) {
    return "Message must be at least 10 characters long";
  }

  return null;
}
