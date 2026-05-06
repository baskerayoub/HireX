/**
 * Generic request validation middleware factory.
 * @param {Object} schema - Object with field names as keys and validator functions as values
 *   Each validator returns null if valid, or an error message string if invalid.
 * @param {string} source - 'body', 'query', or 'params'
 */
function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = req[source];
    const errors = {};

    for (const [field, validator] of Object.entries(schema)) {
      const error = validator(data[field], data);
      if (error) {
        errors[field] = error;
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }

    next();
  };
}

// Common validators
const required = (fieldName) => (value) =>
  !value || (typeof value === "string" && !value.trim())
    ? `${fieldName} is required`
    : null;

const isEmail = (value) => {
  if (!value) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? null : "Invalid email format";
};

const minLength = (fieldName, min) => (value) => {
  if (!value) return `${fieldName} is required`;
  return value.length >= min ? null : `${fieldName} must be at least ${min} characters`;
};

const isDate = (fieldName) => (value) => {
  if (!value) return `${fieldName} is required`;
  return isNaN(Date.parse(value)) ? `${fieldName} must be a valid date` : null;
};

const isOptionalDate = (fieldName) => (value) => {
  if (!value) return null;
  return isNaN(Date.parse(value)) ? `${fieldName} must be a valid date` : null;
};

module.exports = { validate, required, isEmail, minLength, isDate, isOptionalDate };
