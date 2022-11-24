const NotificationModel = require("../models/notification");

const createNotification = async ({sender, receiver, type}) => {
  const newChat = new NotificationModel({
    sender: sender,
    receiver: receiver,
    notification: type
  });
  try {
    const result = await newChat.save();
    return result;
  } catch (error) {
    console.log(error);
  }
};

const userNotifications = async (req, res) => {
  try {
    const notifications = await NotificationModel.findById(req.params.id);
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { createNotification, userNotifications };