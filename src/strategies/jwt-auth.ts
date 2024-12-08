import { Strategy as JwtStrategy, StrategyOptions } from "passport-jwt";
import { Request } from "express";
import { User } from "../mongoose/schemas/user";
import { comparePassword } from "../utils/helper";

// add fields here if needed
interface jwtPayloadType {
    username: string,
    password: string,
    id?: string
}

// helper function to extract jwt token from req
const cookieExtractor = (req: Request) => {
    let token = null;

    if (req && req.cookies) {
        token = req.cookies["jwt"];
    }

    return token;
}

// options for the jwt verify function
const options: StrategyOptions = {
    secretOrKey: process.env.JWT_SECRET || "default_jwt_secret", // string containing the secret
    jwtFromRequest: cookieExtractor,
};

export const jwtStrategy = new JwtStrategy(options, async (jwtPayload: jwtPayloadType, done) => {
    const { username, password, id } = jwtPayload;
    try {
        // findOne basically queries the db and uses the object param to query by, we're querying by username
        const findUser = await User.findOne({ username });
        if (!findUser) throw new Error("User not found");
        if (!comparePassword(password, findUser.password)) throw new Error("Invalid Credentials");

        console.log(findUser);
        // if user is found and password is correct
        done(undefined, findUser);
    } catch (err) {
        // user not found or password not correct
        done(err, undefined);
    }
});



