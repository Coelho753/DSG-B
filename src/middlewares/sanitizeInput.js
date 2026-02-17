const sanitize = (value) => {
  if (typeof value === 'string') {
    return value.replace(/[<>$]/g, '').trim();
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value && typeof value === 'object') {
    const sanitizedObj = {};
    Object.keys(value).forEach((key) => {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitizedObj[key] = sanitize(value[key]);
      }
    });
    return sanitizedObj;
  }
  return value;
};

const sanitizeInput = (req, res, next) => {
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

module.exports = sanitizeInput;
