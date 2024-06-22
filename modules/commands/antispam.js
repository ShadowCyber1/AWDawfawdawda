const num = 8; // number of times spam gets banned -1, for example, 7 times means 8 times will get banned
const timee = 120; // During `timee` seconds, spam `num` times will be banned

module.exports.config = {
  name: "antispam",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "VulnSec Legion",
  description: `Automatically kick users if they spam ${num} times/${timee}s`,
  usePrefix: true,
  commandCategory: "System",
  usages: "x",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage(`Automatically kick users if they spam ${num} times/${timee}s`, event.threadID, event.messageID);
};

module.exports.handleEvent = async function ({ Users, Threads, api, event }) {
  let { senderID, threadID, body } = event;

  if (!global.client.antispam) global.client.antispam = {};

  if (!global.client.antispam[senderID]) {
    global.client.antispam[senderID] = {
      timeStart: Date.now(),
      messages: [],
    };
  }

  const threadSetting = global.data.threadData.get(threadID) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;
  if (!body || body.indexOf(prefix) === 0) return;

  const currentTime = Date.now();
  global.client.antispam[senderID].messages.push({ body, time: currentTime });

  // Clean up old messages
  global.client.antispam[senderID].messages = global.client.antispam[senderID].messages.filter(
    (msg) => currentTime - msg.time <= timee * 1000
  );

  // Check for spamming behavior
  if (global.client.antispam[senderID].messages.length >= num) {
    // Check for repeated messages
    const messageCount = global.client.antispam[senderID].messages.reduce((count, msg) => {
      count[msg.body] = (count[msg.body] || 0) + 1;
      return count;
    }, {});

    const isSpam = Object.values(messageCount).some((count) => count >= num);

    if (isSpam) {
      try {
        var datathread = (await Threads.getData(threadID)).threadInfo;
        var namethread = datathread.threadName;
        const moment = require("moment-timezone");
        const timeDate = moment.tz("Asia/Manila").format("DD/MM/YYYY HH:mm:ss");
        let dataUser = await Users.getData(senderID) || {};
        let data = dataUser.data || {};
        if (data && data.banned === true) return;

        // Kick the user from the group chat
        api.removeUserFromGroup(senderID, threadID, async (err) => {
          if (err) {
            console.error(`Failed to remove user ${senderID} from thread ${threadID}:`, err);
          } else {
            data.banned = true;
            data.reason = `spam bot ${num} times/${timee}s` || null;
            data.dateAdded = timeDate;
            await Users.setData(senderID, { data });
            global.data.userBanned.set(senderID, { reason: data.reason, dateAdded: data.dateAdded });
            global.client.antispam[senderID] = {
              timeStart: Date.now(),
              messages: [],
            };
            api.sendMessage(
              senderID + " \n⚡️Name: " + dataUser.name + `\n⚡Reason: spam bot ${num} times/${timee}s\n\n✔️User has been removed from the group`,
              threadID,
              () => {
                var idad = global.config.ADMINBOT;
                for (let ad of idad) {
                  api.sendMessage(
                    `⚡️Spam offenders ${num} times/${timee}s\n⚡️Name: ${dataUser.name} \n⚡️ID: ${senderID}\n⚡️ID Box: ${threadID} \n⚡️NameBox: ${namethread} \n⚡️Time: ${timeDate}`,
                    ad
                  );
                }
              }
            );
          }
        });
      } catch (err) {
        console.error(`Failed to process spam for user ${senderID} in thread ${threadID}:`, err);
      }
    }
  }
};
