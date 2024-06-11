module.exports.config = {
    name: "ai",
    version: "1.1.0",
    hasPermssion: 0,
    credits: "VulnSec Legion", // modified by VulnSec Legion
    description: "Ai GPT4",
    commandCategory: "ai",
    usages: "[ask]",
    usePrefix: false,
    cooldowns: 2,
};

module.exports.run = async function({ api, event, args }) {
    const axios = require("axios");
    let { messageID, threadID, senderID } = event;
    let tid = threadID,
        mid = messageID;
    const content = args.join(" ");
    if (!content) return api.sendMessage("Please type a question for AI...", tid, mid);

    try {
        api.setMessageReaction("🔍", event.messageID, (err) => {}, true);
        api.sendMessage("🔍AI is searching for an answer, please wait...", threadID, messageID);

        const res = await axios.get(`http://172.81.128.14:20826/api/gpt?prompt=${encodeURIComponent(senderID)}&msg=${encodeURIComponent(content)}`);

        // Log the entire response to inspect its structure
        console.log("Full response:", JSON.stringify(res.data, null, 2));

        // Extract the response message
        const respond = res.data.cnt;

        if (!respond) {
            api.sendMessage("Could not find a valid response in the API response.", tid, mid);
        } else {
            api.setMessageReaction("✅", event.messageID, (err) => {}, true);
            api.sendMessage('🖇 Answer: ' + respond, tid, (error, info) => {
                if (error) {
                    console.error(error);
                }
            }, mid);
        }
    } catch (error) {
        console.error(error);
        api.sendMessage("An error occurred while fetching the data.", tid, mid);
    }
};
