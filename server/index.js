require('dotenv').config()

// routes
const router = require('./routes/notification');

const express = require("express");

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const http = require('http');
const socket = require('./socket');

const app = express();
const server = http.createServer(app);

socket(server);

// middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// routes
app.use('/notification', router);

app.get('/', (req, res) => {
    res.send('Hello World');
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(PORT, () => console.log(`Listening at Port ${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));