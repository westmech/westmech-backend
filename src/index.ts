import express from 'express';
import router from './routes/router';
import dotenv from 'dotenv';
import process from 'process';
import cookieParser from 'cookie-parser'
import session from 'express-session';
import passport from 'passport'; // passport takes care of mapping the user that is logging in with their sessionID
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import { localSessionStrategy, serializeUserFunction, deserializeUserFunction } from "./strategies/local-strategy";
import { jwtStrategy } from './strategies/jwt-auth';

const app = express();

// Load environment variables from .env file 
dotenv.config();

// connecting to mongodb
mongoose.connect(`${process.env.DB_CONNECTION_STRING}`)
        .then(() => console.log(`Connected to DB: ${process.env.DB_CONNECTION_STRING}`))
        .catch((err) => console.log(`Error: ${err}`));

// automatically parses incoming JSON data, available in req.body
app.use(express.json());

// middleware for parsing signed cookies
app.use(cookieParser("secret"));

// using sessions to authenticate
if (process.env.AUTHENTICATION_STRATEGY === "SESSION") {
    const sessionSecret = process.env.SESSION_SECRET || 'default-secret';

    app.use(session({
        secret: sessionSecret,
        saveUninitialized: false, // doesn't save unintialized session objects in the session store
        resave: false,
        cookie: {
            maxAge: 60000 / 6 // how long the cookies live in milliseconds
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient()
        })
    }));

    // passport session middleware
    app.use(passport.initialize()); 
    app.use(passport.session());
    passport.use(localSessionStrategy);
    passport.serializeUser(serializeUserFunction);
    passport.deserializeUser(deserializeUserFunction);
}

// using jwt to authenticate
if (process.env.AUTHENTICATION_STRATEGY == "JWT") {
    passport.use(jwtStrategy);
}

// For all '/' routes, use the routes defined in router
app.use("/", router);

const PORT = process.env.PORT || "8000";

app.listen(PORT, () => {
    console.log(PORT);
    // console.log(process.env.SESSION_SECRET);
    console.log(`Running on Port ${process.env.PORT}`);
});
