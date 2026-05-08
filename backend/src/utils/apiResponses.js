const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  AUTH_INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  AUTH_MISSING_CREDENTIALS: "AUTH_MISSING_CREDENTIALS",
  DUPLICATE_USER: "DUPLICATE_USER",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EVENT_NOT_FOUND: "EVENT_NOT_FOUND",
  INVALID_EVENT_ID: "INVALID_EVENT_ID",
  EVENT_ALREADY_JOINED: "EVENT_ALREADY_JOINED",
  EVENT_FULL: "EVENT_FULL",
  EVENT_CREATOR_CANNOT_JOIN: "EVENT_CREATOR_CANNOT_JOIN",
  EVENT_FORBIDDEN: "EVENT_FORBIDDEN",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

function buildErrorBody(message, code = ERROR_CODES.VALIDATION_ERROR, details = undefined) {
  return {
    message,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}

function buildSuccessBody(message, extraBody = {}) {
  return { message, ...extraBody };
}

function serviceResponse(status, message, extraBody = {}, code) {
  if (status >= 400) {
    return { status, body: buildErrorBody(message, code, extraBody.details) };
  }

  return { status, body: buildSuccessBody(message, extraBody) };
}

module.exports = {
  ERROR_CODES,
  buildErrorBody,
  buildSuccessBody,
  serviceResponse,
};
