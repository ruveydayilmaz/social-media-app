const {Server} = require('socket.io');

const io = new Server({
    cors: {
        origin: "*"
    }
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
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
        removeUser(socket.id);
        io.emit("get-users", users);
    });
});

io.listen(5000);