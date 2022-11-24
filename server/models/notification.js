const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    sender: {
        type: String
    },
    receiver: {
        type: String
    },
    notification: {
        type: String
    }
 },
 {
    timestamps: true
});

const NotificationModel = mongoose.model("Notification", notificationSchema)
module.exports = NotificationModel