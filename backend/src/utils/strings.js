function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateRequiredFields(payload, fields) {
  return fields.filter((field) => !normalizeString(payload[field]));
}

module.exports = { normalizeString, validateRequiredFields };
