/**
 * @param {Object} event
 * @returns {Object} JSON Object
 * @throws {Error}
 */

function getBody(event) {
  if (!event || typeof event !== "object") {
    throw new Error("invalid lambda event");
  }

  const hasBody = Reflect.has(event, "body");

  if (!hasBody) {
    throw new Error("event does not have a body property");
  }

  try {
    return JSON.parse(event.body);
  } catch (error) {
    throw new Error("body not a vaild json");
  }
}

module.exports = getBody;
