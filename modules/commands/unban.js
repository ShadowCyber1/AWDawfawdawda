module.exports.config = {
  name: "unban",
  version: "1.0.0",
  hasPermssion: 2, // Only admins can use this command
  credits: "VulnSec Legion",
  description: "Unban a user by tagging them",
  commandCategory: "System",
  usages: "[tag]",
  cooldowns: 5,
  usePrefix: true // Specify whether to use the bot's prefix or not
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, body, mentions } = event;

  // Check if there is at least one mentioned user
  if (Object.keys(mentions).length === 0) {
    // If no user is tagged, show usage instructions
    return api.sendMessage(
      "Please tag the user you want to unban.\n\nUsage: .unban @username",
      threadID,
      messageID
    );
  }

  const userID = Object.keys(mentions)[0]; // Get the first tagged user

  // Retrieve user data
  let dataUser = await Users.getData(userID) || {};
  let data = dataUser.data || {};

  if (data && data.banned) {
    // If the user is banned, unban them
    data.banned = false;
    delete data.reason;
    delete data.dateAdded;
    await Users.setData(userID, { data });
    global.data.userBanned.delete(userID);

    // Send success message and change reaction to check mark
    api.sendMessage(`User ${mentions[userID].replace("@", "")} has been successfully unbanned. ✅`, threadID, () => {
      api.react(messageID, "🔍"); // Change the reaction to a check mark
    });
  } else {
    // If the user is not banned, inform the user
    api.sendMessage(`User ${mentions[userID].replace("@", "")} is not banned.`, threadID, messageID);
  }
};
