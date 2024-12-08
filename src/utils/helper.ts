import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const saltRounds = 10;

// helper function to hash password using bcrypt algo
export const hashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    return bcrypt.hashSync(password, salt);
}

// returns true if the plain and hashed passwords are the same, false if not
export const comparePassword = (plain: string, hashed: string) => {
    return bcrypt.compareSync(plain, hashed);
}

// generating a new json web token
export const generateJWT = (id: string) => {
    const payload = { id };
    const options = { expiresIn: '1h' };
    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
    return jwt.sign(payload, jwtSecret, options);
}

