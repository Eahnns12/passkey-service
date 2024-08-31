/**
 * @param {Function} fn
 * @param {Zod.Schema} schema
 * @returns {Function}
 */
function validate(fn, schema) {
  return (params) => {
    const validatedData = schema.parse(params);
    return fn(validatedData);
  };
}

module.exports = validate;
