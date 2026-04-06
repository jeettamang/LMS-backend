import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const hashedPass = (text) => {
  return bcrypt.hashSync(text, Number(process.env.BCRYPT_SALT));
};
const comparePass = (text, hashedText) => {
  return bcrypt.compareSync(text, hashedText);
};

const generateToken = (account) => {
  if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined")
  }
  return jwt.sign(
    {
      id: account._id,
      
      role: account.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY },
  );
};
export { hashedPass, comparePass, generateToken };
