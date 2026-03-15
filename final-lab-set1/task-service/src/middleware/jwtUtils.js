const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'secret';

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { verifyToken };