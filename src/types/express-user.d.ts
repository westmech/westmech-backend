import { ObjectId } from "mongoose";
import passport from "passport"

declare global {
    namespace Express {
        interface User {
            // mongoose casts _id to id in the user obj returned from the db - smth like that
            id?: string | ObjectId;
        }
    }
}