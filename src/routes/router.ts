import { Request, Response, NextFunction, Router } from "express";
import passport from 'passport';
import "../strategies/local-strategy"
import testData from "../test-data/test-data";
import { User } from "../mongoose/schemas/user"
import { query, validationResult, checkSchema, matchedData } from "express-validator"; // methods to help us validate the user's request 
import { createUserValidationSchema } from "../utils/validationSchema";
import { hashPassword } from "../utils/helper";
const router = Router();

// function to check if user is authenticated
const isUserAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    switch (process.env.AUTHENTICATION_STRATEGY) {
        case "JWT":
            passport.authenticate("jwt", { session: false }, async (error: any, user: any) => {
                if (error || !user) {
                    res.status(401).send({error: "User is Unauthenticated"});
                }

                req.user = user;
                next();
            })
        case "SESSIONS":
            if (req.isAuthenticated()) { 
                next();
            } else {
                res.status(401).send({error: "User is Unauthenticated"});
            }
    }
}

// when passport.authenticate succeeds, will set req.user propert for authenticated user, login session established, next function is called
router.post("/login", passport.authenticate("local"), (req, res) => {
    res.sendStatus(200);
});

// gets login status
router.get("/login/status", (req, res) => {
    console.log("Inside login status endpoint");
    console.log(req.user);
    console.log(req.session);
    req.user ? res.send(req.user) : res.sendStatus(401);
});

// add a new user
router.post("/add/user", checkSchema(createUserValidationSchema), async (req: Request, res: Response) => {
    // validationResult extracts validation results from a request, wrapes them in a Result obj and returns it. use result to figure out if request is valid or not
    const result = validationResult(req);

    // if result is empty, there are no errors
    if (result.isEmpty()) {
        // grabs all validated fiels
        const data = matchedData(req);
        console.log(data);

        // hashes raw password
        data.password = hashPassword(data.password);
        console.log(data);

        // newUser is of type Document which is an instance of its Model - https://mongoosejs.com/docs/documents.html
        const newUser = new User(data);
        try {
            // saves user in mongodb
            const savedUser = await newUser.save();
            res.status(200).send(savedUser);
        } catch (err) {
            console.log(err);
            res.status(400).send(err); 
        }
    } else {
        // if result is not empty, there are errors
        res.status(400).send(result.array());
    }
});

// endpoint to create a JWT token
router.get("/createToken", (req, res) => {

});

// router.post("/login", (req, res) => {
//     // Authenticate user

//     const { body : { username, password } } = req;
//     const findUser = testData.find((user) => user.username === username);

//     if (!findUser || findUser.password !== password) {
//         res.status(401).send({ msg: "Bad Credentials"});
//     }

//     // As soon as we modify the session object, it sets the cookie and sends it back to the client
//     req.session.user = findUser;
//     res.status(200).send(findUser);
// })

// router.get("/login/status", (req, res) => {
//     req.sessionStore.get(req.sessionID, (err, session) => {
//         console.log(session);
//     });

//     req.session.user ? res.status(200).send(req.session.user) : res.status(401).send({msg: "Not Authenticated"});
// })

router.get("/", isUserAuthenticated, (req, res) => {
    res.send({msg: "Hello World"});
})


export default router;