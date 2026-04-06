import jwt from "jsonwebtoken";

export const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // role check
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};
