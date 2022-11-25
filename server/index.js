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

const sendNotification = (data) => {
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: "Bearer token=" + process.env.ONESIGNAL_API_KEY
    };

    var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
    };

    var https = require('https');
    var req = https.request(options, function(res) {
        res.on('data', function(data) {
            console.log("Response:");
            console.log(JSON.parse(data));
        });
    });

    req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
    });

    req.write(JSON.stringify(data));
    req.end();
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

        if(receiverName) {
            console.log(receiverName);
            io.to(receiverName.socketId).emit("get-notification", {sender, type});
            createNotification({sender, receiver, type});
        } else {
            console.log("user not online");
            var text = "";
            type === 1 ? text = "liked your post" : text = "commented on your post";
    
            // if user is not online, send push notification
            const notification = {
                contents: {en: `${sender} ${text}`},
                included_segments: ["All"], // i'll change this to specific user
                app_id: process.env.ONESIGNAL_APP_ID,
            };
    
            sendNotification(notification);
        }
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