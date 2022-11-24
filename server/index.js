require('dotenv').config()

// routes
const router = require('./routes/notification');

const express = require("express");

const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const http = require('http');
const { createNotification } = require('./controllers/notifications');

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
    cors: {
      origin: "http://127.0.0.1:5173",
    },
});

let users = [];

const addNewUser = (socketId, username) => {
    !users.some((user) => user.username === username) && users.push({socketId, username});
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
}

const getUser = (username) => {
    return users.find((user) => user.username === username);
}

io.on("connection", (socket) => {
    console.log("a user connected");

    socket.on("add-user", (username) => {
        addNewUser(socket.id, username);
        io.emit("get-users", users);

        console.log(users);
    });

    socket.on("notification", ({sender, receiver, type}) => {
        const receiverName = getUser(receiver);

        console.log(receiverName);
        io.to(receiverName.socketId).emit("get-notification", {sender, type});

        createNotification({sender, receiver, type});
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
        removeUser(socket.id);
        io.emit("get-users", users);
    });
});

// middleware
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// routes
app.use('/notification', router);

app.get('/', (req, res) => {
    res.send('Hello World');
});

mongoose
  .connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => server.listen(5000, () => console.log(`Listening at Port 5000`)))
  .catch((error) => console.log(`${error} did not connect`));