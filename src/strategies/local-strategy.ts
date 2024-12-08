import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../mongoose/schemas/user"
import testData from "../test-data/test-data";
import { comparePassword } from "../utils/helper";

// transforms the user object into a format that can be stored in a session or a toke    
export const serializeUserFunction = (user: Express.User, done: (err: any, id?: unknown) => void) => {
    console.log(`Inside Serialize User`);
    console.log(user);
    console.log(typeof user.id);
    done(null, user.id);
};

// retrieves the user object from the session or token
export const deserializeUserFunction = async (id: string, done: (err: any, user?: false | Express.User | null | undefined) => void) => {
    console.log(`Inside Deserializer`);
    console.log(`Deserializing id: ${id}`);
    console.log(typeof id);


    try {
        const findUser = await User.findById(id);
        if (!findUser) throw new Error("User Not Found");
        done(null, findUser);
    } catch(err) {
        done(err, null);
    }
};

// login route first comes here
export const localSessionStrategy = 
    // passport will look for the username and password at the endpoint that takes care of auth
    new Strategy(async (username, password, done) => {  
        console.log(`Username is: ${username}`);
        console.log(`Password is: ${password}`);
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
    }
);
