const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;

function hasWhitespace(value) {
  return value.split("").some((character) => character.trim() === "");
}

function isValidEmail(email) {
  if (typeof email !== "string") {
    return false;
  }

  const normalizedEmail = email.trim();
  if (!normalizedEmail || normalizedEmail.length > MAX_EMAIL_LENGTH || hasWhitespace(normalizedEmail)) {
    return false;
  }

  const atIndex = normalizedEmail.indexOf("@");
  if (atIndex <= 0 || atIndex !== normalizedEmail.lastIndexOf("@")) {
    return false;
  }

  const localPart = normalizedEmail.slice(0, atIndex);
  const domain = normalizedEmail.slice(atIndex + 1);
  if (!localPart || !domain || domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }

  const domainParts = domain.split(".");
  return domainParts.length >= 2 && domainParts.every(Boolean);
}

function isValidPassword(password) {
  return typeof password === "string" && password.length >= MIN_PASSWORD_LENGTH;
}

function parseOptionalDate(value) {
  if (!value) {
    return { value: undefined };
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { error: "La fecha no es valida" };
  }

  return { value: date };
}

module.exports = {
  MIN_PASSWORD_LENGTH,
  MAX_EMAIL_LENGTH,
  isValidEmail,
  isValidPassword,
  parseOptionalDate,
};
