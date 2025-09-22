import jwt from 'jsonwebtoken';



// Defina a secret (pode vir de .env)
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_forte";

// Gerar token
export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
};

// Middleware de autenticação JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });

    req.user = user; // { id: ... }
    next();
  });
};
