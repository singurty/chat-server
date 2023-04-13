import { Request, Response } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import bodyParser = require('body-parser');

import { SignUp } from './auth';

require('dotenv').config();

const express = require('express');
const app = express();

app.use(bodyParser.urlencoded());

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
        await SignUp(username, password);
        res.status(200).send({ message: 'User created' });
    }
    catch (err: any) {
        res.status(500).send({ message: `Error creating user: ${err}` });
    }
})