const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_PATTERN.test(email.trim());
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
  isValidEmail,
  isValidPassword,
  parseOptionalDate,
};
