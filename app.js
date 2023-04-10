require('dotenv').config();

const express = require('express');
const app = express();


app.listen(process.env.PORT, () => console.log(`Chat server listening on port ${process.env.PORT}!`));

app.use(express.static('../chat/dist'))