import { Request, Response } from 'express';
import mongoose, { ConnectOptions } from 'mongoose';
import bodyParser = require('body-parser');
import session from 'express-session';
import MongoStore from 'connect-mongo';

import { SignUp, SignIn, IUser, User } from './auth';
import { IMessage, IChannel, Channel, CreateChannel, GetChannelsForUser, SendMessage } from './chat';

require('dotenv').config();

const express = require('express');
const app = express();

declare module 'express-session' {
    interface SessionData {
        username: string;
    }
}

mongoose.connect(process.env.MONGO_URI, <ConnectOptions>{ useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err: any) => {
        console.log('Error connecting to MongoDB', err)
    });

app.use(bodyParser.urlencoded());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 86400 * 100 },
    saveUninitialized: false,
    store: MongoStore.create({ client: mongoose.connection.getClient() })
}))

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

app.get('/api/signout', (req: Request, res: Response) => {
    req.session.destroy(function(err: any) {
        if (err) {
            res.status(500).send({ message: 'Error signing out user' });
        } else {
            res.status(200).redirect('/');
        }
    })
})

app.get('/api/user', (req: Request, res: Response) => {
    if (req.session.username) {
        res.status(200).send({ username: req.session.username });
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
});

app.post('/api/createchannel', (req: Request, res: Response) => {
    if (req.session.username) {
        const { name } = req.body;
         User.findOne({ username: req.session.username })
            .then((user: IUser) => {
                CreateChannel(name, [user])
                    .then((channel) => {
                        res.status(200).send({ channel: channel });
                    })
                    .catch((err: any) => {
                        res.status(500).send({ message: `Error creating channel: ${err}` });
                    })
                })
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
})

app.get('/api/channels', (req: Request, res: Response) => {
    if (req.session.username) {
        User.findOne({ username: req.session.username })
            .then((user: IUser) => {
                GetChannelsForUser(user)
                    .then((channels) => {
                        res.status(200).send({ channels: channels });
                    })
                    .catch((err: any) => {
                        res.status(500).send({ message: `Error getting channels: ${err}` });
                    })
                })
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
})

app.post('/api/sendmessage', async (req: Request, res: Response) => {
    if (req.session.username) {
        const { channelID, message } = req.body;
        try {
            const user = await User.findOne({ username: req.session.username })
            const channel = await Channel.findById(channelID);
            console.log(channel);
            SendMessage(channel, user, message)
            res.status(200).send({ message: message });
        } catch (err: any) {
            res.status(500).send({ message: `Error sending message: ${err}` });
        }
    } else {
        res.status(401).send({ message: 'Unauthorized' });
    }
})