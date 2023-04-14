import { Request, Response } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import bodyParser = require('body-parser');
import session from 'express-session'

import { SignUp, SignIn } from './auth';

require('dotenv').config();

const express = require('express');
const app = express();

declare module 'express-session' {
    interface SessionData {
        username: string;
    }
}

app.use(bodyParser.urlencoded());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 86400 * 100 },
    saveUninitialized: false
}))

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, <ConnectOptions>{ useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
    } catch(err: any) {
        console.log("Error connecting to MongoDB", err);
        process.exit(1);
    };
}
dbConnect();

app.listen(process.env.PORT, () => console.log(`Chat server listening on port ${process.env.PORT}!`));

app.use(express.static('../chat/dist'))

app.post('/api/signup', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await SignUp(username, password);
        req.session.regenerate(function(err: any) {
            if (err) throw new Error('Error creating session');
            req.session.username = username;
        })
        req.session.save(function(err: any) {
            if (err) throw new Error('Error saving session');
            res.status(200).redirect('/');
        })
    } catch (err: any) {
        res.status(500).send({ message: `Error creating user: ${err}` });
    }
})

app.post('/api/signin', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await SignIn(username, password);
        req.session.regenerate(function(err: any) {
            if (err) throw new Error('Error creating session');
            req.session.username = username;
        })
        req.session.save(function(err: any) {
            if (err) throw new Error('Error saving session');
            res.status(200).redirect('/');
        })
    } catch (err: any) {
        res.status(500).send({ message: `Error signing in user: ${err}` });
    }
})