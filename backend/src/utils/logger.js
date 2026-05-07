function write(stream, level, message, details) {
  const suffix = details ? ` ${details}` : "";
  stream.write(`[${level}] ${message}${suffix}\n`);
}

function formatDetails(details) {
  if (!details) {
    return "";
  }

  if (details instanceof Error) {
    return details.stack || details.message;
  }

  return String(details);
}

const logger = {
  info(message) {
    write(process.stdout, "info", message);
  },
  error(message, details) {
    write(process.stderr, "error", message, formatDetails(details));
  },
};

module.exports = { logger };
