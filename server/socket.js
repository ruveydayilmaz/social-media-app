var https = require('https');
const { createNotification } = require('./controllers/notifications');

const socket = (server) => {

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
        
                const notification = {
                    contents: {en: `${sender} ${text}`},
                    include_external_user_ids: [receiver],  // receiver's id (from user table)
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
}

module.exports = socket;