import jwt from 'jsonwebtoken';

export function generateTokenPair(user) {
  const payload = { id: user._id, role: user.role, email: user.email };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d' });
  return { accessToken, refreshToken };
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
