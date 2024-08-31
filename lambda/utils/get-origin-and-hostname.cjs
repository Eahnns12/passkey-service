/**
 * @param {Object} event
 * @returns {Object} origin and hostname
 * @throws {Error}
 */

function getOriginAndHostname(event) {
  if (!event || typeof event !== "object") {
    throw new Error("invalid lambda event");
  }

  const hasHeaders = Reflect.has(event, "headers");

  if (!hasHeaders) {
    throw new Error("event does not have a headers property");
  }

  const hasOrigin = Reflect.has(event.headers, "origin");

  if (!hasOrigin) {
    throw new Error("event does not have a origin property");
  }

  try {
    const origin = event.headers.origin;
    const hostname = new URL(origin).hostname;
    return { origin, hostname };
  } catch (error) {
    throw new Error("invalid origin url");
  }
}

module.exports = getOriginAndHostname;
